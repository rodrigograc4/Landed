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

export function exportApplications(applications) {
  const blob = new Blob([buildBackup(applications)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `landed-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
