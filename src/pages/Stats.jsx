import { useMemo } from "react";
import {
  faBriefcase,
  faComments,
  faHourglassHalf,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import StatCard from "../components/StatCard";
import DistributionPanel from "../components/DistributionPanel";
import TimelinePanel from "../components/TimelinePanel";
import { computeStats, formatPercent } from "../utils/stats";
import { STATUS_COLORS, TIMELINE_WEEKS, UNKNOWN_KEY } from "../utils/constants";
import { useI18n } from "../i18n";

export default function Stats({ applications }) {
  const { t } = useI18n();
  const stats = useMemo(() => computeStats(applications), [applications]);

  const named = (unknownKey) => (item) => ({
    ...item,
    label: item.key === UNKNOWN_KEY ? t(unknownKey) : item.label,
  });

  const locationItems = stats.byLocation.map(named("stats.unknownLocation"));
  const sourceItems = stats.bySource.map(named("stats.unknownSource"));

  const statusItems = stats.byStatus.map((item) => ({
    ...item,
    label: t(`status.${item.key}`),
  }));

  return (
    <>
      <div>
        <h1 className="text-text text-2xl font-bold">{t("stats.title")}</h1>
        <p className="text-muted mt-1 text-sm">{t("stats.subtitle")}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("stats.total")}
          value={stats.total}
          hint={t("stats.totalHint")}
          icon={faBriefcase}
        />
        <StatCard
          label={t("stats.responseRate")}
          value={formatPercent(stats.responseRate)}
          hint={t("stats.responseHint", { count: stats.responded })}
          icon={faReply}
          accent="text-sky-700"
        />
        <StatCard
          label={t("stats.interviewRate")}
          value={formatPercent(stats.interviewRate)}
          hint={t("stats.interviewHint", { count: stats.interviewed })}
          icon={faComments}
          accent="text-violet-700"
        />
        <StatCard
          label={t("stats.active")}
          value={stats.active}
          hint={t("stats.activeHint", { count: stats.closed })}
          icon={faHourglassHalf}
          accent="text-accent"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TimelinePanel
          title={t("stats.timeline")}
          subtitle={t("stats.timelineSubtitle", { weeks: TIMELINE_WEEKS })}
          emptyLabel={t("stats.noData")}
          weeks={stats.timeline}
        />
        <DistributionPanel
          title={t("stats.funnel")}
          subtitle={t("stats.funnelSubtitle")}
          emptyLabel={t("stats.noData")}
          items={statusItems}
          barClass={(item) => STATUS_COLORS[item.key].bar}
        />
        <DistributionPanel
          title={t("stats.geography")}
          subtitle={t("stats.geographySubtitle")}
          emptyLabel={t("stats.noData")}
          items={locationItems}
          barClass={() => "bg-accent"}
        />
        <DistributionPanel
          title={t("stats.sources")}
          subtitle={t("stats.sourcesSubtitle")}
          emptyLabel={t("stats.noData")}
          items={sourceItems}
          barClass={() => "bg-accent"}
        />
      </div>
    </>
  );
}
