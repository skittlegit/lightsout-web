import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

interface Props {
  /** Small label above the title. */
  kicker?: string;
  title: string;
  /** Second word(s), rendered in red. */
  accent?: string;
  /** Right-aligned meta text (wraps under the title on narrow screens). */
  meta?: ReactNode;
  /** Right-aligned "View all" style link to the section's full page. */
  action?: { href: string; label: string };
}

/** Section header: kicker, title, and either meta text or a link onward. */
export default function SectionTitle({ kicker, title, accent, meta, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-x-6 gap-y-2 flex-wrap">
      <div className="min-w-0">
        {kicker && <span className="kicker">{kicker}</span>}
        <h2 className={`headline h-section ${kicker ? "mt-2" : ""}`}>
          {title}
          {accent && (
            <>
              {" "}
              <em>{accent}</em>
            </>
          )}
        </h2>
      </div>
      {action ? (
        <Link href={action.href as Route} className="more-link">
          {action.label} <span aria-hidden>→</span>
        </Link>
      ) : meta ? (
        <div className="text-sm text-muted sm:text-right">{meta}</div>
      ) : null}
    </div>
  );
}

/** Top of a standalone page: kicker, large title, one-line description. */
export function PageHeader({
  kicker,
  title,
  accent,
  description,
  aside,
}: {
  kicker: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="pt-10 md:pt-14 pb-8 md:pb-10">
      <div className="container-max flex items-end justify-between gap-x-8 gap-y-5 flex-wrap">
        <div className="min-w-0 max-w-3xl">
          <span className="kicker">{kicker}</span>
          <h1 className="headline h-detail mt-3">
            {title}
            {accent && (
              <>
                {" "}
                <em>{accent}</em>
              </>
            )}
          </h1>
          {description && <p className="mt-4 text-[15.5px] text-muted leading-relaxed max-w-2xl">{description}</p>}
        </div>
        {aside}
      </div>
    </header>
  );
}
