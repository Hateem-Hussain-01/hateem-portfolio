import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isSetup, verifySession } from "@/lib/admin";
import { SigninForm } from "@/components/admin/AuthForms";


export default async function AdminSigninPage() {
  if (!(await isSetup())) redirect("/admin/setup");
  const jar = await cookies();
  if (verifySession(jar.get(SESSION_COOKIE)?.value)) redirect("/admin");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl text-cream">Admin sign-in</h1>
      <p className="mt-1 text-sm text-muted-gold">Enter the PIN you set on first run.</p>
      <div className="mt-6 rounded-lg border border-gold-dark/60 bg-midnight p-4">
        <SigninForm />
      </div>
    </div>
  );
}

// Admin pages are auth-gated and must render per request, never prerendered.
export const instant = false;
