"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "signout" }),
        });
        router.push("/admin/signin");
        router.refresh();
      }}
      className="rounded-md border border-gold-dark/60 px-3 py-1.5 text-sm text-gold-light hover:border-gold"
    >
      Sign out
    </button>
  );
}
