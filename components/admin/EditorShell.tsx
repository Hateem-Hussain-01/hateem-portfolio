"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { SiteContent } from "@/lib/content";

type EditorContextValue = {
  content: SiteContent;
  setContent: (next: SiteContent | ((prev: SiteContent) => SiteContent)) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorShell.");
  return ctx;
}

const inputClass =
  "w-full rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-sm text-cream placeholder:text-muted-gold focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-light";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-gold">{hint}</span> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={inputClass}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Textarea holding one string per line (roles, paragraphs, shipped items). */
export function LinesField({
  label,
  values,
  onChange,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint ?? "One item per line."}>
      <TextArea
        rows={Math.max(3, values.length + 1)}
        value={values.join("\n")}
        onChange={(v) => onChange(v.split("\n"))}
      />
    </Field>
  );
}

/** Single-line comma-separated list (e.g. project tech). */
export function CommaField({
  label,
  values,
  onChange,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint ?? "Separate items with commas."}>
      <TextInput
        value={values.join(", ")}
        onChange={(v) =>
          onChange(v.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />
    </Field>
  );
}

export function Card({
  title,
  children,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  title: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="rounded-lg border border-gold-dark/60 bg-midnight-deep p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold text-cream">{title}</h3>
        <div className="flex shrink-0 gap-1">
          {onMoveUp ? (
            <button type="button" onClick={onMoveUp} aria-label="Move up" className="rounded border border-gold-dark/60 px-2 py-1 text-xs text-gold-light hover:border-gold">
              ↑
            </button>
          ) : null}
          {onMoveDown ? (
            <button type="button" onClick={onMoveDown} aria-label="Move down" className="rounded border border-gold-dark/60 px-2 py-1 text-xs text-gold-light hover:border-gold">
              ↓
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={onDelete} className="rounded border border-red-900 px-2 py-1 text-xs text-red-300 hover:border-red-500">
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-dashed border-gold-dark px-3 py-2 text-sm text-gold-light hover:border-gold hover:text-gold-bright"
    >
      + {label}
    </button>
  );
}

export default function EditorShell({
  initialContent,
  title,
  description,
  preview,
  children,
}: {
  initialContent: SiteContent;
  title: string;
  description: string;
  preview: ReactNode;
  children: ReactNode;
}) {
  const [content, setContentState] = useState<SiteContent>(initialContent);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const setContent = useCallback(
    (next: SiteContent | ((prev: SiteContent) => SiteContent)) => {
      setContentState((prev) => (typeof next === "function" ? next(prev) : next));
      setStatus("Unsaved changes.");
    },
    [],
  );

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setStatus(data?.error ?? `Request failed (${res.status}).`);
      } else {
        setStatus(
          body.action === "publish"
            ? "Published — the live site now uses these values."
            : "Draft saved.",
        );
      }
    } catch {
      setStatus("Request failed — check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <EditorContext.Provider value={{ content, setContent }}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-cream">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-gold">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setContentState(initialContent);
              setStatus("Changes discarded — showing the saved draft.");
            }}
            className="rounded-md border border-gold-dark/60 px-3 py-2 text-sm text-gold-light hover:border-gold disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => post({ content })}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-midnight-deep hover:bg-gold-bright disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => post({ action: "publish", content })}
            className="rounded-md border border-gold bg-goldbrown px-4 py-2 text-sm font-semibold text-gold-bright hover:bg-goldbrown-deep disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
      {status ? (
        <p role="status" className="mb-4 rounded-md border border-gold-dark/60 bg-midnight px-3 py-2 text-sm text-gold-light">
          {status}
        </p>
      ) : null}
      <p className="mb-4 text-xs text-muted-gold">
        Edits save as a draft until you press Publish. Publishing copies the draft to the live content.
      </p>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">{children}</div>
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gold-dark/60 bg-midnight p-4 lg:sticky lg:top-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">
              Live preview — draft values
            </h2>
            {preview}
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
}
