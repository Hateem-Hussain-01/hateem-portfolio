"use client";

import { useState } from "react";

export default function PublishButton() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function publish() {
    setBusy(true);
    setStatus("Publishing…");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      setStatus(
        res.ok && data?.ok
          ? "Published — the live site now uses the draft."
          : (data?.error ?? `Publish failed (${res.status}).`),
      );
    } catch {
      setStatus("Publish failed — check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-midnight-deep hover:bg-gold-bright disabled:opacity-50"
      >
        Publish draft
      </button>
      {status ? <p role="status" className="mt-2 text-sm text-gold-light">{status}</p> : null}
    </div>
  );
}
