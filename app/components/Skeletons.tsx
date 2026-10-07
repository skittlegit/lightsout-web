/**
 * Loading skeletons shaped like the real sections, so streaming content
 * lands without layout jumps.
 */

export function HeroSkeleton() {
  return (
    <section className="panel-carbon panel-flat">
      <div className="container-max grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 pt-10 md:pt-14 pb-10">
        <div className="space-y-5 min-w-0">
          <div className="flex gap-2">
            <div className="skeleton h-6 w-24" />
            <div className="skeleton h-6 w-28" />
          </div>
          <div className="skeleton h-20 md:h-28 w-4/5" />
          <div className="skeleton h-8 w-2/5" />
          <div className="skeleton h-12 w-3/5" />
          <div className="skeleton h-16 w-full max-w-md" />
        </div>
        <div className="skeleton hidden lg:block h-64" />
      </div>
      <div className="border-t border-white/10 h-[88px]" />
    </section>
  );
}

export function CalendarSkeleton() {
  return (
    <section className="section-y">
      <div className="container-max">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-12 w-72 mt-4" />
        <div className="mt-10 flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton shrink-0 w-[168px] sm:w-[188px] md:w-[204px] aspect-[4/5] !rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ColumnSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="skeleton h-6 w-36" />
      <div className="rule-thin my-1" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-9 w-full" />
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <section className="section-y">
      <div className="container-max">
        <div className="skeleton h-4 w-56" />
        <div className="skeleton h-12 w-72 mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          <div className="skeleton h-56 !rounded-[var(--radius-panel)]" />
          <div className="skeleton h-56 !rounded-[var(--radius-card)]" />
          <div className="skeleton h-56 !rounded-[var(--radius-card)]" />
        </div>
        <div className="mt-5 card p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
