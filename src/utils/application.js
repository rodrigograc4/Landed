import {
  DEFAULT_WORK_MODE,
  GHOST_THRESHOLD_DAYS,
  RESULT_ORDER,
  STATUS_VALUES,
  STATUS_WITHOUT_DATE,
  WORK_MODE_VALUES,
} from "./constants";

const slug = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
};

export const createId = () =>
  `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Accepts an ISO string or a Date. Returns "YYYY-MM-DD" or null. */
function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate(),
    ).padStart(2, "0")}`;
  }

  const match = String(value ?? "")
    .trim()
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Accepts an ISO timestamp and returns it, or "" when there is none to trust. */
function parseTimestamp(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

const matchValue = (value, values, fallback) =>
  values.find((known) => slug(known) === slug(value)) ?? fallback;

const matchStatus = (value) => matchValue(value, STATUS_VALUES, "applied");

const resolveStatus = (status, date) =>
  status === "applied" && daysSince(date) > GHOST_THRESHOLD_DAYS
    ? "ghosted"
    : status;

export const hasDate = (status) => status !== STATUS_WITHOUT_DATE;

const matchWorkMode = (value) =>
  matchValue(value, WORK_MODE_VALUES, DEFAULT_WORK_MODE);

function sanitizeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

/**
 * Turns any object (localStorage, imported JSON, form draft) into a valid
 * application. Returns null when it has neither a company nor a role, since
 * such an entry carries no information.
 */
export function normalizeApplication(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const company = String(input.company ?? "")
    .trim()
    .slice(0, 120);
  const role = String(input.role ?? "")
    .trim()
    .slice(0, 120);
  if (!company && !role) return null;

  const status = matchStatus(input.status);
  const date = hasDate(status) ? (parseDate(input.date) ?? todayISO()) : "";

  return {
    id:
      typeof input.id === "string" && input.id.trim()
        ? input.id.trim()
        : createId(),
    company: company || "-",
    role: role || "-",
    location: String(input.location ?? "")
      .trim()
      .slice(0, 80),
    workMode: matchWorkMode(input.workMode),
    status: hasDate(status) ? resolveStatus(status, date) : status,
    date,
    source: String(input.source ?? "")
      .trim()
      .slice(0, 60),
    link: sanitizeUrl(input.link),
    notes: String(input.notes ?? "")
      .trim()
      .slice(0, 2000),
    favorite: input.favorite === true,
    updatedAt: parseTimestamp(input.updatedAt),
  };
}

/**
 * Compares edit times. An application with no timestamp counts as older than
 * any application that has one, and two unknowns are not newer than each other.
 */
const isNewer = (a, b) => a.updatedAt > b.updatedAt;

/**
 * Merges incoming applications into the current ones by id, keeping whichever
 * copy was edited last so an older file never overwrites a newer edit.
 */
export function mergeApplications(current, incoming) {
  const byId = new Map(current.map((item) => [item.id, item]));

  incoming.forEach((item) => {
    const existing = byId.get(item.id);
    if (!existing || !isNewer(existing, item)) byId.set(item.id, item);
  });

  return sortApplications([...byId.values()]);
}

/**
 * A deletion record: which application was deleted and when. Returns null for
 * anything without a usable id and timestamp.
 */
export function normalizeDeletion(input) {
  if (!input || typeof input !== "object") return null;

  const id = typeof input.id === "string" ? input.id.trim() : "";
  const deletedAt = parseTimestamp(input.deletedAt);
  return id && deletedAt ? { id, deletedAt } : null;
}

/** Combines two deletion logs, keeping the latest deletion of each id. */
export function mergeDeletions(current, incoming) {
  const byId = new Map();

  [...current, ...incoming].forEach((entry) => {
    const existing = byId.get(entry.id);
    if (!existing || entry.deletedAt > existing.deletedAt) {
      byId.set(entry.id, entry);
    }
  });

  return [...byId.values()];
}

/**
 * An application stays only if it was edited after its latest deletion, so a
 * deletion on one device wins over an older copy still sitting in a file.
 */
export function dropDeleted(applications, deletions) {
  const deletedAt = new Map(
    deletions.map((entry) => [entry.id, entry.deletedAt]),
  );

  return applications.filter(
    (item) =>
      !deletedAt.has(item.id) || item.updatedAt > deletedAt.get(item.id),
  );
}

/**
 * Everything a merge import does, in one pure step: the merged applications
 * and deletion log, plus what changed for the confirmation message.
 */
export function planMerge(current, incoming) {
  const deleted = mergeDeletions(current.deleted, incoming.deleted);
  const applications = dropDeleted(
    mergeApplications(current.applications, incoming.applications),
    deleted,
  );

  const before = new Set(current.applications.map((item) => item.id));
  const after = new Set(applications.map((item) => item.id));

  return {
    applications,
    deleted,
    added: [...after].filter((id) => !before.has(id)).length,
    updated: incoming.applications.filter(
      (item) => after.has(item.id) && willReplace(current.applications, item),
    ).length,
    removed: [...before].filter((id) => !after.has(id)).length,
  };
}

/** True when the incoming copy would replace an application already stored. */
export function willReplace(current, item) {
  const existing = current.find((entry) => entry.id === item.id);
  return Boolean(existing) && !isNewer(existing, item);
}

const byCompany = (a, b) =>
  a.company.localeCompare(b.company) || a.role.localeCompare(b.role);

const byDate = (a, b) => {
  if (!a.date && !b.date) return byCompany(a, b);
  if (!a.date) return -1;
  if (!b.date) return 1;
  return b.date.localeCompare(a.date) || byCompany(a, b);
};

const byResult = (a, b) =>
  RESULT_ORDER.indexOf(a.status) - RESULT_ORDER.indexOf(b.status) ||
  byDate(a, b);

const COMPARATORS = { date: byDate, company: byCompany, result: byResult };

/**
 * Dateless entries lead the date ordering: a saved posting is something still
 * waiting on you, so it belongs on top rather than buried at the end.
 */
export const sortApplications = (list, mode = "date") =>
  [...list].sort(COMPARATORS[mode] ?? byDate);

export const formatDate = (iso, locale) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const daysSince = (iso) => {
  const then = new Date(`${iso}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now - then) / 86400000));
};

export const emptyApplication = () => ({
  id: null,
  company: "",
  role: "",
  location: "",
  workMode: DEFAULT_WORK_MODE,
  status: "applied",
  date: todayISO(),
  source: "",
  link: "",
  notes: "",
  favorite: false,
});
