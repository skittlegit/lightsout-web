import { timeGreeting } from "@/lib/format";
import PaletteTrigger from "./PaletteTrigger";

export default function Masthead() {
  const greeting = timeGreeting();

  return (
    <header className="pt-8 sm:pt-10 md:pt-14 pb-6">
      <div className="container-max">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div aria-hidden className="relative w-6 h-6 bg-ink shrink-0">
              <span className="absolute right-[3px] top-[3px] w-[6px] h-[6px] rounded-full bg-f1" />
            </div>
            <span className="eyebrow truncate">Personal Edition · F1 2026</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <PaletteTrigger />
            <span className="eyebrow hidden md:inline">{greeting.toUpperCase()}</span>
          </div>
        </div>

        <h1 className="headline h-mark mt-8 sm:mt-10 md:mt-14">
          LightsOut<em>.</em>
        </h1>

        <p className="eyebrow mt-3 sm:mt-4 md:mt-6">
          Every stat · Every race · Every prediction
        </p>

        <div className="rule-red mt-5 sm:mt-6 md:mt-8" />
      </div>
    </header>
  );
}
