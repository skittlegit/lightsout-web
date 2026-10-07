import Link from "next/link";
import NavLinks from "./NavLinks";
import { SEASON } from "@/lib/api";

/** Sticky paper top bar shared by every page: wordmark + section links. */
export default function SiteNav() {
  return (
    <header className="site-nav">
      <div className="container-max h-[var(--nav-h)] flex items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block h-full">
          <NavLinks className="flex items-center gap-7 h-full" />
        </nav>
      </div>

      {/* Below lg the links ride in a swipeable second row. */}
      <nav aria-label="Primary" className="lg:hidden no-scrollbar overflow-x-auto border-t border-rule">
        <NavLinks className="container-max flex items-center gap-6 h-11" />
      </nav>
    </header>
  );
}

/** Serif wordmark with the red full stop, as on the original masthead. */
export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  return (
    <Link href="/" className="flex items-baseline gap-3 shrink-0" aria-label="LightsOut home">
      <span
        className={`font-display text-[26px] leading-none tracking-[-0.03em] ${tone === "paper" ? "text-[#faf7f2]" : "text-ink"}`}
      >
        LightsOut<span className="text-f1">.</span>
      </span>
      <span className="hidden sm:inline eyebrow">F1 {SEASON}</span>
    </Link>
  );
}
