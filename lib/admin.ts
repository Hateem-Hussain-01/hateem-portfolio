// Admin auth — PIN-based, first-run setup by Eman himself.
//
// - The PIN is NEVER hardcoded and NEVER invented by the agent.
// - On first visit to /admin, Eman sets his own PIN (min 4 chars). It is
//   stored only as a scrypt hash + salt in data/admin.json (local file,
//   gitignored — never committed, never pushed).
// - Sign-in verifies the PIN against the hash and sets an httpOnly session
//   cookie (HMAC-signed with ADMIN_SESSION_SECRET from .env.local; a random
//   dev fallback is used only when the env var is absent, and sessions then
//   do not survive restarts).
// - No forgot-PIN flow exists until a backend/DB exists: if Eman forgets the
//   PIN, delete data/admin.json (locally) or the admin_users row (Supabase)
//   and set a new one. The UI says this plainly.
// - When the Supabase adapter lands, admin_users.pin_hash replaces
//   data/admin.json; the verify/setup functions keep the same signatures.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const ADMIN_PATH = path.join(process.cwd(), "data", "admin.json");
export const SESSION_COOKIE = "hateem_admin_session";

type AdminRecord = { pinHash: string; salt: string; createdAt: string };

export async function isSetup(): Promise<boolean> {
  try {
    await fs.access(ADMIN_PATH);
    return true;
  } catch {
    return false;
  }
}

async function readAdmin(): Promise<AdminRecord | null> {
  try {
    return JSON.parse(await fs.readFile(ADMIN_PATH, "utf-8")) as AdminRecord;
  } catch {
    return null;
  }
}

export async function setupPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!pin || pin.length < 4) return { ok: false, error: "PIN must be at least 4 characters." };
  if (await isSetup()) return { ok: false, error: "Admin PIN is already set. Use sign-in, or delete data/admin.json to reset." };
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(pin, salt, 64)) as Buffer;
  await fs.mkdir(path.dirname(ADMIN_PATH), { recursive: true });
  await fs.writeFile(
    ADMIN_PATH,
    JSON.stringify({ pinHash: hash.toString("hex"), salt, createdAt: new Date().toISOString() }, null, 2),
    "utf-8",
  );
  return { ok: true };
}

export async function verifyPin(pin: string): Promise<boolean> {
  const rec = await readAdmin();
  if (!rec) return false;
  const hash = (await scrypt(pin, rec.salt, 64)) as Buffer;
  const expected = Buffer.from(rec.pinHash, "hex");
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me";
}

export function signSession(): string {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [payload, sig] = decoded.split(".");
    if (!payload?.startsWith("admin:") || !sig) return false;
    const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
