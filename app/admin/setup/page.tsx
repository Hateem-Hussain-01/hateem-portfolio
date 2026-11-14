import { redirect } from "next/navigation";
import { isSetup } from "@/lib/admin";
import { SetupForm } from "@/components/admin/AuthForms";


export default async function AdminSetupPage() {
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

// Admin pages are auth-gated and must render per request, never prerendered.
export const instant = false;
