import Link from "next/link";
import { connection } from "next/server";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { SESSION_COOKIE, verifySession } from "@/lib/admin";
import { ADMIN_SECTIONS } from "@/components/admin/sections";
import SignOutButton from "@/components/admin/SignOutButton";


export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection(); // admin must render per request, never prerendered
  const jar = await cookies();
  const authed = verifySession(jar.get(SESSION_COOKIE)?.value);

  return (
    <div className="min-h-screen bg-midnight-deep text-cream">
      <header className="border-b border-gold-dark/60 bg-midnight">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-display text-lg text-gold-bright">
            Hateem — Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gold-light hover:text-gold-bright">
              View public site →
            </Link>
            {authed ? <SignOutButton /> : null}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {authed ? (
          <nav className="hidden w-56 shrink-0 md:block" aria-label="Admin sections">
            <ul className="space-y-1">
              <li>
                <Link href="/admin" className="block rounded-md px-3 py-2 text-sm text-cream hover:bg-goldbrown">
                  Dashboard
                </Link>
              </li>
              {ADMIN_SECTIONS.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={`/admin/${section.slug}`}
                    className="block rounded-md px-3 py-2 text-sm text-cream hover:bg-goldbrown"
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

// Admin must render per request: `instant = false` allows a blocking
// route under cacheComponents, and connection() above opts out of prerendering.
export const instant = false;
