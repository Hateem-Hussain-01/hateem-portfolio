import type { Contributions, ContributionDay } from "@/lib/content";

/** Gold ramp for contribution levels 0–4 (Midnight Gold only). */
const LEVEL_COLORS: Record<number, string> = {
  0: "#1A1405",
  1: "#3A2A05",
  2: "#8C6D1F",
  3: "#D4A017",
  4: "#F5C518",
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function computeStats(days: ContributionDay[]) {
  const total = days.reduce((sum, d) => sum + d.count, 0);
  let longest = 0;
  let current = 0;
  let longestEnd: ContributionDay | null = null;
  for (const d of days) {
    current = d.count > 0 ? current + 1 : 0;
    if (current > longest) {
      longest = current;
      longestEnd = d;
    }
  }
  const busiest = days.reduce<ContributionDay | null>(
    (best, d) => (best === null || d.count > best.count ? d : best),
    null,
  );
  return { total, longest, longestEnd, busiest };
}

/** Group consecutive days into Sunday-start week columns (GitHub style). */
function toWeeks(days: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];
  // Pad the first week so the first day lands on its weekday column.
  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstWeekday; i++) week.push({ date: "", count: 0, level: -1 });
  for (const d of days) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}

export default function Heatmap({ contributions }: { contributions: Contributions }) {
  const { days, total, fetchedAt } = contributions;
  const stats = computeStats(days);
  const weeks = toWeeks(days);
  const first = days[0];
  const last = days[days.length - 1];

  return (
    <div data-reveal>
      <div className="overflow-x-auto pb-2">
        <div
          className="flex min-w-max gap-[3px]"
          role="img"
          aria-label={`Contribution calendar: ${stats.total} contributions from ${formatDate(first.date)} to ${formatDate(last.date)}`}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((d, di) =>
                d.level < 0 ? (
                  <span key={di} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                ) : (
                  <span
                    key={d.date}
                    title={`${d.count} contribution${d.count === 1 ? "" : "s"} on ${formatDate(d.date)}`}
                    className="h-2.5 w-2.5 rounded-[2px] sm:h-3 sm:w-3"
                    style={{ backgroundColor: LEVEL_COLORS[d.level] ?? LEVEL_COLORS[0] }}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-gold">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: LEVEL_COLORS[level] }}
            aria-hidden="true"
          />
        ))}
        <span>More</span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gold-dark/40 bg-midnight p-4">
          <dt className="text-xs tracking-wide text-muted-gold uppercase">Contributions</dt>
          <dd className="mt-1 font-display text-3xl text-gold-bright">{stats.total}</dd>
        </div>
        <div className="rounded-xl border border-gold-dark/40 bg-midnight p-4">
          <dt className="text-xs tracking-wide text-muted-gold uppercase">Days tracked</dt>
          <dd className="mt-1 font-display text-3xl text-gold-bright">{days.length}</dd>
        </div>
        <div className="rounded-xl border border-gold-dark/40 bg-midnight p-4">
          <dt className="text-xs tracking-wide text-muted-gold uppercase">Longest streak</dt>
          <dd className="mt-1 font-display text-3xl text-gold-bright">
            {stats.longest} {stats.longest === 1 ? "day" : "days"}
          </dd>
          {stats.longestEnd && (
            <dd className="mt-1 text-xs text-muted-gold">
              ending {formatDate(stats.longestEnd.date)}
            </dd>
          )}
        </div>
        <div className="rounded-xl border border-gold-dark/40 bg-midnight p-4">
          <dt className="text-xs tracking-wide text-muted-gold uppercase">Busiest day</dt>
          <dd className="mt-1 font-display text-3xl text-gold-bright">
            {stats.busiest ? stats.busiest.count : 0}
          </dd>
          {stats.busiest && (
            <dd className="mt-1 text-xs text-muted-gold">
              {formatDate(stats.busiest.date)}
            </dd>
          )}
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted-gold">
        {formatDate(first.date)} — {formatDate(last.date)}
        {` · `}GitHub contributions for {contributions.login}
        {fetchedAt ? ` · fetched ${formatDate(fetchedAt.slice(0, 10))}` : ""}
        {total !== stats.total
          ? ` · note: file total (${total}) differs from computed total (${stats.total})`
          : ""}
      </p>
    </div>
  );
}
