import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/admin";
import {
  loadDraft,
  publishDraft,
  saveDraft,
  type SiteContent,
} from "@/lib/content";


const EXPECTED_KEYS = [
  "settings",
  "hero",
  "about",
  "recognition",
  "recognitionStrip",
  "projects",
  "toolkit",
  "commits",
  "experience",
  "certifications",
  "connect",
  "footer",
] as const;

async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }
  const content = await loadDraft();
  return NextResponse.json(content);
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    action?: string;
    content?: unknown;
  } | null;

  if (body?.action === "publish") {
    await publishDraft();
    return NextResponse.json({ ok: true });
  }

  const content = body?.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return NextResponse.json(
      { ok: false, error: "Body must contain a content object." },
      { status: 400 },
    );
  }
  const missing = EXPECTED_KEYS.filter(
    (key) => !(key in (content as Record<string, unknown>)),
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Content is missing top-level keys: ${missing.join(", ")}` },
      { status: 400 },
    );
  }
  await saveDraft(content as SiteContent);
  return NextResponse.json({ ok: true });
}
