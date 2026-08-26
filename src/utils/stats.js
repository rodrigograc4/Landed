import {
  ACTIVE_STATUSES,
  INTERVIEWED_STATUSES,
  RESPONDED_STATUSES,
  STATUS_VALUES,
  STATUS_WITHOUT_DATE,
  TIMELINE_WEEKS,
  UNKNOWN_KEY,
} from "./constants";

/**
 * Groups the applications by one free-text field, folding case and treating a
 * blank value as a single "unknown" bucket the UI translates.
 */
function groupBy(applications, field, total) {
  const groups = new Map();

  applications.forEach((application) => {
    const label = application[field].trim();
    const key = label.toLowerCase() || UNKNOWN_KEY;
    const entry = groups.get(key) ?? { label, count: 0 };
    entry.count += 1;
    groups.set(key, entry);
  });

  return [...groups.entries()]
    .map(([key, entry]) => ({
      ...entry,
      key,
      percent: percent(entry.count, total),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Local-time Monday of the week the given date falls in, as an ISO day. */
function startOfWeek(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

const isoDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/**
 * The last TIMELINE_WEEKS weeks, empty ones included: skipping them would hide
 * the weeks you stopped applying.
 */
function byWeek(applications, weeks = TIMELINE_WEEKS) {
  const counts = new Map();

  applications.forEach((application) => {
    if (!application.date) return;
    const [year, month, day] = application.date.split("-").map(Number);
    const key = isoDay(startOfWeek(new Date(year, month - 1, day)));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const current = startOfWeek(new Date());

  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(current);
    start.setDate(start.getDate() - (weeks - 1 - index) * 7);
    const key = isoDay(start);
    return { key, count: counts.get(key) ?? 0 };
  });
}

const percent = (value, total) => (total === 0 ? 0 : (value / total) * 100);

export const formatPercent = (value) =>
  `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;

export function computeStats(applications) {
  const sent = applications.filter(
    (application) => application.status !== STATUS_WITHOUT_DATE,
  );
  const total = sent.length;

  const responded = sent.filter((application) =>
    RESPONDED_STATUSES.includes(application.status),
  ).length;

  const interviewed = sent.filter((application) =>
    INTERVIEWED_STATUSES.includes(application.status),
  ).length;

  const byStatus = STATUS_VALUES.filter(
    (value) => value !== STATUS_WITHOUT_DATE,
  ).map((value) => {
    const count = sent.filter(
      (application) => application.status === value,
    ).length;
    return { key: value, count, percent: percent(count, total) };
  });

  const active = sent.filter((application) =>
    ACTIVE_STATUSES.includes(application.status),
  ).length;

  const byLocation = groupBy(sent, "location", total);
  const bySource = groupBy(sent, "source", total);
  const timeline = byWeek(sent);

  return {
    total,
    active,
    closed: total - active,
    responseRate: percent(responded, total),
    interviewRate: percent(interviewed, total),
    responded,
    interviewed,
    byStatus,
    byLocation,
    bySource,
    timeline,
  };
}
