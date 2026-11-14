-- ============================================================================
-- Hateem Portfolio — migration 0002: admin_users from PIN to password login
-- Run ONLY if 0001 already ran with the old PIN-era admin_users table
-- (pin_hash + salt). If 0001 has NOT run yet, run the updated 0001
-- instead — do NOT run this file.
-- Run in the PORTFOLIO Supabase project
-- (https://dmhsynrbixejtplcpzva.supabase.co) — SQL Editor, paste + Run.
-- NEVER run it in the CodeBettle project.
-- ============================================================================

alter table public.admin_users drop column if exists pin_hash;
alter table public.admin_users drop column if exists salt;
alter table public.admin_users add column if not exists name text not null default 'Muhammad Hateem Hussain';
alter table public.admin_users add column if not exists emails text[] not null default '{}';
alter table public.admin_users add column if not exists password_hash text not null default '';
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

-- Any row left by the old 0001 now has an empty password_hash: the app
-- treats that as "not set up", so Eman can still run first-run setup
-- afterwards and the row is filled in place (no duplicate rows).
