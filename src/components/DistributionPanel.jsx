import { formatPercent } from "../utils/stats";

export default function DistributionPanel({
  title,
  subtitle,
  items,
  barClass,
  emptyLabel,
}) {
  const visible = items.filter((item) => item.count > 0);

  return (
    <section className="bg-surface rounded-surface p-5">
      <header className="mb-5">
        <h3 className="text-text text-base font-bold">{title}</h3>
        <p className="text-light-gray text-xs">{subtitle}</p>
      </header>

      {visible.length === 0 ? (
        <p className="text-muted text-sm">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((item) => (
            <li key={item.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-text truncate" title={item.label}>
                  {item.label}
                </span>
                <span className="text-muted shrink-0 text-xs">
                  {item.count} · {formatPercent(item.percent)}
                </span>
              </div>
              <div className="bg-bg h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${barClass?.(item) ?? "bg-accent"}`}
                  style={{ width: `${Math.max(item.percent, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
