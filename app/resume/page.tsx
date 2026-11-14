import Link from "next/link";
import { loadPublished } from "@/lib/content";
import Nav from "@/components/Nav";
import PrintButton from "@/components/PrintButton";

// Content is read from data/content.json on every request (file adapter), so
// this route cannot produce a static shell. Opt out of static-shell
// validation (Next 16 cacheComponents); the route still prerenders.
export const instant = false;

export default async function ResumePage() {
  const content = await loadPublished();
  const { settings, hero, about, experience, projects, certifications, toolkit } = content;
  const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-midnight-deep text-cream">
      <div className="print:hidden">
        <Nav />
      </div>

      <style>{`@media print { body { background: #fff !important; color: #111 !important; } a { color: #111 !important; text-decoration: none !important; } }`}</style>

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 print:max-w-none print:px-0 print:py-0">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="text-sm text-gold-light underline decoration-gold-dark underline-offset-4"
          >
            ← Back to portfolio
          </Link>
          <PrintButton />
          <a
            href="/Hateem_Hussain_CV.pdf"
            download
            className="text-sm text-gold-light underline decoration-gold-dark underline-offset-4"
          >
            Download CV (PDF)
          </a>
        </div>

        <article className="rounded-2xl border border-gold-dark/40 bg-midnight p-6 sm:p-10 print:border-0 print:p-0">
          {/* Header */}
          <header className="border-b border-gold-dark/40 pb-6">
            <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
              {settings.name}
            </h1>
            <p className="mt-2 text-lg text-gold-light">
              Software Engineer · Co-Founder &amp; COO, CodeBettle · AI / ML
            </p>
            <p className="mt-3 leading-relaxed text-muted-gold">{hero.tagline}</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <a href={`mailto:${settings.email}`} className="text-gold-light underline decoration-gold-dark underline-offset-4">
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={settings.github} target="_blank" rel="noopener noreferrer" className="text-gold-light underline decoration-gold-dark underline-offset-4">
                  github.com/{settings.githubUsername}
                </a>
              </li>
              <li>
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gold-light underline decoration-gold-dark underline-offset-4">
                  linkedin.com/in/hateemhussain
                </a>
              </li>
              <li>
                <a href={settings.leetcode} target="_blank" rel="noopener noreferrer" className="text-gold-light underline decoration-gold-dark underline-offset-4">
                  leetcode.com/u/hateem2875
                </a>
              </li>
              <li className="text-muted-gold">{settings.phone}</li>
              <li className="text-muted-gold">{settings.location}</li>
            </ul>
          </header>

          {/* Summary */}
          <section className="mt-8">
            <h2 className="font-display text-2xl text-gold-bright">Summary</h2>
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-muted-gold">
                {p}
              </p>
            ))}
          </section>

          {/* Experience */}
          <section className="mt-10">
            <h2 className="font-display text-2xl text-gold-bright">Experience</h2>
            <ol className="mt-4 space-y-6">
              {experience.map((job) => (
                <li key={job.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-cream">
                      {job.role} — {job.org}
                    </h3>
                    <p className="font-mono text-xs text-gold">{job.period}</p>
                  </div>
                  <p className="mt-1 leading-relaxed text-muted-gold">{job.description}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Projects */}
          <section className="mt-10">
            <h2 className="font-display text-2xl text-gold-bright">Projects</h2>
            <ol className="mt-4 space-y-6">
              {sortedProjects.map((p) => (
                <li key={p.id}>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-semibold text-cream">{p.title}</h3>
                    <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-gold-light underline decoration-gold-dark underline-offset-4">
                      {p.repoUrl.replace("https://github.com/", "github.com/")}
                    </a>
                    {p.liveUrl ? (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-gold-light underline decoration-gold-dark underline-offset-4">
                        Live demo ↗
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-1 leading-relaxed text-muted-gold">{p.description}</p>
                  <p className="mt-1 font-mono text-xs text-muted-gold">{p.tech.join(" · ")}</p>
                  {p.metrics.length > 0 && (
                    <p className="mt-1 text-sm text-gold-light">
                      {p.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* Certifications */}
          <section className="mt-10">
            <h2 className="font-display text-2xl text-gold-bright">Certifications &amp; Honours</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {certifications.map((c) => (
                <li key={c.id} className="rounded-xl border border-gold-dark/40 p-4">
                  <p className="font-semibold text-cream">{c.title}</p>
                  <p className="text-sm text-muted-gold">
                    {c.issuer} · {c.year}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section className="mt-10">
            <h2 className="font-display text-2xl text-gold-bright">Education</h2>
            <p className="mt-3 leading-relaxed text-muted-gold">{about.terminal.education}</p>
            <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {about.facts.map((f) => (
                <div key={f.label} className="flex gap-2 text-sm">
                  <dt className="text-muted-gold">{f.label}:</dt>
                  <dd className="font-medium text-cream">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Skills */}
          <section className="mt-10">
            <h2 className="font-display text-2xl text-gold-bright">Skills</h2>
            <dl className="mt-4 space-y-3">
              {toolkit.map((group) => (
                <div key={group.id} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <dt className="w-44 shrink-0 text-sm font-semibold text-gold-light">
                    {group.title}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-gold">
                    {group.items.join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className="mt-10 border-t border-gold-dark/40 pt-4 text-sm text-muted-gold">
            © 2026 {settings.name}
          </footer>
        </article>
      </main>
    </div>
  );
}
