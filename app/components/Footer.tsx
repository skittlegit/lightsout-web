import Link from "next/link";
import { Logo } from "./SiteNav";
import { NAV_LINKS } from "@/lib/nav";

/** Site-wide footer, rendered once by the root layout. */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="container-max py-10 grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo tone="ink" />
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            Calendar, standings, results and Monte Carlo race forecasts for the
            Formula 1 season.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Explore</span>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-f1 transition-colors w-fit">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Data</span>
          <span className="text-sm text-ink-soft">Results · Jolpica F1 + FastF1</span>
          <span className="text-sm text-ink-soft">Weather · Open-Meteo</span>
          <span className="text-sm text-ink-soft">Model · LightGBM quantiles + 10K Monte Carlo</span>
        </div>
      </div>
    </footer>
  );
}
