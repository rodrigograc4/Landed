import {
  normalizeApplication,
  normalizeDeletion,
  settleArchives,
} from "./application";
import { countArchived, normalizeArchive } from "./archive";

const BACKUP_FORMAT = "landed-backup";

/**
 * Reads a backup payload, either the wrapped object written by
 * exportApplications or a bare array. Never throws: failures come back as an
 * errorKey.
 */
export function readBackup(text) {
  const empty = {
    applications: [],
    archives: [],
    deleted: [],
    imported: 0,
    archived: 0,
    skipped: 0,
    errorKey: null,
  };

  if (typeof text !== "string" || text.trim() === "") {
    return { ...empty, errorKey: "file.emptyFile" };
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ...empty, errorKey: "file.parseError" };
  }

  const entries = Array.isArray(payload) ? payload : payload?.applications;
  if (!Array.isArray(entries)) {
    return { ...empty, errorKey: "file.badFormat" };
  }

  const valid = [];
  let skipped = 0;

  entries.forEach((entry) => {
    const application = normalizeApplication(entry);
    if (application) valid.push(application);
    else skipped += 1;
  });

  const { applications, archives } = settleArchives(
    valid,
    Array.isArray(payload?.archives)
      ? payload.archives.map(normalizeArchive).filter(Boolean)
      : [],
  );

  if (applications.length === 0 && archives.length === 0) {
    return { ...empty, skipped, errorKey: "file.noValidEntries" };
  }

  const deleted = Array.isArray(payload?.deleted)
    ? payload.deleted.map(normalizeDeletion).filter(Boolean)
    : [];

  return {
    applications,
    archives,
    deleted,
    imported: applications.length,
    archived: countArchived(archives),
    skipped,
    errorKey: null,
  };
}

const buildBackup = (applications, deleted, archives) =>
  JSON.stringify(
    {
      format: BACKUP_FORMAT,
      app: __APP_VERSION__,
      exportedAt: new Date().toISOString(),
      applications,
      archives,
      deleted,
    },
    null,
    2,
  );

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file, "utf-8");
  });

export async function importApplications(file) {
  try {
    return readBackup(await readFileAsText(file));
  } catch {
    return {
      applications: [],
      archives: [],
      deleted: [],
      imported: 0,
      archived: 0,
      skipped: 0,
      errorKey: "file.readError",
    };
  }
}

const CSV_COLUMNS = [
  ["company", "form.company"],
  ["role", "form.role"],
  ["location", "form.location"],
  ["workMode", "form.workMode"],
  ["status", "form.status"],
  ["date", "form.date"],
  ["source", "form.source"],
  ["link", "form.link"],
  ["notes", "form.notes"],
  ["favorite", "form.favorite"],
];

/** Quotes a cell only when it holds a comma, quote or line break. */
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const csvValue = (application, key, t) => {
  if (key === "status") return t(`status.${application.status}`);
  if (key === "workMode") return t(`workMode.${application.workMode}`);
  if (key === "favorite") return application.favorite ? "✓" : "";
  return application[key];
};

/**
 * Writes the applications as a spreadsheet, with headers and labels in the
 * current language. One way only: CSV is never read back.
 */
export const buildCsv = (applications, t) =>
  [
    CSV_COLUMNS.map(([, label]) => csvCell(t(label))).join(","),
    ...applications.map((application) =>
      CSV_COLUMNS.map(([key]) => csvCell(csvValue(application, key, t))).join(
        ",",
      ),
    ),
  ].join("\r\n");

const fileSlug = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const download = (content, type, extension, name = "") => {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const label = fileSlug(name);

  link.href = url;
  link.download = `landed-${label ? `${label}-` : ""}${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function exportApplications(applications, deleted = [], archives = []) {
  download(
    buildBackup(applications, deleted, archives),
    "application/json",
    "json",
  );
}

/** The byte order mark makes Excel read accents as UTF-8. */
export function exportApplicationsCsv(applications, t, name) {
  download(`\uFEFF${buildCsv(applications, t)}`, "text/csv", "csv", name);
}
