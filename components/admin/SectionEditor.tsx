"use client";

import EditorShell, {
  AddButton,
  Card,
  CommaField,
  Field,
  LinesField,
  TextArea,
  TextInput,
  useEditor,
} from "./EditorShell";
import { findSection } from "./sections";
import type { Contributions, SiteContent } from "@/lib/content";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return arr;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

const PALETTE = [
  { name: "Midnight", hex: "#0B0F1A", cls: "bg-midnight" },
  { name: "Midnight Deep", hex: "#05070D", cls: "bg-midnight-deep" },
  { name: "Gold Brown", hex: "#1A1405", cls: "bg-goldbrown" },
  { name: "Gold", hex: "#D4A017", cls: "bg-gold" },
  { name: "Gold Bright", hex: "#F5C518", cls: "bg-gold-bright" },
  { name: "Gold Light", hex: "#F0D060", cls: "bg-gold-light" },
  { name: "Gold Dark", hex: "#8C6D1F", cls: "bg-gold-dark" },
  { name: "Cream", hex: "#FFF8E1", cls: "bg-cream" },
  { name: "Muted Gold", hex: "#A8A08A", cls: "bg-muted-gold" },
];

/* ---------------- Hero ---------------- */

function HeroForm() {
  const { content, setContent } = useEditor();
  const hero = content.hero;
  const set = (patch: Partial<typeof hero>) =>
    setContent((c) => ({ ...c, hero: { ...c.hero, ...patch } }));
  return (
    <div className="space-y-4">
      <Field label="Eyebrow"><TextInput value={hero.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name line 1"><TextInput value={hero.nameLine1} onChange={(v) => set({ nameLine1: v })} /></Field>
        <Field label="Name line 2"><TextInput value={hero.nameLine2} onChange={(v) => set({ nameLine2: v })} /></Field>
      </div>
      <LinesField label="Roles" values={hero.roles} onChange={(v) => set({ roles: v })} />
      <Field label="Tagline"><TextArea value={hero.tagline} onChange={(v) => set({ tagline: v })} /></Field>
      <Field label="Status line"><TextInput value={hero.status} onChange={(v) => set({ status: v })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary CTA label"><TextInput value={hero.ctaPrimary.label} onChange={(v) => set({ ctaPrimary: { ...hero.ctaPrimary, label: v } })} /></Field>
        <Field label="Primary CTA href"><TextInput value={hero.ctaPrimary.href} onChange={(v) => set({ ctaPrimary: { ...hero.ctaPrimary, href: v } })} /></Field>
        <Field label="Secondary CTA label"><TextInput value={hero.ctaSecondary.label} onChange={(v) => set({ ctaSecondary: { ...hero.ctaSecondary, label: v } })} /></Field>
        <Field label="Secondary CTA href"><TextInput value={hero.ctaSecondary.href} onChange={(v) => set({ ctaSecondary: { ...hero.ctaSecondary, href: v } })} /></Field>
      </div>
      <Field label="Meta left"><TextInput value={hero.metaLeft} onChange={(v) => set({ metaLeft: v })} /></Field>
      <Field label="Meta right"><TextInput value={hero.metaRight} onChange={(v) => set({ metaRight: v })} /></Field>
    </div>
  );
}

function HeroPreview() {
  const { content } = useEditor();
  const h = content.hero;
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-gold">{h.eyebrow}</p>
      <p className="font-display text-2xl leading-tight text-cream">{h.nameLine1} {h.nameLine2}</p>
      <p className="text-sm text-gold-light">{h.roles.join(" · ")}</p>
      <p className="text-sm text-muted-gold">{h.tagline}</p>
      <p className="font-mono text-xs text-gold">{h.status}</p>
      <p className="text-xs text-muted-gold">{h.ctaPrimary.label} → {h.ctaPrimary.href} · {h.ctaSecondary.label} → {h.ctaSecondary.href}</p>
      <p className="text-xs text-muted-gold">{h.metaLeft}</p>
      <p className="text-xs text-muted-gold">{h.metaRight}</p>
    </div>
  );
}

/* ---------------- About ---------------- */

function AboutForm() {
  const { content, setContent } = useEditor();
  const about = content.about;
  const set = (patch: Partial<typeof about>) =>
    setContent((c) => ({ ...c, about: { ...c.about, ...patch } }));
  return (
    <div className="space-y-4">
      <Field label="Heading"><TextInput value={about.heading} onChange={(v) => set({ heading: v })} /></Field>
      <LinesField label="Paragraphs" values={about.paragraphs} onChange={(v) => set({ paragraphs: v })} hint="One paragraph per line." />
      <div className="rounded-lg border border-gold-dark/60 bg-midnight-deep p-4">
        <h3 className="mb-3 text-sm font-semibold text-cream">Terminal card</h3>
        <div className="space-y-3">
          <Field label="whoami"><TextInput value={about.terminal.whoami} onChange={(v) => set({ terminal: { ...about.terminal, whoami: v } })} /></Field>
          <Field label="Education"><TextInput value={about.terminal.education} onChange={(v) => set({ terminal: { ...about.terminal, education: v } })} /></Field>
          <Field label="Experience"><TextInput value={about.terminal.experience} onChange={(v) => set({ terminal: { ...about.terminal, experience: v } })} /></Field>
          <LinesField label="Shipped" values={about.terminal.shipped} onChange={(v) => set({ terminal: { ...about.terminal, shipped: v } })} />
          <Field label="Principle"><TextInput value={about.terminal.principle} onChange={(v) => set({ terminal: { ...about.terminal, principle: v } })} /></Field>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-cream">Principles</h3>
      {about.principles.map((p, i) => (
        <Card key={i} title={p.title || `Principle ${i + 1}`} onMoveUp={() => set({ principles: move(about.principles, i, -1) })} onMoveDown={() => set({ principles: move(about.principles, i, 1) })} onDelete={() => set({ principles: about.principles.filter((_, j) => j !== i) })}>
          <Field label="Title"><TextInput value={p.title} onChange={(v) => set({ principles: about.principles.map((x, j) => (j === i ? { ...x, title: v } : x)) })} /></Field>
          <Field label="Text"><TextArea value={p.text} onChange={(v) => set({ principles: about.principles.map((x, j) => (j === i ? { ...x, text: v } : x)) })} /></Field>
        </Card>
      ))}
      <AddButton label="Add principle" onClick={() => set({ principles: [...about.principles, { title: "", text: "" }] })} />
      <h3 className="text-sm font-semibold text-cream">Facts</h3>
      {about.facts.map((f, i) => (
        <Card key={i} title={f.label || `Fact ${i + 1}`} onMoveUp={() => set({ facts: move(about.facts, i, -1) })} onMoveDown={() => set({ facts: move(about.facts, i, 1) })} onDelete={() => set({ facts: about.facts.filter((_, j) => j !== i) })}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label"><TextInput value={f.label} onChange={(v) => set({ facts: about.facts.map((x, j) => (j === i ? { ...x, label: v } : x)) })} /></Field>
            <Field label="Value"><TextInput value={f.value} onChange={(v) => set({ facts: about.facts.map((x, j) => (j === i ? { ...x, value: v } : x)) })} /></Field>
          </div>
        </Card>
      ))}
      <AddButton label="Add fact" onClick={() => set({ facts: [...about.facts, { label: "", value: "" }] })} />
    </div>
  );
}

function AboutPreview() {
  const { content } = useEditor();
  const a = content.about;
  return (
    <div className="space-y-3">
      <p className="font-display text-xl text-cream">{a.heading}</p>
      {a.paragraphs.map((p, i) => (<p key={i} className="text-sm text-muted-gold">{p}</p>))}
      <div className="rounded border border-gold-dark/60 bg-midnight-deep p-3 font-mono text-xs text-gold-light">
        <p>$ whoami — {a.terminal.whoami}</p>
        <p>{a.terminal.education}</p>
        <p>{a.terminal.experience}</p>
        <p>shipped: {a.terminal.shipped.join(", ")}</p>
      </div>
      {a.principles.map((p, i) => (
        <p key={i} className="text-sm text-cream"><span className="text-gold">{p.title}:</span> <span className="text-muted-gold">{p.text}</span></p>
      ))}
      <div className="grid grid-cols-2 gap-2">
        {a.facts.map((f, i) => (
          <p key={i} className="text-xs"><span className="text-gold-light">{f.label}:</span> <span className="text-muted-gold">{f.value}</span></p>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Recognition ---------------- */

function RecognitionForm() {
  const { content, setContent } = useEditor();
  const rec = content.recognition;
  const strip = content.recognitionStrip;
  const setRec = (next: typeof rec) => setContent((c) => ({ ...c, recognition: next }));
  const setStrip = (next: typeof strip) => setContent((c) => ({ ...c, recognitionStrip: next }));
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-cream">Recognition cards</h3>
      {rec.map((r, i) => (
        <Card key={r.id} title={`${r.big} — ${r.title}`} onMoveUp={() => setRec(move(rec, i, -1))} onMoveDown={() => setRec(move(rec, i, 1))} onDelete={() => setRec(rec.filter((_, j) => j !== i))}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Big text"><TextInput value={r.big} onChange={(v) => setRec(rec.map((x, j) => (j === i ? { ...x, big: v } : x)))} /></Field>
            <Field label="Title"><TextInput value={r.title} onChange={(v) => setRec(rec.map((x, j) => (j === i ? { ...x, title: v } : x)))} /></Field>
            <Field label="Label"><TextInput value={r.label} onChange={(v) => setRec(rec.map((x, j) => (j === i ? { ...x, label: v } : x)))} /></Field>
            <Field label="Organisation"><TextInput value={r.org} onChange={(v) => setRec(rec.map((x, j) => (j === i ? { ...x, org: v } : x)))} /></Field>
          </div>
          <Field label="Sub"><TextInput value={r.sub} onChange={(v) => setRec(rec.map((x, j) => (j === i ? { ...x, sub: v } : x)))} /></Field>
        </Card>
      ))}
      <AddButton label="Add recognition card" onClick={() => setRec([...rec, { id: newId("rec"), org: "", label: "", title: "", sub: "", big: "" }])} />
      <h3 className="text-sm font-semibold text-cream">Recognition strip</h3>
      {strip.map((s, i) => (
        <Card key={i} title={`${s.big} — ${s.label}`} onMoveUp={() => setStrip(move(strip, i, -1))} onMoveDown={() => setStrip(move(strip, i, 1))} onDelete={() => setStrip(strip.filter((_, j) => j !== i))}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Big"><TextInput value={s.big} onChange={(v) => setStrip(strip.map((x, j) => (j === i ? { ...x, big: v } : x)))} /></Field>
            <Field label="Label"><TextInput value={s.label} onChange={(v) => setStrip(strip.map((x, j) => (j === i ? { ...x, label: v } : x)))} /></Field>
            <Field label="Sub"><TextInput value={s.sub} onChange={(v) => setStrip(strip.map((x, j) => (j === i ? { ...x, sub: v } : x)))} /></Field>
          </div>
        </Card>
      ))}
      <AddButton label="Add strip item" onClick={() => setStrip([...strip, { label: "", big: "", sub: "" }])} />
    </div>
  );
}

function RecognitionPreview() {
  const { content } = useEditor();
  return (
    <div className="space-y-3">
      {content.recognition.map((r) => (
        <div key={r.id} className="rounded border border-gold-dark/60 bg-midnight-deep p-3">
          <p className="font-display text-lg text-gold-bright">{r.big}</p>
          <p className="text-sm text-cream">{r.title}</p>
          <p className="text-xs text-muted-gold">{r.label} · {r.sub}</p>
        </div>
      ))}
      <div className="border-t border-gold-dark/60 pt-2">
        {content.recognitionStrip.map((s, i) => (
          <p key={i} className="text-xs text-muted-gold"><span className="text-gold-bright">{s.big}</span> {s.label} — {s.sub}</p>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Projects ---------------- */

function ProjectsForm() {
  const { content, setContent } = useEditor();
  const projects = [...content.projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const setProjects = (next: typeof content.projects) =>
    setContent((c) => ({ ...c, projects: next }));
  const update = (id: string, patch: Partial<(typeof content.projects)[number]>) =>
    setProjects(content.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const reorder = (id: string, dir: -1 | 1) => {
    const sorted = projects;
    const idx = sorted.findIndex((p) => p.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    setProjects(
      content.projects.map((p) =>
        p.id === a.id ? { ...p, sortOrder: b.sortOrder } : p.id === b.id ? { ...p, sortOrder: a.sortOrder } : p,
      ),
    );
  };
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <Card
          key={p.id}
          title={`${p.sortOrder}. ${p.title || "Untitled project"}`}
          onMoveUp={() => reorder(p.id, -1)}
          onMoveDown={() => reorder(p.id, 1)}
          onDelete={() => setProjects(content.projects.filter((x) => x.id !== p.id))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title"><TextInput value={p.title} onChange={(v) => update(p.id, { title: v, slug: p.slug || slugify(v) })} /></Field>
            <Field label="Slug"><TextInput value={p.slug} onChange={(v) => update(p.id, { slug: slugify(v) })} /></Field>
          </div>
          <Field label="Description"><TextArea value={p.description} onChange={(v) => update(p.id, { description: v })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Repo URL"><TextInput value={p.repoUrl} onChange={(v) => update(p.id, { repoUrl: v })} /></Field>
            <Field label="Live URL"><TextInput value={p.liveUrl} onChange={(v) => update(p.id, { liveUrl: v })} /></Field>
            <Field label="SVG path" hint="e.g. /assets/hateem-project-codebettle-web.svg"><TextInput value={p.svg} onChange={(v) => update(p.id, { svg: v })} /></Field>
            <Field label="Sort order">
              <input
                type="number"
                className="w-full rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
                value={p.sortOrder}
                onChange={(e) => update(p.id, { sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
          <CommaField label="Tech" values={p.tech} onChange={(v) => update(p.id, { tech: v })} />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light">Metrics</h4>
          {p.metrics.map((m, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Value"><TextInput value={m.value} onChange={(v) => update(p.id, { metrics: p.metrics.map((x, j) => (j === i ? { ...x, value: v } : x)) })} /></Field>
              <Field label="Label"><TextInput value={m.label} onChange={(v) => update(p.id, { metrics: p.metrics.map((x, j) => (j === i ? { ...x, label: v } : x)) })} /></Field>
              <button type="button" onClick={() => update(p.id, { metrics: p.metrics.filter((_, j) => j !== i) })} className="self-end rounded border border-red-900 px-2 py-2 text-xs text-red-300">Delete</button>
            </div>
          ))}
          <AddButton label="Add metric" onClick={() => update(p.id, { metrics: [...p.metrics, { value: "", label: "" }] })} />
        </Card>
      ))}
      <AddButton
        label="Add project"
        onClick={() => {
          const order = Math.max(0, ...content.projects.map((p) => p.sortOrder)) + 1;
          const id = newId("project");
          setProjects([...content.projects, { id, slug: "", title: "", description: "", metrics: [], tech: [], repoUrl: "", liveUrl: "", svg: "", sortOrder: order }]);
        }}
      />
    </div>
  );
}

function ProjectsPreview() {
  const { content } = useEditor();
  const projects = [...content.projects].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="rounded border border-gold-dark/60 bg-midnight-deep p-3">
          <p className="text-sm font-semibold text-cream">{p.title}</p>
          <p className="text-xs text-muted-gold">{p.description}</p>
          <p className="text-xs text-gold-light">{p.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}</p>
          <p className="text-xs text-muted-gold">{p.tech.join(", ")}</p>
          <p className="text-xs text-muted-gold">{p.svg}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Toolkit ---------------- */

function ToolkitForm() {
  const { content, setContent } = useEditor();
  const groups = content.toolkit;
  const setGroups = (next: typeof groups) => setContent((c) => ({ ...c, toolkit: next }));
  return (
    <div className="space-y-4">
      {groups.map((g, i) => (
        <Card key={g.id} title={g.title} onMoveUp={() => setGroups(move(groups, i, -1))} onMoveDown={() => setGroups(move(groups, i, 1))} onDelete={() => setGroups(groups.filter((_, j) => j !== i))}>
          <Field label="Group title"><TextInput value={g.title} onChange={(v) => setGroups(groups.map((x, j) => (j === i ? { ...x, title: v } : x)))} /></Field>
          <CommaField label="Items" values={g.items} onChange={(v) => setGroups(groups.map((x, j) => (j === i ? { ...x, items: v } : x)))} />
        </Card>
      ))}
      <AddButton label="Add skill group" onClick={() => setGroups([...groups, { id: newId("toolkit"), title: "", items: [] }])} />
    </div>
  );
}

function ToolkitPreview() {
  const { content } = useEditor();
  return (
    <div className="space-y-3">
      {content.toolkit.map((g) => (
        <div key={g.id}>
          <p className="text-sm font-semibold text-gold-light">{g.title}</p>
          <p className="text-xs text-muted-gold">{g.items.join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Commit Log ---------------- */

function CommitsForm({ contributions }: { contributions: Contributions | null }) {
  const { content, setContent } = useEditor();
  const commits = content.commits;
  const activeDays = contributions ? contributions.days.filter((d) => d.count > 0).length : 0;
  const best = contributions
    ? [...contributions.days].sort((a, b) => b.count - a.count)[0]
    : undefined;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gold-dark/60 bg-midnight-deep p-4 text-sm">
        <h3 className="mb-2 font-semibold text-cream">Real GitHub totals — read-only</h3>
        {contributions ? (
          <dl className="space-y-1 text-muted-gold">
            <p><span className="text-gold-light">Account:</span> {contributions.login}</p>
            <p><span className="text-gold-light">Total contributions:</span> {contributions.total}</p>
            <p><span className="text-gold-light">Days tracked:</span> {contributions.days.length}</p>
            <p><span className="text-gold-light">Active days:</span> {activeDays}</p>
            {best ? <p><span className="text-gold-light">Best day:</span> {best.date} — {best.count} contributions</p> : null}
            {contributions.fetchedAt ? <p><span className="text-gold-light">Fetched:</span> {contributions.fetchedAt}</p> : null}
          </dl>
        ) : (
          <p className="text-muted-gold">No contribution data found in data/contributions.json.</p>
        )}
        <p className="mt-3 text-xs text-muted-gold">
          This data comes from GitHub — it is never invented. Only the note and the manual override below are editable.
        </p>
      </div>
      <Field label="Note"><TextArea rows={4} value={commits.note} onChange={(v) => setContent((c) => ({ ...c, commits: { ...c.commits, note: v } }))} /></Field>
      <Field label="Manual override total" hint="Leave empty for no override (shows the real GitHub total). Enter a number only if the GitHub total needs correcting.">
        <input
          type="number"
          className="w-full rounded-md border border-gold-dark/60 bg-midnight-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
          value={commits.manualOverrideTotal ?? ""}
          placeholder="No override"
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              commits: { ...c.commits, manualOverrideTotal: e.target.value === "" ? null : Number(e.target.value) },
            }))
          }
        />
      </Field>
    </div>
  );
}

function CommitsPreview({ contributions }: { contributions: Contributions | null }) {
  const { content } = useEditor();
  const shown = content.commits.manualOverrideTotal ?? contributions?.total ?? null;
  return (
    <div className="space-y-2">
      <p className="font-display text-2xl text-gold-bright">{shown ?? "—"}</p>
      <p className="text-xs text-muted-gold">contributions{content.commits.manualOverrideTotal != null ? " (manual override)" : " (GitHub total)"}</p>
      <p className="text-sm text-muted-gold">{content.commits.note}</p>
      {contributions?.fetchedAt ? <p className="text-xs text-muted-gold">Source: GitHub · {contributions.login} · fetched {contributions.fetchedAt}</p> : null}
    </div>
  );
}

/* ---------------- Experience ---------------- */

function ExperienceForm() {
  const { content, setContent } = useEditor();
  const list = content.experience;
  const setList = (next: typeof list) => setContent((c) => ({ ...c, experience: next }));
  return (
    <div className="space-y-4">
      {list.map((e, i) => (
        <Card key={e.id} title={`${e.role} — ${e.org}`} onMoveUp={() => setList(move(list, i, -1))} onMoveDown={() => setList(move(list, i, 1))} onDelete={() => setList(list.filter((_, j) => j !== i))}>
          <Field label="Role"><TextInput value={e.role} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, role: v } : x)))} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Organisation"><TextInput value={e.org} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, org: v } : x)))} /></Field>
            <Field label="Period"><TextInput value={e.period} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, period: v } : x)))} /></Field>
          </div>
          <Field label="Description"><TextArea value={e.description} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, description: v } : x)))} /></Field>
        </Card>
      ))}
      <AddButton label="Add experience" onClick={() => setList([...list, { id: newId("exp"), role: "", org: "", period: "", description: "" }])} />
    </div>
  );
}

function ExperiencePreview() {
  const { content } = useEditor();
  return (
    <div className="space-y-3">
      {content.experience.map((e) => (
        <div key={e.id}>
          <p className="text-sm font-semibold text-cream">{e.role}</p>
          <p className="text-xs text-gold-light">{e.org} · {e.period}</p>
          <p className="text-xs text-muted-gold">{e.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Certifications ---------------- */

function CertificationsForm() {
  const { content, setContent } = useEditor();
  const list = content.certifications;
  const setList = (next: typeof list) => setContent((c) => ({ ...c, certifications: next }));
  return (
    <div className="space-y-4">
      {list.map((c, i) => (
        <Card key={c.id} title={`${c.title} (${c.year})`} onMoveUp={() => setList(move(list, i, -1))} onMoveDown={() => setList(move(list, i, 1))} onDelete={() => setList(list.filter((_, j) => j !== i))}>
          <Field label="Title"><TextInput value={c.title} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, title: v } : x)))} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Issuer"><TextInput value={c.issuer} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, issuer: v } : x)))} /></Field>
            <Field label="Year"><TextInput value={c.year} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, year: v } : x)))} /></Field>
          </div>
        </Card>
      ))}
      <AddButton label="Add certification" onClick={() => setList([...list, { id: newId("cert"), title: "", issuer: "", year: "" }])} />
    </div>
  );
}

function CertificationsPreview() {
  const { content } = useEditor();
  return (
    <div className="space-y-2">
      {content.certifications.map((c) => (
        <p key={c.id} className="text-sm text-muted-gold"><span className="text-cream">{c.title}</span> — {c.issuer} · {c.year}</p>
      ))}
    </div>
  );
}

/* ---------------- Connect ---------------- */

function ConnectForm() {
  const { content, setContent } = useEditor();
  const connect = content.connect;
  const set = (patch: Partial<typeof connect>) =>
    setContent((c) => ({ ...c, connect: { ...c.connect, ...patch } }));
  return (
    <div className="space-y-4">
      <Field label="Heading"><TextInput value={connect.heading} onChange={(v) => set({ heading: v })} /></Field>
      <Field label="Text"><TextArea value={connect.text} onChange={(v) => set({ text: v })} /></Field>
      <h3 className="text-sm font-semibold text-cream">Social links</h3>
      {connect.links.map((l, i) => (
        <Card key={l.id} title={l.label} onMoveUp={() => set({ links: move(connect.links, i, -1) })} onMoveDown={() => set({ links: move(connect.links, i, 1) })} onDelete={() => set({ links: connect.links.filter((_, j) => j !== i) })}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label"><TextInput value={l.label} onChange={(v) => set({ links: connect.links.map((x, j) => (j === i ? { ...x, label: v } : x)) })} /></Field>
            <Field label="Handle"><TextInput value={l.handle} onChange={(v) => set({ links: connect.links.map((x, j) => (j === i ? { ...x, handle: v } : x)) })} /></Field>
          </div>
          <Field label="Link (href)"><TextInput value={l.href} onChange={(v) => set({ links: connect.links.map((x, j) => (j === i ? { ...x, href: v } : x)) })} /></Field>
        </Card>
      ))}
      <AddButton label="Add link" onClick={() => set({ links: [...connect.links, { id: newId("link"), label: "", href: "", handle: "" }] })} />
    </div>
  );
}

function ConnectPreview() {
  const { content } = useEditor();
  const c = content.connect;
  return (
    <div className="space-y-2">
      <p className="font-display text-xl text-cream">{c.heading}</p>
      <p className="text-sm text-muted-gold">{c.text}</p>
      {c.links.map((l) => (
        <p key={l.id} className="text-sm"><span className="text-gold-light">{l.label}:</span> <span className="text-muted-gold">{l.handle} — {l.href}</span></p>
      ))}
    </div>
  );
}

/* ---------------- Footer ---------------- */

function FooterForm() {
  const { content, setContent } = useEditor();
  const footer = content.footer;
  const set = (patch: Partial<typeof footer>) =>
    setContent((c) => ({ ...c, footer: { ...c.footer, ...patch } }));
  return (
    <div className="space-y-4">
      <Field label="Signature"><TextInput value={footer.signature} onChange={(v) => set({ signature: v })} /></Field>
      <Field label="Subline"><TextInput value={footer.subline} onChange={(v) => set({ subline: v })} /></Field>
    </div>
  );
}

function FooterPreview() {
  const { content } = useEditor();
  return (
    <div className="border-t border-gold-dark/60 pt-3 text-center">
      <p className="font-display text-2xl italic text-gold-bright">{content.footer.signature}</p>
      <p className="text-xs uppercase tracking-widest text-muted-gold">{content.footer.subline}</p>
    </div>
  );
}

/* ---------------- Settings ---------------- */

const SETTING_FIELDS: { key: keyof SiteContent["settings"]; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "shortName", label: "Short name" },
  { key: "tagline", label: "Tagline" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "github", label: "GitHub URL" },
  { key: "githubUsername", label: "GitHub username" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "leetcode", label: "LeetCode URL" },
  { key: "medium", label: "Medium URL" },
  { key: "portfolioUrl", label: "Portfolio URL" },
  { key: "codebettleUrl", label: "CodeBettle URL" },
  { key: "location", label: "Location" },
];

function SettingsForm() {
  const { content, setContent } = useEditor();
  const s = content.settings;
  return (
    <div className="space-y-4">
      {SETTING_FIELDS.map((f) => (
        <Field key={f.key} label={f.label}>
          <TextInput value={s[f.key]} onChange={(v) => setContent((c) => ({ ...c, settings: { ...c.settings, [f.key]: v } }))} />
        </Field>
      ))}
      <div className="rounded-lg border border-gold-dark/60 bg-midnight-deep p-4">
        <h3 className="mb-1 text-sm font-semibold text-cream">Palette — locked to Midnight Gold</h3>
        <p className="mb-3 text-xs text-muted-gold">There is no other palette choice. These are the only colours used on the site.</p>
        <div className="grid grid-cols-3 gap-2">
          {PALETTE.map((sw) => (
            <div key={sw.hex} className="rounded border border-gold-dark/40 p-2 text-center">
              <span className={`mx-auto mb-1 block h-8 w-8 rounded-full border border-gold-dark/60 ${sw.cls}`} />
              <p className="text-xs text-cream">{sw.name}</p>
              <p className="font-mono text-[10px] text-muted-gold">{sw.hex}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPreview() {
  const { content } = useEditor();
  const s = content.settings;
  return (
    <div className="space-y-2 text-sm">
      <p className="font-display text-xl text-cream">{s.name}</p>
      <p className="text-muted-gold">{s.tagline}</p>
      <p className="text-muted-gold">{s.email} · {s.phone}</p>
      <p className="text-muted-gold">{s.location}</p>
      <p className="text-xs text-muted-gold">GitHub: {s.githubUsername}</p>
      <div className="flex gap-1 pt-2">
        {PALETTE.map((sw) => (
          <span key={sw.hex} title={`${sw.name} ${sw.hex}`} className={`h-6 w-6 rounded-full border border-gold-dark/60 ${sw.cls}`} />
        ))}
      </div>
      <p className="text-xs text-gold-light">Palette locked: Midnight Gold only.</p>
    </div>
  );
}

/* ---------------- Switch ---------------- */

export default function SectionEditor({
  section,
  initialContent,
  contributions,
}: {
  section: string;
  initialContent: SiteContent;
  contributions: Contributions | null;
}) {
  const meta = findSection(section);
  if (!meta) return null;

  let form: React.ReactNode = null;
  let preview: React.ReactNode = null;
  switch (section) {
    case "hero": form = <HeroForm />; preview = <HeroPreview />; break;
    case "about": form = <AboutForm />; preview = <AboutPreview />; break;
    case "recognition": form = <RecognitionForm />; preview = <RecognitionPreview />; break;
    case "projects": form = <ProjectsForm />; preview = <ProjectsPreview />; break;
    case "toolkit": form = <ToolkitForm />; preview = <ToolkitPreview />; break;
    case "commits": form = <CommitsForm contributions={contributions} />; preview = <CommitsPreview contributions={contributions} />; break;
    case "experience": form = <ExperienceForm />; preview = <ExperiencePreview />; break;
    case "certifications": form = <CertificationsForm />; preview = <CertificationsPreview />; break;
    case "connect": form = <ConnectForm />; preview = <ConnectPreview />; break;
    case "footer": form = <FooterForm />; preview = <FooterPreview />; break;
    case "settings": form = <SettingsForm />; preview = <SettingsPreview />; break;
    default: return null;
  }

  return (
    <EditorShell initialContent={initialContent} title={meta.title} description={meta.description} preview={preview}>
      {form}
    </EditorShell>
  );
}
