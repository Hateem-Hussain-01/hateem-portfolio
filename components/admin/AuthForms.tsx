"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-cream placeholder:text-muted-gold focus:border-gold focus:outline-none";

function PinForm({
  submitLabel,
  onSubmit,
  children,
}: {
  submitLabel: string;
  onSubmit: (pin: string) => Promise<string | null>;
  children?: ReactNode;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await onSubmit(pin);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
          PIN
        </span>
        <input
          type="password"
          className={inputClass}
          value={pin}
          autoComplete="current-password"
          placeholder="Enter your PIN"
          onChange={(e) => setPin(e.target.value)}
          required
        />
      </label>
      {children}
      {error ? (
        <p role="alert" className="rounded-md border border-red-900 bg-midnight-deep px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-midnight-deep hover:bg-gold-bright disabled:opacity-50"
      >
        {busy ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

export function SetupForm() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function setup(pin: string): Promise<string | null> {
    if (pin.length < 4) return "PIN must be at least 4 characters.";
    if (pin !== confirm) return "PINs do not match.";
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", pin }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) return data?.error ?? `Setup failed (${res.status}).`;
    router.push("/admin/signin");
    return null;
  }

  return (
    <div className="space-y-4">
      <PinForm
        submitLabel="Set PIN and continue"
        onSubmit={async (pin) => {
          setError("");
          return setup(pin);
        }}
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light">
            Confirm PIN
          </span>
          <input
            type="password"
            className={inputClass}
            value={confirm}
            autoComplete="new-password"
            placeholder="Repeat your PIN"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
      </PinForm>
      {error ? (
        <p role="alert" className="rounded-md border border-red-900 bg-midnight-deep px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <p className="text-sm text-muted-gold">
        No forgot-PIN yet — if you forget it, delete data/admin.json locally (or the admin_users row in Supabase later) and set a new one.
      </p>
    </div>
  );
}

export function SigninForm() {
  const router = useRouter();

  async function signin(pin: string): Promise<string | null> {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signin", pin }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) return data?.error ?? `Sign-in failed (${res.status}).`;
    router.push("/admin");
    router.refresh();
    return null;
  }

  return <PinForm submitLabel="Sign in" onSubmit={signin} />;
}
