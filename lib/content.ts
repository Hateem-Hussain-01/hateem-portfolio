// Content store — pluggable adapter behind one interface.
//
// CURRENT ADAPTER: file adapter (data/content.json = published,
// data/content.draft.json = draft). This is the working default for local
// preview. On Vercel the filesystem is read-only at runtime, so file-based
// admin edits will NOT persist on the live deployment — a database adapter
// (Supabase, see supabase/migrations/0001_portfolio_content.sql) must
// replace the file adapter before live admin edits can persist. To swap:
// implement ContentStore with the same interface and change `store` below.
// No credentials are stored here. Status 21:38 PKT: ALL THREE items for the
// new portfolio project are in the Secure Vault as separate connectors —
// custom.supabase (publishable key), custom.supabase-service-role
// (service-role key, server-side ONLY, never in client code, never against
// CodeBettle), and custom.supabase-database (DATABASE_URL connection
// string, storage only for deploy time, not an API credential). The Project
// URL (<ref>.supabase.co) is still awaited from Eman, so no live Supabase
// call has been verified for any of them yet. This VM cannot connect to
// Postgres — do not attempt live DB calls from here. At deploy time the
// site will need Vercel env vars DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL
// (publishable) and SUPABASE_SERVICE_ROLE_KEY (secret, server only).
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export type SiteContent = {
  settings: {
    name: string;
    shortName: string;
    tagline: string;
    email: string;
    phone: string;
    github: string;
    githubUsername: string;
    linkedin: string;
    leetcode: string;
    medium: string;
    portfolioUrl: string;
    codebettleUrl: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    nameLine1: string;
    nameLine2: string;
    roles: string[];
    tagline: string;
    status: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    metaLeft: string;
    metaRight: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    terminal: {
      whoami: string;
      education: string;
      experience: string;
      shipped: string[];
      principle: string;
    };
    principles: { title: string; text: string }[];
    facts: { label: string; value: string }[];
  };
  recognition: {
    id: string;
    org: string;
    label: string;
    title: string;
    sub: string;
    big: string;
  }[];
  recognitionStrip: { label: string; big: string; sub: string }[];
  projects: {
    id: string;
    slug: string;
    title: string;
    description: string;
    metrics: { value: string; label: string }[];
    tech: string[];
    repoUrl: string;
    liveUrl: string;
    svg: string;
    sortOrder: number;
  }[];
  toolkit: { id: string; title: string; items: string[] }[];
  commits: { note: string; manualOverrideTotal: number | null };
  experience: {
    id: string;
    role: string;
    org: string;
    period: string;
    description: string;
  }[];
  certifications: { id: string; title: string; issuer: string; year: string }[];
  connect: {
    heading: string;
    text: string;
    links: { id: string; label: string; href: string; handle: string }[];
  };
  footer: { signature: string; subline: string };
};

export interface ContentStore {
  loadPublished(): Promise<SiteContent>;
  loadDraft(): Promise<SiteContent>;
  saveDraft(content: SiteContent): Promise<void>;
  publishDraft(): Promise<void>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLISHED_PATH = path.join(DATA_DIR, "content.json");
const DRAFT_PATH = path.join(DATA_DIR, "content.draft.json");

async function readJson(file: string): Promise<SiteContent> {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

/** File adapter — local preview only. See header note about Vercel. */
export const fileStore: ContentStore = {
  async loadPublished() {
    return readJson(PUBLISHED_PATH);
  },
  async loadDraft() {
    try {
      return await readJson(DRAFT_PATH);
    } catch {
      return readJson(PUBLISHED_PATH);
    }
  },
  async saveDraft(content: SiteContent) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DRAFT_PATH, JSON.stringify(content, null, 2), "utf-8");
  },
  async publishDraft() {
    const draft = await this.loadDraft();
    await fs.writeFile(PUBLISHED_PATH, JSON.stringify(draft, null, 2), "utf-8");
  },
};

// Swap this line for the Supabase adapter when the DB is ready.
export const store: ContentStore = fileStore;

export async function loadPublished(): Promise<SiteContent> {
  return store.loadPublished();
}

export async function loadDraft(): Promise<SiteContent> {
  return store.loadDraft();
}

export async function saveDraft(content: SiteContent): Promise<void> {
  return store.saveDraft(content);
}

export async function publishDraft(): Promise<void> {
  return store.publishDraft();
}

export type ContributionDay = { date: string; count: number; level: number };
export type Contributions = {
  login: string;
  total: number;
  days: ContributionDay[];
  fetchedAt?: string;
};

export async function loadContributions(): Promise<Contributions | null> {
  try {
    const raw = await fs.readFile(
      path.join(DATA_DIR, "contributions.json"),
      "utf-8",
    );
    return JSON.parse(raw) as Contributions;
  } catch {
    return null;
  }
}
