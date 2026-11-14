import Image from "next/image";
import Link from "next/link";
import { loadContributions, loadPublished } from "@/lib/content";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import Heatmap from "@/components/Heatmap";

// Content is read from data/*.json on every request (file adapter), so this
// route cannot produce a static shell. Opt out of static-shell validation
// (Next 16 cacheComponents); the route still prerenders and streams.
export const instant = false;

const SOCIAL_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  leetcode: "LeetCode",
  medium: "Medium",
  email: "Email",
};

export default async function Home() {
  const content = await loadPublished();
  const contributions = await loadContributions();
  const { settings, hero, about, recognition, recognitionStrip, projects, toolkit, experience, certifications, connect, footer } =
    content;
  const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-midnight-deep text-cream">
      <Reveal />
      <Nav />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section aria-label="Introduction" className="pt-8 sm:pt-12">
          <p className="font-mono text-xs tracking-[0.3em] text-gold uppercase" data-reveal>
            {hero.eyebrow}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hateem-hero-portrait.svg"
            alt="Muhammad Hateem Hussain — Software Engineer, Co-Founder of CodeBettle, AI / ML"
            width={1200}
            height={480}
            className="mt-4 h-auto w-full max-w-full"
            fetchPriority="high"
          />
          <div
            className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start"
            data-reveal
          >
            <Image
              src={hero.portraitUrl ?? "/img/hateem-portrait.jpg"}
              alt="Portrait of Muhammad Hateem Hussain"
              width={800}
              height={1000}
              priority
              unoptimized={Boolean(hero.portraitUrl?.startsWith("http"))}
              className="h-auto w-40 shrink-0 rounded-t-full rounded-b-2xl border border-gold-dark/60 object-cover sm:w-48"
            />
            <div className="text-center sm:text-left">
              <p className="font-display text-2xl text-cream sm:text-3xl">
                {hero.tagline}
              </p>
              <p className="mt-3 leading-relaxed text-muted-gold">{about.paragraphs[0]}</p>
              <p className="mt-3 font-mono text-xs text-gold-light">{hero.status}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href={hero.ctaPrimary.href}
                  className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-midnight-deep transition-colors hover:bg-gold-bright"
                >
                  {hero.ctaPrimary.label} ↓
                </Link>
                <Link
                  href={hero.ctaSecondary.href}
                  className="rounded-full border border-gold px-6 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-goldbrown"
                >
                  {hero.ctaSecondary.label} ↗
                </Link>
              </div>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
                {[
                  { label: "GitHub", href: settings.github },
                  { label: "LinkedIn", href: settings.linkedin },
                  { label: "LeetCode", href: settings.leetcode },
                  { label: "Medium", href: settings.medium },
                  { label: "Email", href: `mailto:${settings.email}` },
                ].map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-sm text-muted-gold underline decoration-gold-dark underline-offset-4 hover:text-gold-light"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-xs text-muted-gold">
                {hero.metaLeft} · {settings.location}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-gold">{hero.metaRight}</p>
            </div>
          </div>
        </section>

        {/* ── 01 About ─────────────────────────────────────── */}
        <section id="about" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading src="/assets/title-about.svg" index="01" eyebrow="About" alt="About" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/about-intro.svg"
            alt={about.heading}
            width={1200}
            height={420}
            className="mt-8 h-auto w-full max-w-full"
            loading="lazy"
            data-reveal
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2" data-reveal>
              <h3 className="font-display text-3xl text-cream">{about.heading}</h3>
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-muted-gold">
                  {p}
                </p>
              ))}
              <div className="mt-8 rounded-2xl border border-gold-dark/40 bg-midnight p-5 font-mono text-sm leading-relaxed">
                <p className="text-gold-bright">$ whoami</p>
                <p className="mt-1 text-cream">{about.terminal.whoami}</p>
                <p className="mt-4 text-gold-bright">$ education</p>
                <p className="mt-1 text-cream">{about.terminal.education}</p>
                <p className="mt-4 text-gold-bright">$ experience</p>
                <p className="mt-1 text-cream">{about.terminal.experience}</p>
                <p className="mt-4 text-gold-bright">$ shipped</p>
                <p className="mt-1 text-cream">{about.terminal.shipped.join(" · ")}</p>
                <p className="mt-4 text-gold-bright">$ principle</p>
                <p className="mt-1 text-cream">{about.terminal.principle}</p>
              </div>
            </div>
            <div className="space-y-4" data-reveal>
              {about.principles.map((pr) => (
                <article
                  key={pr.title}
                  className="rounded-2xl border border-gold-dark/40 bg-midnight p-5"
                >
                  <h4 className="font-display text-xl text-gold-light">{pr.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-gold">{pr.text}</p>
                </article>
              ))}
              <dl className="rounded-2xl border border-gold-dark/40 bg-goldbrown/40 p-5">
                {about.facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 border-b border-gold-dark/30 py-2.5 last:border-0">
                    <dt className="text-sm text-muted-gold">{f.label}</dt>
                    <dd className="text-right text-sm font-medium text-cream">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── 02 Recognition ───────────────────────────────── */}
        <section id="achievements" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading
            src="/assets/title-recognition.svg"
            index="02"
            eyebrow="Recognition"
            alt="Recognition"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/achievement-motif-v2.svg"
            alt="Recognition: Amal Fellowship, Harvard CS50 Puzzle Day Winner, Meta Hacker Cup Round 1 Qualifier"
            width={1200}
            height={430}
            className="mt-8 h-auto w-full max-w-full"
            loading="lazy"
            data-reveal
          />
          <ul
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
            data-reveal
          >
            {recognition.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-gold-dark/40 bg-midnight p-5"
              >
                <p className="font-mono text-xs tracking-widest text-gold uppercase">{r.label}</p>
                <p className="mt-2 font-display text-2xl text-cream">{r.title}</p>
                <p className="mt-1 text-sm text-muted-gold">{r.sub}</p>
              </li>
            ))}
          </ul>
          <dl
            className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5"
            data-reveal
          >
            {recognitionStrip.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gold-dark/40 bg-goldbrown/40 p-4 text-center"
              >
                <dt className="text-[11px] tracking-widest text-muted-gold uppercase">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl text-gold-bright sm:text-3xl">{s.big}</dd>
                <dd className="mt-1 text-xs text-muted-gold">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 03 Projects ──────────────────────────────────── */}
        <section id="projects" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading src="/assets/title-work.svg" index="03" eyebrow="Selected Work" alt="Selected work" />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {sortedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        {/* ── 04 Toolkit ───────────────────────────────────── */}
        <section id="skills" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading src="/assets/title-toolkit.svg" index="04" eyebrow="Toolkit" alt="Toolkit" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/tech-constellation-v2.svg"
            alt="Technology constellation"
            width={1200}
            height={500}
            className="mt-8 h-auto w-full max-w-full"
            loading="lazy"
            data-reveal
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolkit.map((group) => (
              <article
                key={group.id}
                data-reveal
                className="rounded-2xl border border-gold-dark/40 bg-midnight p-5"
              >
                <h3 className="font-display text-xl text-gold-light">{group.title}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-gold-dark/60 bg-goldbrown px-3 py-1 font-mono text-xs text-cream"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── 05 Commit Log ────────────────────────────────── */}
        <section id="activity" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading src="/assets/title-commits.svg" index="05" eyebrow="Commit Log" alt="Commit log" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/contribution-snake.svg"
            alt="GitHub contribution snake"
            width={1200}
            height={410}
            className="mt-8 h-auto w-full max-w-full"
            loading="lazy"
            data-reveal
          />
          <p className="mt-6 text-sm leading-relaxed text-muted-gold" data-reveal>
            {content.commits.note}
          </p>
          <div className="mt-6">
            {contributions ? (
              <Heatmap contributions={contributions} />
            ) : (
              <p className="text-sm text-muted-gold">
                Contribution data is currently unavailable.
              </p>
            )}
          </div>
        </section>

        {/* ── Experience ───────────────────────────────────── */}
        <section id="experience" className="scroll-mt-24 pt-20 sm:pt-28">
          <div data-reveal>
            <p className="mb-3 font-mono text-xs tracking-[0.3em] text-gold uppercase">
              Experience
            </p>
            <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl">
              Where I&apos;ve worked.
            </h2>
          </div>
          <ol className="relative mt-10 space-y-8 border-l border-gold-dark/60 pl-6 sm:pl-8">
            {experience.map((job) => (
              <li key={job.id} data-reveal className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-midnight-deep sm:-left-[39px]"
                />
                <p className="font-mono text-xs tracking-widest text-gold uppercase">{job.period}</p>
                <h3 className="mt-1 font-display text-2xl text-cream">{job.role}</h3>
                <p className="text-sm font-medium text-gold-light">{job.org}</p>
                <p className="mt-2 max-w-3xl leading-relaxed text-muted-gold">{job.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 06 Certifications ────────────────────────────── */}
        <section id="certifications" className="scroll-mt-24 pt-20 sm:pt-28">
          <SectionHeading
            src="/assets/title-certifications.svg"
            index="06"
            eyebrow="Certifications"
            alt="Certifications"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/certifications.svg"
            alt="Certifications and achievements"
            width={1200}
            height={420}
            className="mt-8 h-auto w-full max-w-full"
            loading="lazy"
            data-reveal
          />
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {certifications.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-gold-dark/40 bg-midnight p-5"
              >
                <p className="font-display text-xl text-cream">{c.title}</p>
                <p className="mt-1 text-sm text-muted-gold">{c.issuer}</p>
                <p className="mt-2 font-mono text-xs text-gold">{c.year}</p>
              </li>
            ))}
            <li className="flex items-center rounded-2xl border border-dashed border-gold-dark/60 p-5 text-sm leading-relaxed text-muted-gold">
              {certifications.length} certifications &amp; honours — see the full list above.
            </li>
          </ul>
        </section>

        {/* ── 07 Connect ───────────────────────────────────── */}
        <section id="contact" className="scroll-mt-24 pt-20 pb-24 sm:pt-28">
          <SectionHeading src="/assets/title-connect.svg" index="07" eyebrow="Connect" alt="Connect" />
          <div className="mt-8 text-center" data-reveal>
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-snug text-cream sm:text-4xl">
              {connect.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-gold">{connect.text}</p>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {connect.links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center rounded-2xl border border-gold-dark/60 bg-midnight px-5 py-3 transition-colors hover:border-gold"
                  >
                    <span className="text-sm font-semibold text-gold-light">
                      {SOCIAL_LABELS[l.id] ?? l.label}
                    </span>
                    <span className="mt-0.5 font-mono text-xs text-muted-gold">{l.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-xs text-muted-gold">
              {settings.location} · {settings.phone}
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gold-dark/40 bg-midnight">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/footer-signature-v2.svg"
            alt="Hateem — Software Engineering · AI / ML · Teaching"
            width={1200}
            height={230}
            className="h-auto w-full max-w-full py-6"
            loading="lazy"
          />
          <div className="pb-10 text-center" data-reveal>
            <h2 className="font-display text-3xl text-cream sm:text-4xl">{footer.ctaHeading}</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${settings.email}?subject=${encodeURIComponent(footer.ctaBookCallSubject)}`}
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-midnight-deep transition-colors hover:bg-gold-bright"
              >
                {footer.ctaBookCallLabel} ↗
              </a>
              <a
                href={`mailto:${settings.email}?subject=${encodeURIComponent(footer.ctaStartProjectSubject)}`}
                className="rounded-full border border-gold px-6 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-goldbrown"
              >
                {footer.ctaStartProjectLabel} ↗
              </a>
            </div>
            <p className="mt-8 font-mono text-xs tracking-wide text-muted-gold">
              {footer.stats.join(" · ")}
            </p>
          </div>
          <nav aria-label="Footer" className="border-t border-gold-dark/40 py-6">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: "About", href: "/#about" },
                { label: "Projects", href: "/#projects" },
                { label: "Skills", href: "/#skills" },
                { label: "Achievements", href: "/#achievements" },
                { label: "Experience", href: "/#experience" },
                { label: "Contact", href: "/#contact" },
                { label: "Resume", href: "/resume" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-gold underline decoration-gold-dark underline-offset-4 hover:text-gold-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="border-t border-gold-dark/40 py-6 text-center text-sm text-muted-gold">
            © 2026 {settings.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
