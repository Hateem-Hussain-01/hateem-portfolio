-- ============================================================================
-- Hateem Portfolio — Supabase migration 0001
-- Run this in the NEW portfolio Supabase project
-- (https://dmhsynrbixejtplcpzva.supabase.co) — SQL Editor, paste + Run.
-- NEVER run it in the CodeBettle project. No CodeBettle database,
-- project, or keys are used here.
-- If 0001 ALREADY ran with the old PIN-era admin_users table (pin_hash +
-- salt), do NOT re-run this file — run 0002_admin_users_password.sql
-- instead; it patches admin_users in place.
-- At deploy time the site needs Vercel env vars NEXT_PUBLIC_SUPABASE_URL
-- and SUPABASE_SERVICE_ROLE_KEY (real keys, not the PASTE_ placeholders).
-- This VM cannot connect to Postgres — do not attempt live DB calls
-- from here.
-- ============================================================================

-- Content sections (hero, about, recognition, toolkit, commits, connect,
-- footer, settings). One row per section key; `content` holds the same
-- shape as data/content.json for that section; `status` is the CMS state.
create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

-- Projects (full CRUD from the admin panel).
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  svg text not null default '',
  repo_url text not null default '',
  live_url text not null default '',
  metrics jsonb not null default '[]'::jsonb,
  tech text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Certifications (full CRUD from the admin panel).
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null default '',
  year text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Experience entries (full CRUD from the admin panel).
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  org text not null default '',
  period text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Social / connect links (full CRUD from the admin panel).
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  handle text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin users. Email + password login (like CodeBettle): password_hash is
-- a bcrypt hash of the password Eman sets on first run (see
-- lib/supabase-admin.ts). emails holds the allowlisted login emails — all
-- aliases for the single admin account (Muhammad Hateem Hussain). No
-- plaintext password is ever stored. Only the server (service role)
-- reads this table — RLS is enabled with no public policies, and the
-- service-role key bypasses RLS.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Muhammad Hateem Hussain',
  emails text[] not null default '{}',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed: section keys the admin panel expects. Content is seeded from
-- data/content.json at migration time by the deploy step; these rows only
-- reserve the keys so the panel never sees a missing section.
insert into public.content_sections (key, content, status) values
  ('settings', '{}'::jsonb, 'published'),
  ('hero', '{}'::jsonb, 'published'),
  ('about', '{}'::jsonb, 'published'),
  ('recognition', '{}'::jsonb, 'published'),
  ('toolkit', '{}'::jsonb, 'published'),
  ('commits', '{}'::jsonb, 'published'),
  ('connect', '{}'::jsonb, 'published'),
  ('footer', '{}'::jsonb, 'published')
on conflict (key) do nothing;

-- Row Level Security: enabled on every table; no public policies.
-- The website reads published content through the server only, using the
-- service-role key (never the anon key, never from the browser).
alter table public.content_sections enable row level security;
alter table public.projects enable row level security;
alter table public.certifications enable row level security;
alter table public.experience enable row level security;
alter table public.social_links enable row level security;
alter table public.admin_users enable row level security;

-- Helpful indexes.
create index if not exists idx_projects_sort on public.projects (sort_order);
create index if not exists idx_certifications_sort on public.certifications (sort_order);
create index if not exists idx_experience_sort on public.experience (sort_order);
create index if not exists idx_social_links_sort on public.social_links (sort_order);
