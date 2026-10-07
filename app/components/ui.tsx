import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/** Label + big value used inside coloured banners (team cards, race banner). */
export function BannerStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="font-display text-[clamp(1.3rem,2.4vw,1.8rem)] leading-tight mt-1">{value}</dd>
    </div>
  );
}

/** Banner chip on coloured/dark backgrounds. */
export function BannerChip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

/** A data table inside a corner-bordered card, scrolling sideways on phones. */
export function TableCard({ minWidth = 560, children }: { minWidth?: number; children: ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="data-table" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

/** One cell of a `.stat-strip`: uppercase label, value, optional note. */
export function StripStat({ label, value, note, color }: { label: string; value: ReactNode; note?: ReactNode; color?: string }) {
  return (
    <div>
      <span className="eyebrow flex items-center gap-2">
        {color && <span aria-hidden className="team-pip !h-3 !w-[3px]" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-display text-[clamp(1.1rem,2vw,1.4rem)] leading-tight truncate">{value}</span>
      {note && <span className="text-[13px] text-muted truncate">{note}</span>}
    </div>
  );
}

/** Card header: title + optional meta text or a link onward. */
export function CardHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 h-14 border-b border-rule">
      <h3 className="font-display text-[16px]">{title}</h3>
      {action ? (
        <Link href={action.href as Route} className="more-link !text-[13.5px]">
          {action.label} <span aria-hidden>→</span>
        </Link>
      ) : meta ? (
        <span className="text-[13px] text-muted">{meta}</span>
      ) : null}
    </div>
  );
}
