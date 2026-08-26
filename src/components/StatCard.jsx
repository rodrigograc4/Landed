import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "text-text",
}) {
  return (
    <div className="bg-surface rounded-surface p-5">
      <div className="text-muted flex items-center justify-between text-xs font-bold tracking-wide uppercase">
        <span>{label}</span>
        <FontAwesomeIcon icon={icon} className={accent} />
      </div>
      <p className={`mt-3 text-3xl font-bold ${accent}`}>{value}</p>
      <p className="text-light-gray mt-1 text-xs">{hint}</p>
    </div>
  );
}
