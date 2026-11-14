import type { SiteContent } from "@/lib/content";

type Project = SiteContent["projects"][number];

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-reveal
      className="overflow-hidden rounded-2xl border border-gold-dark/40 bg-midnight"
    >
      <a
        href={project.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} — view repository on GitHub`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.svg}
          alt={`${project.title} — project artwork`}
          width={1200}
          height={370}
          className="h-auto w-full max-w-full transition-opacity hover:opacity-90"
          loading="lazy"
        />
      </a>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-2xl font-medium text-cream">
          {project.title}
        </h3>
        <p className="mt-2 leading-relaxed text-muted-gold">
          {project.description}
        </p>

        {project.metrics.length > 0 && (
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-mono text-sm font-medium text-gold-bright">
                  {m.value}
                </dd>
                <dd className="text-xs tracking-wide text-muted-gold uppercase">
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-gold-dark/60 bg-goldbrown px-3 py-1 font-mono text-xs text-gold-light"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-light underline decoration-gold-dark underline-offset-4 hover:text-gold-bright"
          >
            Repository ↗
          </a>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-light underline decoration-gold-dark underline-offset-4 hover:text-gold-bright"
            >
              Live demo ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
