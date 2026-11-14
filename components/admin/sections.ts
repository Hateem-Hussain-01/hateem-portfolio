export type AdminSection = {
  slug: string;
  title: string;
  description: string;
};

export const ADMIN_SECTIONS: AdminSection[] = [
  { slug: "hero", title: "Hero", description: "Name, roles, tagline, status line and call-to-action buttons." },
  { slug: "about", title: "About", description: "Heading, paragraphs, terminal card, principles and facts." },
  { slug: "recognition", title: "Recognition", description: "Recognition cards (including the stacked cards) and the recognition strip." },
  { slug: "projects", title: "Projects", description: "Project cards — title, description, metrics, tech, links and artwork path." },
  { slug: "toolkit", title: "Toolkit / Skills", description: "Skill groups and their items." },
  { slug: "commits", title: "Commit Log", description: "Real GitHub contribution totals (read-only) plus the manual override total." },
  { slug: "experience", title: "Experience", description: "Roles, organisations, periods and descriptions." },
  { slug: "certifications", title: "Certifications", description: "Certificates, issuers and years." },
  { slug: "connect", title: "Connect", description: "Heading, intro text and social links." },
  { slug: "footer", title: "Footer / Signature", description: "Signature and footer subline." },
  { slug: "settings", title: "Site Settings", description: "Name, email, phone, links and location. Palette is locked to Midnight Gold." },
];

export function findSection(slug: string): AdminSection | undefined {
  return ADMIN_SECTIONS.find((section) => section.slug === slug);
}
