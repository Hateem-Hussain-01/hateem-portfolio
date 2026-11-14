import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSetup } from "@/lib/admin";
import { SetupForm } from "@/components/admin/AuthForms";


export default async function AdminSetupPage() {
  await connection(); // admin must render per request, never prerendered
  if (await isSetup()) redirect("/admin/signin");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl text-cream">Set up the admin PIN</h1>
      <p className="mt-1 text-sm text-muted-gold">
        First run only. Choose a PIN (at least 4 characters) — only you will know it.
      </p>
      <div className="mt-6 rounded-lg border border-gold-dark/60 bg-midnight p-4">
        <SetupForm />
      </div>
    </div>
  );
}

// Admin must render per request: `instant = false` allows a blocking
// route under cacheComponents, and connection() above opts out of prerendering.
export const instant = false;
