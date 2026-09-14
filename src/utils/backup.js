import { normalizeApplication } from "./application";

const BACKUP_FORMAT = "landed-backup";

/**
 * Reads a backup payload, either the wrapped object written by
 * exportApplications or a bare array. Never throws: failures come back as an
 * errorKey.
 */
export function readBackup(text) {
  const empty = { applications: [], imported: 0, skipped: 0, errorKey: null };

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

  const applications = [];
  let skipped = 0;

  entries.forEach((entry) => {
    const application = normalizeApplication(entry);
    if (application) applications.push(application);
    else skipped += 1;
  });

  if (applications.length === 0) {
    return { ...empty, skipped, errorKey: "file.noValidEntries" };
  }

  return {
    applications,
    imported: applications.length,
    skipped,
    errorKey: null,
  };
}

const buildBackup = (applications) =>
  JSON.stringify(
    {
      format: BACKUP_FORMAT,
      app: __APP_VERSION__,
      exportedAt: new Date().toISOString(),
      applications,
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
      imported: 0,
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

const download = (content, type, extension) => {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `landed-${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function exportApplications(applications) {
  download(buildBackup(applications), "application/json", "json");
}

/** The byte order mark makes Excel read accents as UTF-8. */
export function exportApplicationsCsv(applications, t) {
  download(`\uFEFF${buildCsv(applications, t)}`, "text/csv", "csv");
}
