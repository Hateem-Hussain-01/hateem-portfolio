import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect, notFound } from "next/navigation";
import { SESSION_COOKIE, isSetup, verifySession } from "@/lib/admin";
import { loadContributions, loadDraft } from "@/lib/content";
import { findSection } from "@/components/admin/sections";
import SectionEditor from "@/components/admin/SectionEditor";


export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await connection(); // admin must render per request, never prerendered
  const { section } = await params;
  if (!findSection(section)) notFound();
  if (!(await isSetup())) redirect("/admin/setup");
  const jar = await cookies();
  if (!verifySession(jar.get(SESSION_COOKIE)?.value)) redirect("/admin/signin");

  const [draft, contributions] = await Promise.all([loadDraft(), loadContributions()]);
  return (
    <SectionEditor
      section={section}
      initialContent={draft}
      contributions={section === "commits" ? contributions : null}
    />
  );
}

// Admin must render per request: `instant = false` allows a blocking
// route under cacheComponents, and connection() above opts out of prerendering.
export const instant = false;
