interface Anchor {
  href: `#${string}`;
  label: string;
}

const ANCHORS: Anchor[] = [
  { href: "#hero", label: "01 · Top" },
  { href: "#next", label: "02 · Next Race" },
  { href: "#calendar", label: "03 · Calendar" },
  { href: "#drivers", label: "04 · Drivers" },
  { href: "#constructors", label: "05 · Constructors" },
  { href: "#paddock", label: "06 · Paddock" },
  { href: "#forecast", label: "07 · Forecast" },
];

export default function SectionAnchors() {
  return (
    <nav
      aria-label="Section navigation"
      className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-1"
    >
      {ANCHORS.map((a) => (
        <a key={a.href} href={a.href} className="anchor-link">
          {a.label}
        </a>
      ))}
    </nav>
  );
}
