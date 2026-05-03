/**
 * ShiftLights — decorative 5-light start sequence.
 * Pure CSS animation defined in globals.css (.shift-lights).
 * Halted under prefers-reduced-motion.
 */
export default function ShiftLights({ className = "" }: { className?: string }) {
  return (
    <div
      className={`shift-lights ${className}`}
      role="img"
      aria-label="Five-light start sequence indicator"
    >
      <span className="shift-lights__dot" aria-hidden />
      <span className="shift-lights__dot" aria-hidden />
      <span className="shift-lights__dot" aria-hidden />
      <span className="shift-lights__dot" aria-hidden />
      <span className="shift-lights__dot" aria-hidden />
    </div>
  );
}
