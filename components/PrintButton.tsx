"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-midnight-deep transition-colors hover:bg-gold-bright print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
