import Link from "next/link";
import type { Route } from "next";

interface Props {
  /** Optional crumb after "Home /" e.g. "Drivers" */
  crumb?: string;
  crumbHref?: string;
  /** Final label for the current page */
  label: string;
}

export default function BackBar({ crumb, crumbHref, label }: Props) {
  return (
    <header className="pt-8 md:pt-10 pb-4">
      <div className="container-max flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
          <Link
            href="/"
            className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
          >
            LightsOut
          </Link>
          <span aria-hidden>/</span>
          {crumb && crumbHref ? (
            <>
              <Link
                href={crumbHref as Route}
                className="hover:text-ink transition-colors"
              >
                {crumb}
              </Link>
              <span aria-hidden>/</span>
            </>
          ) : null}
          <span className="text-ink">{label}</span>
        </nav>
        <Link
          href="/"
          className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors"
        >
          ← Back
        </Link>
      </div>
      <div className="container-max mt-6"><div className="rule-thin" /></div>
    </header>
  );
}
