import Link from "next/link";
import NavLinks from "./NavLinks";
import PaletteTrigger from "./PaletteTrigger";

/** Sticky F1-red top bar shared by every page. */
export default function SiteNav() {
  return (
    <header className="site-nav">
      <div className="container-max h-[var(--nav-h)] flex items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block h-full">
          <NavLinks className="flex items-center h-full" />
        </nav>
        <PaletteTrigger />
      </div>

      {/* Below lg the links ride in a swipeable second row. */}
      <nav aria-label="Primary" className="lg:hidden no-scrollbar overflow-x-auto border-t border-white/15">
        <NavLinks className="container-max flex items-center [&_.nav-link]:h-12" />
      </nav>
    </header>
  );
}

/** Text wordmark. `tone="ink"` for use on light backgrounds (footer). */
export function Logo({ tone = "white" }: { tone?: "white" | "ink" }) {
  return (
    <Link
      href="/"
      className={`font-display text-[22px] font-extrabold italic leading-none tracking-[-0.02em] shrink-0 ${
        tone === "white" ? "text-white" : "text-ink"
      }`}
    >
      LightsOut
    </Link>
  );
}
