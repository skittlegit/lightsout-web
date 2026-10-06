/** F1-style driver name: given name(s) regular, surname bold uppercase. */
export default function DriverName({ name, className = "" }: { name: string; className?: string }) {
  const parts = name.trim().split(/\s+/);
  const surname = parts.pop() ?? "";
  return (
    <span className={className}>
      {parts.length > 0 && <>{parts.join(" ")} </>}
      <span className="surname">{surname}</span>
    </span>
  );
}
