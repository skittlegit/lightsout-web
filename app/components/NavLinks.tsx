"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

/** Section links with the current section marked (detail pages count too). */
export default function NavLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const active = (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    // Race detail pages live under /races but belong to the calendar.
    (href === "/calendar" && pathname.startsWith("/races/"));

  return (
    <div className={className}>
      {NAV_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="nav-link"
          aria-current={active(l.href) ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
