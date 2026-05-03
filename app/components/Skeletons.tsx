/**
 * Editorial skeletons. Paper-deep blocks, subtle pulse — match the aesthetic.
 */

export function HeroSkeleton() {
  return (
    <section className="pt-2 pb-12 md:pb-16">
      <div className="container-max">
        <div className="bg-ink p-6 sm:p-8 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 md:gap-10">
          <div className="space-y-5 min-w-0">
            <div className="skeleton h-3 w-40 bg-paper/10" />
            <div className="skeleton h-20 sm:h-24 md:h-28 w-full bg-paper/10" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-4">
              <div className="skeleton h-12 bg-paper/10" />
              <div className="skeleton h-12 bg-paper/10" />
              <div className="skeleton h-12 bg-paper/10" />
            </div>
          </div>
          <div className="lg:w-[300px] space-y-3">
            <div className="skeleton h-3 w-24 bg-paper/10" />
            <div className="skeleton h-14 bg-paper/10" />
            <div className="skeleton h-3 w-full bg-paper/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CalendarSkeleton() {
  return (
    <section className="section-y">
      <div className="container-max">
        <div className="skeleton h-12 w-72" />
        <div className="mt-8 flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton shrink-0 w-[160px] sm:w-[180px] md:w-[200px] aspect-[4/5]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ColumnSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton h-9 w-48" />
      <div className="rule-thin mt-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <section className="section-y">
      <div className="container-max">
        <div className="skeleton h-14 w-72" />
        <div className="rule-thin mt-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          <div className="skeleton h-44" />
          <div className="skeleton h-44" />
        </div>
        <div className="mt-10 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
