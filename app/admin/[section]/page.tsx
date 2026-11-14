import { cookies } from "next/headers";
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

// Admin pages are auth-gated and must render per request, never prerendered.
export const instant = false;
