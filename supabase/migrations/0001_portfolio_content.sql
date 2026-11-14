-- ============================================================================
-- Hateem Portfolio — Supabase migration 0001
-- PREPARED ONLY — DO NOT RUN until Eman creates the NEW Supabase project
-- (separate from CodeBettle) and runs this in that project's SQL Editor.
-- No CodeBettle database, project, or keys are used here.
-- Status 21:38 PKT: ALL THREE items for this project are in the Secure
-- Vault as separate connectors — custom.supabase (publishable),
-- custom.supabase-service-role (service-role, server-side ONLY, never in
-- client code, never against CodeBettle), and custom.supabase-database
-- (DATABASE_URL connection string, storage only for deploy time, not an
-- API credential). Still missing: the Project URL (<ref>.supabase.co host)
-- — not supplied yet, so no live API call has been verified for any of
-- them. This VM cannot connect to Postgres — do not attempt live DB calls
-- from here. At deploy time the site will need Vercel env vars DATABASE_URL,
-- NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
-- When the URL arrives, verify with:
--   python3 ~/workspace/custom-connectors/custom.supabase/bin/supabase_api.py --host <ref>.supabase.co --path /rest/v1/
--   python3 ~/workspace/custom-connectors/custom.supabase-service-role/bin/supabase_admin_api.py --host <ref>.supabase.co --path /rest/v1/
-- Until then the site uses the file adapter (data/content.json).
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

-- Admin users. The admin panel is PIN-based: pin_hash is a scrypt hash of
-- the PIN Eman sets on first run (same scheme as lib/admin.ts). No
-- plaintext PIN is ever stored. Only the server (service role) reads this.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  pin_hash text not null,
  salt text not null,
  created_at timestamptz not null default now()
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
