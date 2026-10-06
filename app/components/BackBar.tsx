import Link from "next/link";
import type { Route } from "next";

interface Props {
  /** Optional crumb after "Home /" e.g. "Drivers" */
  crumb?: string;
  crumbHref?: string;
  /** Final label for the current page */
  label: string;
}

/** Breadcrumb row for detail pages; the site nav above handles navigation. */
export default function BackBar({ crumb, crumbHref, label }: Props) {
  return (
    <div className="pt-6 md:pt-8">
      <div className="container-max flex items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted min-w-0">
          <Link href="/" className="hover:text-ink transition-colors shrink-0">
            Home
          </Link>
          <Sep />
          {crumb && crumbHref ? (
            <>
              <Link href={crumbHref as Route} className="hover:text-ink transition-colors shrink-0">
                {crumb}
              </Link>
              <Sep />
            </>
          ) : null}
          <span className="text-ink truncate" aria-current="page">{label}</span>
        </nav>
        <Link href="/" className="btn btn-ghost !h-8 !px-3.5 shrink-0">
          <span aria-hidden>←</span> Back
        </Link>
      </div>
    </div>
  );
}

function Sep() {
  return <span aria-hidden className="inline-block w-[8px] h-[2px] bg-f1 -skew-x-[24deg] shrink-0" />;
}
