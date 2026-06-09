"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";

export interface CompareOption {
  code: string;
  name: string;
}

interface Props {
  options: CompareOption[];
  a: string;
  b: string;
}

/**
 * Two driver pickers that drive `/compare?a=…&b=…`. Navigating updates the URL
 * so the server re-renders the comparison and the view stays shareable.
 */
export default function CompareSelectors({ options, a, b }: Props) {
  const router = useRouter();

  const go = (next: { a?: string; b?: string }) => {
    const na = next.a ?? a;
    const nb = next.b ?? b;
    router.push(`/compare?a=${na}&b=${nb}` as Route, { scroll: false });
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
      <Picker
        label="Driver A"
        value={a}
        disabled={b}
        options={options}
        onChange={(code) => go({ a: code })}
      />
      <span className="font-display italic text-muted text-lg sm:text-xl select-none">
        vs
      </span>
      <Picker
        label="Driver B"
        value={b}
        disabled={a}
        options={options}
        align="right"
        onChange={(code) => go({ b: code })}
      />
    </div>
  );
}

function Picker({
  label,
  value,
  disabled,
  options,
  onChange,
  align = "left",
}: {
  label: string;
  value: string;
  /** The code chosen in the *other* picker, disabled here to avoid self-compare. */
  disabled: string;
  options: CompareOption[];
  onChange: (code: string) => void;
  align?: "left" | "right";
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : ""}`}>
      <span className="eyebrow">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={`appearance-none bg-paper border border-rule hover:border-ink focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2 transition-colors font-display text-base sm:text-lg py-2 pl-3 pr-9 max-w-[42vw] sm:max-w-none truncate cursor-pointer ${
            align === "right" ? "text-right pr-3 pl-9" : ""
          }`}
        >
          {options.map((o) => (
            <option key={o.code} value={o.code} disabled={o.code === disabled}>
              {o.name} · {o.code}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${
            align === "right" ? "left-3" : "right-3"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
          </svg>
        </span>
      </div>
    </label>
  );
}
