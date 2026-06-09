"use client";

/**
 * Light / dark theme toggle.
 *
 * The active theme lives as a `dark` class on <html>, set before first paint
 * by the inline script in `layout.tsx` (so there's no flash). This button just
 * flips that class and persists the choice. Which icon shows is driven purely
 * by CSS (`dark:` variant), so there's nothing to hydrate and no mismatch.
 */
const STORAGE_KEY = "lo:theme";

function setTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — non-fatal */
  }
}

export default function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle theme"
      className="inline-flex items-center justify-center w-[34px] h-[28px] border border-rule text-ink hover:border-ink transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
    >
      {/* Moon in light mode (→ go dark); sun in dark mode (→ go light). */}
      <svg
        className="block dark:hidden"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <path
          d="M13.2 9.6A5.4 5.4 0 0 1 6.4 2.8a5.4 5.4 0 1 0 6.8 6.8Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="hidden dark:block"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 1.4V3M8 13v1.6M1.4 8H3M13 8h1.6M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
