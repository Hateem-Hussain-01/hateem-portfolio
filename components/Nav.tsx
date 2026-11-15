"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="static border-b border-gold-dark/40 bg-midnight-deep/90 backdrop-blur">
      <nav
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/#top"
          className="font-display text-2xl font-semibold text-cream"
          onClick={() => setOpen(false)}
        >
          Hateem<span className="text-gold">.</span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-muted-gold transition-colors hover:text-gold-light"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/resume"
              className="rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-gold-light transition-colors hover:bg-gold hover:text-midnight-deep"
            >
              Resume
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gold-dark/60 text-gold-light md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span className={`block h-0.5 w-5 bg-gold-light transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-gold-light transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-gold-light transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-gold-dark/40 bg-midnight-deep px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-md px-3 py-2.5 text-base text-cream hover:bg-goldbrown"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                className="mt-1 block rounded-md bg-gold px-3 py-2.5 text-center text-base font-medium text-midnight-deep"
                onClick={() => setOpen(false)}
              >
                Resume
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
