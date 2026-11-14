import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, isSetup, verifySession } from "@/lib/admin";
import { SigninForm } from "@/components/admin/AuthForms";


export default async function AdminSigninPage() {
  await connection(); // admin must render per request, never prerendered
  if (!(await isSetup())) redirect("/admin/setup");
  const jar = await cookies();
  if (verifySession(jar.get(SESSION_COOKIE)?.value)) redirect("/admin");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl text-cream">Admin sign-in</h1>
      <p className="mt-1 text-sm text-muted-gold">
        Sign in with any of your admin emails and the password you set on first run.
      </p>
      <div className="mt-6 rounded-lg border border-gold-dark/60 bg-midnight p-4">
        <SigninForm />
      </div>
    </div>
  );
}

// Admin must render per request: `instant = false` allows a blocking
// route under cacheComponents, and connection() above opts out of prerendering.
export const instant = false;
