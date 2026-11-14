// Admin credentials in Supabase (admin_users table) — server only.
//
// Used when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
// (production on Vercel). The service-role key bypasses RLS, so no public
// policies are needed on admin_users; the key NEVER leaves the server.
// Locally (env vars absent) lib/admin.ts falls back to the file store.
//
// Same single-account semantics as the file store: one admin
// (Muhammad Hateem Hussain), three allowlisted emails (aliases for one
// account), one bcrypt password hash. Storage failures throw
// AdminStorageError — the route turns that into a 503 with a clear
// message, never an unhandled 500.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS, ADMIN_NAME } from "./admin-constants";

export class AdminStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminStorageError";
  }
}

export type AdminRecord = {
  name: string;
  emails: string[];
  passwordHash: string;
  createdAt: string;
};

const MIN_PASSWORD_LENGTH = 8;

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}

type SupabaseErrorShape = { message?: string; code?: string };

function storageMessage(error: SupabaseErrorShape): string {
  const msg = error?.message ?? "";
  const code = error?.code ?? "";
  if (/invalid api key/i.test(msg))
    return "Supabase rejected the API key. Check that the Vercel env vars NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY hold the real keys from the portfolio Supabase project — not the PASTE_ placeholders from the .env template.";
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "42703" ||
    /admin_users/i.test(msg)
  )
    return "The admin_users table is missing or outdated in Supabase. Run migration 0001 (or 0002 if 0001 already ran) in the portfolio Supabase project's SQL Editor, then retry setup.";
  return `Could not reach Supabase (${msg || "unknown storage error"}). Check the Vercel env vars and that the portfolio Supabase project is up.`;
}

type AdminRow = {
  id: string;
  name: string;
  emails: string[];
  password_hash: string;
  created_at: string;
};

async function readRow(): Promise<AdminRow | null> {
  const { data, error } = await getClient()
    .from("admin_users")
    .select("id, name, emails, password_hash, created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new AdminStorageError(storageMessage(error));
  return (data as AdminRow | null) ?? null;
}

function toRecord(row: AdminRow): AdminRecord {
  return {
    name: row.name,
    emails: Array.isArray(row.emails) ? row.emails : [],
    passwordHash: row.password_hash ?? "",
    createdAt: row.created_at,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function sbReadAdmin(): Promise<AdminRecord | null> {
  const row = await readRow();
  return row ? toRecord(row) : null;
}

export async function sbIsSetup(): Promise<boolean> {
  const rec = await sbReadAdmin();
  return rec !== null && rec.passwordHash.length > 0;
}

export async function sbSetupCredentials(
  password: string,
  confirmPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!password || password.length < MIN_PASSWORD_LENGTH)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (password !== confirmPassword)
    return { ok: false, error: "Passwords do not match." };
  const existing = await readRow();
  if (existing && existing.password_hash)
    return {
      ok: false,
      error:
        "Admin access is already set up. Use sign-in, or delete the admin_users row in the portfolio Supabase project to reset.",
    };
  const passwordHash = await bcrypt.hash(password, 10);
  const payload = {
    name: ADMIN_NAME,
    emails: [...ADMIN_EMAILS],
    password_hash: passwordHash,
  };
  if (existing) {
    // Row left by an older migration (empty hash): fill it in place so the
    // single-admin invariant holds.
    const { error } = await getClient()
      .from("admin_users")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new AdminStorageError(storageMessage(error));
  } else {
    const { error } = await getClient().from("admin_users").insert(payload);
    if (error) throw new AdminStorageError(storageMessage(error));
  }
  return { ok: true };
}

export async function sbVerifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const rec = await sbReadAdmin();
  if (!rec || !rec.passwordHash) return false;
  if (
    !ADMIN_EMAILS.includes(
      normalizeEmail(email) as (typeof ADMIN_EMAILS)[number],
    )
  )
    return false;
  if (!password) return false;
  return bcrypt.compare(password, rec.passwordHash);
}
