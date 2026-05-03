/**
 * Editorial skeletons. Paper-deep blocks, subtle pulse — match the aesthetic.
 */

export function HeroSkeleton() {
  return (
    <section className="px-6 md:px-10 pt-6 pb-12">
      <div className="max-w-[1280px] mx-auto bg-ink p-12 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10">
        <div className="space-y-6">
          <div className="skeleton h-3 w-40 bg-paper/10" />
          <div className="skeleton h-24 w-full bg-paper/10" />
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="skeleton h-12 bg-paper/10" />
            <div className="skeleton h-12 bg-paper/10" />
            <div className="skeleton h-12 bg-paper/10" />
          </div>
        </div>
        <div className="lg:w-[280px] space-y-3">
          <div className="skeleton h-3 w-24 bg-paper/10" />
          <div className="skeleton h-14 bg-paper/10" />
          <div className="skeleton h-3 w-full bg-paper/10" />
        </div>
      </div>
    </section>
  );
}

export function CalendarSkeleton() {
  return (
    <section className="px-6 md:px-10 py-14">
      <div className="max-w-[1280px] mx-auto">
        <div className="skeleton h-14 w-72" />
        <div className="mt-10 flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton shrink-0 w-[170px] md:w-[200px] aspect-[4/5]"
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
      <div className="skeleton h-10 w-48" />
      <div className="rule-thin mt-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <section className="px-6 md:px-10 py-14">
      <div className="max-w-[1280px] mx-auto">
        <div className="skeleton h-16 w-72" />
        <div className="rule-thin mt-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="skeleton h-48" />
          <div className="skeleton h-48" />
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
