import type { Route } from "next";

/** Top-level sections, shared by the site nav and the footer. */
export const NAV_LINKS: { href: Route; label: string }[] = [
  { href: "/calendar", label: "Calendar" },
  { href: "/standings", label: "Standings" },
  { href: "/drivers", label: "Drivers" },
  { href: "/constructors", label: "Teams" },
  { href: "/forecast", label: "Forecast" },
  { href: "/compare", label: "Compare" },
];
