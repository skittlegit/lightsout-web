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
      <span className="font-display text-muted text-lg sm:text-xl select-none">
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
    <label className={`flex flex-col gap-1.5 min-w-0 ${align === "right" ? "items-end" : ""}`}>
      <span className="eyebrow">{label}</span>
      <div className="relative w-full sm:w-[320px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={`w-full appearance-none bg-paper-deep border border-rule-strong rounded-[var(--radius-card)] hover:border-ink transition-colors font-display text-base sm:text-lg h-12 pl-4 pr-10 truncate cursor-pointer ${
            align === "right" ? "text-right pr-4 pl-10" : ""
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
            align === "right" ? "left-4" : "right-4"
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
