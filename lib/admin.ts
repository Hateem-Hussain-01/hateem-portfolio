// Admin auth — email + password, like CodeBettle's login.
//
// - Single admin account: Muhammad Hateem Hussain. Any ONE of the three
//   allowlisted emails logs in with the SAME password (the emails are
//   aliases for one account, not three accounts).
// - The password is NEVER hardcoded and NEVER invented by the agent.
//   On first visit to /admin, Eman sets his own password (min 8 chars) on
//   /admin/setup. It is stored only as a bcrypt hash.
// - Storage: Supabase (admin_users table, lib/supabase-admin.ts) when
//   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
//   (production on Vercel); otherwise the local file store below
//   (data/admin.json, gitignored — never committed, never pushed).
//   The file store exists for local preview only: Vercel's filesystem is
//   read-only at runtime, so a file write there throws EROFS — that is
//   exactly what caused the live "Setup failed (500)" on 14 Nov 2026.
//   File writes are therefore wrapped: a storage failure becomes an
//   AdminStorageError, which the route answers with a 503 and a clear
//   message instead of an unhandled 500.
// - isSetup() NEVER throws: admin pages call it during render, and a
//   storage failure must not 500 the page — it reports "not set up", the
//   setup form renders, and the setup POST surfaces the real error.
// - Sign-in verifies the email against the allowlist and the password
//   against the bcrypt hash, and sets an httpOnly session cookie
//   (HMAC-signed with ADMIN_SESSION_SECRET from .env.local; a random
//   dev fallback is used only when the env var is absent, and sessions then
//   do not survive restarts).
// - Login errors are generic on purpose: the same message for an unknown
//   email and a wrong password.
// - No forgot-password flow exists yet: if Eman forgets the password,
//   delete data/admin.json (locally) or the admin_users row (Supabase)
//   and set a new one. The UI says this plainly.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS, ADMIN_NAME } from "./admin-constants";
import {
  AdminStorageError,
  sbIsSetup,
  sbSetupCredentials,
  sbVerifyCredentials,
  supabaseConfigured,
  type AdminRecord,
} from "./supabase-admin";

export { ADMIN_EMAILS, ADMIN_NAME } from "./admin-constants";
export { AdminStorageError };

const ADMIN_PATH = path.join(process.cwd(), "data", "admin.json");
export const SESSION_COOKIE = "hateem_admin_session";

const MIN_PASSWORD_LENGTH = 8;

/** Which store the auth functions are using right now (debug/status). */
export function adminStoreKind(): "supabase" | "file" {
  return supabaseConfigured() ? "supabase" : "file";
}

// ---------------------------------------------------------------------------
// File store — local preview only. Never used on Vercel once the env vars
// are set; kept so local dev works without a database.
// ---------------------------------------------------------------------------

async function fileIsSetup(): Promise<boolean> {
  try {
    await fs.access(ADMIN_PATH);
    return true;
  } catch {
    return false;
  }
}

async function fileReadAdmin(): Promise<AdminRecord | null> {
  try {
    return JSON.parse(await fs.readFile(ADMIN_PATH, "utf-8")) as AdminRecord;
  } catch {
    return null;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function fileSetupCredentials(
  password: string,
  confirmPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!password || password.length < MIN_PASSWORD_LENGTH)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (password !== confirmPassword)
    return { ok: false, error: "Passwords do not match." };
  if (await fileIsSetup())
    return {
      ok: false,
      error:
        "Admin access is already set up. Use sign-in, or delete data/admin.json to reset.",
    };
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await fs.mkdir(path.dirname(ADMIN_PATH), { recursive: true });
    await fs.writeFile(
      ADMIN_PATH,
      JSON.stringify(
        {
          name: ADMIN_NAME,
          emails: [...ADMIN_EMAILS],
          passwordHash,
          createdAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf-8",
    );
  } catch {
    // Vercel's filesystem is read-only (EROFS): this used to bubble up as
    // an unhandled 500. Say plainly what is missing instead.
    throw new AdminStorageError(
      "Could not save admin credentials — the server filesystem is read-only. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel (real keys, not the PASTE_ placeholders) and run migration 0001 in the portfolio Supabase project's SQL Editor, then retry setup.",
    );
  }
  return { ok: true };
}

async function fileVerifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const rec = await fileReadAdmin();
  if (!rec) return false;
  if (
    !ADMIN_EMAILS.includes(
      normalizeEmail(email) as (typeof ADMIN_EMAILS)[number],
    )
  )
    return false;
  if (!password) return false;
  return bcrypt.compare(password, rec.passwordHash);
}

// ---------------------------------------------------------------------------
// Public facade — same signatures the routes and pages already use.
// ---------------------------------------------------------------------------

export async function isSetup(): Promise<boolean> {
  try {
    return supabaseConfigured() ? await sbIsSetup() : await fileIsSetup();
  } catch {
    // Pages render with this: never let a storage failure 500 the page.
    // The setup POST below surfaces the real error instead.
    return false;
  }
}

export async function setupCredentials(
  password: string,
  confirmPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    return supabaseConfigured()
      ? await sbSetupCredentials(password, confirmPassword)
      : await fileSetupCredentials(password, confirmPassword);
  } catch (err) {
    if (err instanceof AdminStorageError) throw err;
    throw new AdminStorageError(
      "Could not save admin credentials — storage unavailable. Check the Supabase tables / env vars and retry setup.",
    );
  }
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  try {
    return supabaseConfigured()
      ? await sbVerifyCredentials(email, password)
      : await fileVerifyCredentials(email, password);
  } catch (err) {
    if (err instanceof AdminStorageError) throw err;
    throw new AdminStorageError(
      "Could not verify credentials — storage unavailable.",
    );
  }
}

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me"
  );
}

export function signSession(): string {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [payload, sig] = decoded.split(".");
    if (!payload?.startsWith("admin:") || !sig) return false;
    const expected = createHmac("sha256", sessionSecret())
      .update(payload)
      .digest("hex");
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
