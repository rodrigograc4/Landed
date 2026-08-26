import { useI18n } from "../i18n";

/** Weekly volume as columns: the empty weeks matter as much as the busy ones. */
export default function TimelinePanel({ title, subtitle, weeks, emptyLabel }) {
  const { locale } = useI18n();
  const peak = Math.max(...weeks.map((week) => week.count), 0);

  const formatWeek = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(year, month - 1, day));
  };

  return (
    <section className="bg-surface rounded-surface flex flex-col p-5">
      <header className="mb-5">
        <h3 className="text-text text-base font-bold">{title}</h3>
        <p className="text-light-gray text-xs">{subtitle}</p>
      </header>

      {peak === 0 ? (
        <p className="text-muted text-sm">{emptyLabel}</p>
      ) : (
        <div className="flex flex-1 items-center">
          <ul className="flex h-40 w-full items-end gap-2">
            {weeks.map((week) => (
              <li
                key={week.key}
                className="flex h-full flex-1 flex-col justify-end gap-2"
                title={`${formatWeek(week.key)} · ${week.count}`}
              >
                <span className="text-muted text-center text-xs">
                  {week.count || ""}
                </span>
                <div
                  className={`w-3/4 self-center rounded-t ${week.count ? "bg-accent" : "bg-bg"}`}
                  style={{
                    height: `${week.count ? Math.max((week.count / peak) * 100, 4) : 2}%`,
                  }}
                />
                <span className="text-light-gray text-center text-[11px]">
                  {formatWeek(week.key)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
