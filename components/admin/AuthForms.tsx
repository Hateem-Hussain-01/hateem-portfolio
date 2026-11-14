"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAILS, ADMIN_NAME } from "@/lib/admin-constants";

const inputClass =
  "w-full rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-cream placeholder:text-muted-gold focus:border-gold focus:outline-none";

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-red-900 bg-midnight-deep px-3 py-2 text-sm text-red-300">
      {message}
    </p>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-midnight-deep hover:bg-gold-bright disabled:opacity-50"
    >
      {busy ? "Please wait…" : label}
    </button>
  );
}

export function SetupForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(ADMIN_EMAILS[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", email, password, confirmPassword: confirm }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? `Setup failed (${res.status}).`);
      return;
    }
    router.push("/admin/signin");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-sm text-cream">
        Admin: <span className="font-semibold text-gold-light">{ADMIN_NAME}</span>
      </p>
      <fieldset>
        <legend className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          Sign in with any of these emails
        </legend>
        <div className="space-y-2">
          {ADMIN_EMAILS.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-cream">
              <input
                type="radio"
                name="admin-email"
                value={option}
                checked={email === option}
                onChange={() => setEmail(option)}
                className="accent-[#D4A017]"
              />
              {option}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-gold">
          All three use the same password — pick whichever email you like.
        </p>
      </fieldset>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          Password
        </span>
        <input
          type="password"
          className={inputClass}
          value={password}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          Confirm password
        </span>
        <input
          type="password"
          className={inputClass}
          value={confirm}
          autoComplete="new-password"
          placeholder="Repeat your password"
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </label>
      <ErrorBox message={error} />
      <SubmitButton busy={busy} label="Set password and continue" />
      <p className="text-sm text-muted-gold">
        No forgot-password yet — if you forget it, delete data/admin.json locally (or the admin_users row in Supabase later) and set a new one.
      </p>
    </form>
  );
}

export function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signin", email, password }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? `Sign-in failed (${res.status}).`);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          Email
        </span>
        <input
          type="email"
          className={inputClass}
          value={email}
          autoComplete="username"
          placeholder="you@example.com"
          list="admin-emails"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <datalist id="admin-emails">
          {ADMIN_EMAILS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          Password
        </span>
        <input
          type="password"
          className={inputClass}
          value={password}
          autoComplete="current-password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <p className="text-xs text-muted-gold">
        Use any of your admin emails: {ADMIN_EMAILS.join(" · ")}
      </p>
      <ErrorBox message={error} />
      <SubmitButton busy={busy} label="Sign in" />
    </form>
  );
}
