import { timeGreeting } from "@/lib/format";

export default function Masthead() {
  // Server-rendered: greeting based on the server's clock.
  // (Acceptable; for true client-local greeting we'd need a client component.)
  const greeting = timeGreeting();

  return (
    <header className="px-6 md:px-10 pt-10 md:pt-14 pb-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="relative w-6 h-6 bg-ink"
            >
              <span className="absolute right-[3px] top-[3px] w-[6px] h-[6px] rounded-full bg-f1" />
            </div>
            <span className="eyebrow">Personal Edition · F1 2026</span>
          </div>
          <span className="eyebrow">{greeting.toUpperCase()}</span>
        </div>

        <h1 className="headline mt-10 md:mt-14 text-[18vw] md:text-[14rem] leading-[0.9] tracking-tight">
          LightsOut<em>.</em>
        </h1>

        <p className="eyebrow mt-4 md:mt-6">
          Every stat · Every race · Every prediction
        </p>

        <div className="rule-red mt-6 md:mt-8" />
      </div>
    </header>
  );
}
