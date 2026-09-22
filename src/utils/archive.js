import {
  INTERVIEWED_STATUSES,
  STATUS_GROUPS,
  STATUS_WITHOUT_DATE,
} from "./constants";
import {
  normalizeApplication,
  parseTimestamp,
  sortApplications,
} from "./application";

export const createArchiveId = () =>
  `arc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Turns any object into a valid archive, or null when no application survives.
 * A blank name stays blank and is shown as the archive's date range instead.
 */
export function normalizeArchive(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const applications = Array.isArray(input.applications)
    ? sortApplications(
        input.applications.map(normalizeApplication).filter(Boolean),
      )
    : [];
  if (applications.length === 0) return null;

  return {
    id:
      typeof input.id === "string" && input.id.trim()
        ? input.id.trim()
        : createArchiveId(),
    name: String(input.name ?? "")
      .trim()
      .slice(0, 80),
    archivedAt: parseTimestamp(input.archivedAt) || new Date().toISOString(),
    applications,
  };
}

const monthLabel = (date, locale, withYear) => {
  const month = new Intl.DateTimeFormat(locale, { month: "short" })
    .format(date)
    .replace(".", "");
  const label = month.charAt(0).toUpperCase() + month.slice(1);
  return withYear ? `${label} ${date.getFullYear()}` : label;
};

const toDate = (iso) => {
  const [year, month] = iso.split("-").map(Number);
  return new Date(year, month - 1, 1);
};

/**
 * Names a search after the months it covers: "Mar - Sep 2026", "Nov 2025 - Feb
 * 2026" or "Sep 2026". Saved postings are left out, since they have no date.
 */
export function suggestArchiveName(applications, locale) {
  const dates = applications
    .map((application) => application.date)
    .filter(Boolean)
    .sort();

  const first = dates.length ? toDate(dates[0]) : new Date();
  const last = dates.length ? toDate(dates[dates.length - 1]) : first;

  if (
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth()
  ) {
    return monthLabel(last, locale, true);
  }

  const sameYear = first.getFullYear() === last.getFullYear();
  return `${monthLabel(first, locale, !sameYear)} - ${monthLabel(last, locale, true)}`;
}

export const archiveName = (archive, locale) =>
  archive.name || suggestArchiveName(archive.applications, locale);

export function summarizeArchive(applications) {
  const sent = applications.filter(
    (application) => application.status !== STATUS_WITHOUT_DATE,
  );
  const count = (predicate) => sent.filter(predicate).length;

  return {
    saved: applications.length - sent.length,
    applications: sent.length,
    interviews: count((item) => INTERVIEWED_STATUSES.includes(item.status)),
    offers: count(
      (item) => (STATUS_GROUPS[item.status] ?? item.status) === "offer",
    ),
  };
}

export const countArchived = (archives) =>
  archives.reduce((total, archive) => total + archive.applications.length, 0);
