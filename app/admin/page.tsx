import Link from "next/link";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isSetup, verifySession } from "@/lib/admin";
import { loadDraft, loadPublished } from "@/lib/content";
import { ADMIN_SECTIONS } from "@/components/admin/sections";
import PublishButton from "@/components/admin/PublishButton";


async function requireAuth() {
  await connection(); // admin must render per request, never prerendered
  if (!(await isSetup())) redirect("/admin/setup");
  const jar = await cookies();
  if (!verifySession(jar.get(SESSION_COOKIE)?.value)) redirect("/admin/signin");
}

export default async function AdminDashboard() {
  await requireAuth();
  const [draft, published] = await Promise.all([loadDraft(), loadPublished()]);
  const hasUnpublishedChanges = JSON.stringify(draft) !== JSON.stringify(published);

  const counts: Record<string, number> = {
    recognition: draft.recognition.length,
    projects: draft.projects.length,
    toolkit: draft.toolkit.length,
    experience: draft.experience.length,
    certifications: draft.certifications.length,
    connect: draft.connect.links.length,
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-cream">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-gold">
        Edit any section below. Edits save as a draft until you press Publish.
      </p>

      <div className="mt-4 space-y-2 rounded-lg border border-gold-dark/60 bg-midnight p-4 text-sm">
        <p className="text-gold-light">
          {hasUnpublishedChanges
            ? "There are unpublished draft changes."
            : "The draft matches the published content — nothing waiting to publish."}
        </p>
        <PublishButton />
        <p className="text-xs text-muted-gold">
          Note: on Vercel the file store does not persist (the filesystem is read-only at
          runtime). A database adapter is pending — the Supabase migration is prepared
          (supabase/migrations/0001_portfolio_content.sql) and the connection is awaited.
          Locally, drafts live in data/content.draft.json and publishing writes
          data/content.json.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/admin/${section.slug}`}
            className="rounded-lg border border-gold-dark/60 bg-midnight p-4 hover:border-gold"
          >
            <h2 className="font-semibold text-cream">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-gold">{section.description}</p>
            {counts[section.slug] != null ? (
              <p className="mt-2 text-xs text-gold-light">{counts[section.slug]} items</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Admin must render per request: `instant = false` allows a blocking
// route under cacheComponents, and connection() above opts out of prerendering.
export const instant = false;
