/**
 * Ticker — top-of-page race-radio marquee.
 * Scrolls right-to-left in two duplicate groups for seamless wrap.
 * Pauses on hover; fully halted under prefers-reduced-motion (CSS).
 */
interface TickerItem {
  text: string;
  accent?: boolean;
}

interface Props {
  items: TickerItem[];
}

export default function Ticker({ items }: Props) {
  if (!items.length) return null;
  return (
    <div className="ticker" role="marquee" aria-label="Race feed">
      <div className="ticker__edge ticker__edge--l" aria-hidden />
      <div className="ticker__edge ticker__edge--r" aria-hidden />
      <div className="ticker__track">
        <Group items={items} />
        <Group items={items} ariaHidden />
      </div>
    </div>
  );
}

function Group({ items, ariaHidden }: { items: TickerItem[]; ariaHidden?: boolean }) {
  return (
    <div className="ticker__group" aria-hidden={ariaHidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="contents">
          <span className={`ticker__item ${it.accent ? "ticker__item--accent" : ""}`}>
            {it.text}
          </span>
          <span className="ticker__sep" aria-hidden />
        </span>
      ))}
    </div>
  );
}
