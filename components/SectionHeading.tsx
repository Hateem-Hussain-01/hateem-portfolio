type Props = {
  /** Path to the title SVG, e.g. "/assets/title-about.svg" */
  src: string;
  /** Section number label, e.g. "01" */
  index: string;
  /** Short eyebrow label, e.g. "About" */
  eyebrow: string;
  alt: string;
};

/** Full-width title SVG with a numbered eyebrow, matching the reference hierarchy. */
export default function SectionHeading({ src, index, eyebrow, alt }: Props) {
  return (
    <div data-reveal>
      <p className="mb-3 font-mono text-xs tracking-[0.3em] text-gold uppercase">
        <span className="text-gold-bright">{index}</span>
        <span className="mx-2 text-gold-dark">/</span>
        {eyebrow}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={1200}
        height={120}
        className="h-auto w-full max-w-full"
        loading="lazy"
      />
    </div>
  );
}
