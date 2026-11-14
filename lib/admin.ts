// Admin auth — email + password, like CodeBettle's login.
//
// - Single admin account: Muhammad Hateem Hussain. Any ONE of the three
//   allowlisted emails logs in with the SAME password (the emails are
//   aliases for one account, not three accounts).
// - The password is NEVER hardcoded and NEVER invented by the agent.
//   On first visit to /admin, Eman sets his own password (min 8 chars) on
//   /admin/setup. It is stored only as a bcrypt hash in data/admin.json
//   (local file, gitignored — never committed, never pushed).
// - Sign-in verifies the email against the allowlist and the password
//   against the bcrypt hash, and sets an httpOnly session cookie
//   (HMAC-signed with ADMIN_SESSION_SECRET from .env.local; a random
//   dev fallback is used only when the env var is absent, and sessions then
//   do not survive restarts).
// - Login errors are generic on purpose: the same message for an unknown
//   email and a wrong password.
// - No forgot-password flow exists until a backend/DB exists: if Eman
//   forgets the password, delete data/admin.json (locally) or the
//   admin_users row (Supabase) and set a new one. The UI says this plainly.
// - When the Supabase adapter lands, this record moves to admin_users
//   (name + emails + password hash); the verify/setup functions keep the
//   same signatures.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS, ADMIN_NAME } from "./admin-constants";

export { ADMIN_EMAILS, ADMIN_NAME } from "./admin-constants";

const ADMIN_PATH = path.join(process.cwd(), "data", "admin.json");
export const SESSION_COOKIE = "hateem_admin_session";

const MIN_PASSWORD_LENGTH = 8;

type AdminRecord = {
  name: string;
  emails: string[];
  passwordHash: string;
  createdAt: string;
};

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function setupCredentials(
  password: string,
  confirmPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!password || password.length < MIN_PASSWORD_LENGTH)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };
  if (await isSetup())
    return { ok: false, error: "Admin access is already set up. Use sign-in, or delete data/admin.json to reset." };
  const passwordHash = await bcrypt.hash(password, 10);
  await fs.mkdir(path.dirname(ADMIN_PATH), { recursive: true });
  await fs.writeFile(
    ADMIN_PATH,
    JSON.stringify(
      { name: ADMIN_NAME, emails: [...ADMIN_EMAILS], passwordHash, createdAt: new Date().toISOString() },
      null,
      2,
    ),
    "utf-8",
  );
  return { ok: true };
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const rec = await readAdmin();
  if (!rec) return false;
  if (!ADMIN_EMAILS.includes(normalizeEmail(email) as (typeof ADMIN_EMAILS)[number])) return false;
  if (!password) return false;
  return bcrypt.compare(password, rec.passwordHash);
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
