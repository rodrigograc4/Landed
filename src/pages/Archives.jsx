import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faBoxOpen,
  faFileCsv,
  faTag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  archiveName,
  suggestArchiveName,
  summarizeArchive,
} from "../utils/archive";
import { exportApplicationsCsv } from "../utils/backup";
import { useI18n } from "../i18n";

const actionClass =
  "text-light-gray rounded-full px-2 py-1.5 text-sm transition-colors hover:bg-white";

const COUNTS = [
  ["saved", "text-briefcase"],
  ["applications", "text-sky-700"],
  ["interviews", "text-violet-700"],
  ["offers", "text-accent"],
];

function ArchiveRow({ archive, onUnarchive, onDelete, onExported }) {
  const { t, locale } = useI18n();
  const name = archiveName(archive, locale);
  const summary = summarizeArchive(archive.applications);
  const archivedOn = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(archive.archivedAt));

  const exportCsv = () => {
    exportApplicationsCsv(archive.applications, t, name);
    onExported(archive.applications.length);
  };

  const actions = [
    [faFileCsv, "exportCsv", "hover:text-accent", exportCsv],
    [faBoxOpen, "unarchive", "hover:text-accent", () => onUnarchive(archive)],
    [faTrash, "delete", "hover:text-red-600", () => onDelete(archive)],
  ];

  return (
    <li className="bg-surface rounded-surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
      <div className="min-w-0 lg:flex-1">
        <h3 className="text-text truncate text-base font-bold" title={name}>
          {name}
        </h3>
        <p className="text-light-gray text-xs">
          {t("archives.archivedOn", { date: archivedOn })}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-md">
        {COUNTS.map(([key, accent]) => (
          <div key={key} className="flex min-w-0 flex-col-reverse">
            <dt className="text-muted truncate text-[10px] font-bold tracking-wide uppercase">
              {t(`archives.${key}`)}
            </dt>
            <dd className={`text-xl font-bold ${accent}`}>{summary[key]}</dd>
          </div>
        ))}
      </dl>

      <div className="-mx-2 flex gap-1 lg:mx-0">
        {actions.map(([icon, key, hover, onClick]) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            title={t(`archives.${key}`)}
            aria-label={`${t(`archives.${key}`)}: ${name}`}
            className={`${actionClass} ${hover}`}
          >
            <FontAwesomeIcon icon={icon} />
          </button>
        ))}
      </div>
    </li>
  );
}

export default function Archives({
  applications,
  archives,
  onArchive,
  onUnarchive,
  onDelete,
  notify,
}) {
  const { t, locale } = useI18n();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const suggestion = suggestArchiveName(applications, locale);

  const handleArchive = (event) => {
    event.preventDefault();
    if (applications.length === 0) {
      notify(t("archives.nothingToArchive"), "error");
      return;
    }

    onArchive(name.trim() || suggestion);
    notify(t("archives.archived", { count: applications.length }));
    setName("");
  };

  const ask = (action) => (archive) => {
    setPending({ archive, action });
    setConfirming(true);
  };

  const handleConfirm = () => {
    const { archive, action } = pending;
    setConfirming(false);

    if (action === "unarchive") {
      onUnarchive(archive.id);
      notify(t("archives.unarchived", { count: archive.applications.length }));
    } else {
      onDelete(archive.id);
      notify(t("archives.deleted"));
    }
  };

  const unarchiving = pending?.action === "unarchive";

  return (
    <>
      <div>
        <h1 className="text-text text-2xl font-bold">{t("archives.title")}</h1>
        <p className="text-muted mt-1 text-sm">{t("archives.subtitle")}</p>
      </div>

      <section className="bg-surface rounded-surface mt-6 p-5">
        <h2 className="text-text text-base font-bold">
          {t("archives.archiveTitle")}
        </h2>
        <p className="text-light-gray text-xs">
          {applications.length > 0
            ? t("archives.archiveHint", { count: applications.length })
            : t("archives.nothingToArchive")}
        </p>

        <form
          onSubmit={handleArchive}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative sm:flex-1">
            <FontAwesomeIcon
              icon={faTag}
              className="text-light-gray absolute top-1/2 left-4 -translate-y-1/2 text-xs"
            />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={suggestion}
              maxLength={80}
              aria-label={t("archives.name")}
              disabled={applications.length === 0}
              className="bg-bg text-text placeholder:text-light-gray w-full rounded-full py-2.5 pr-4 pl-10 text-sm disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={applications.length === 0}
            className="bg-accent inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-52"
          >
            <FontAwesomeIcon icon={faBoxArchive} />
            {t("archives.archive")}
          </button>
        </form>
      </section>

      <h2 className="text-text mt-8 text-lg font-bold">
        {t("archives.listTitle")}
      </h2>

      {archives.length === 0 ? (
        <div className="bg-surface rounded-surface text-muted mt-4 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <FontAwesomeIcon
            icon={faBoxArchive}
            className="text-light-gray text-3xl"
          />
          <p className="text-sm">{t("archives.empty")}</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {archives.map((archive) => (
            <ArchiveRow
              key={archive.id}
              archive={archive}
              onUnarchive={ask("unarchive")}
              onDelete={ask("delete")}
              onExported={(count) => notify(t("file.exported", { count }))}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirming}
        title={t(
          unarchiving ? "archives.unarchiveTitle" : "archives.confirmTitle",
        )}
        message={
          pending
            ? t(
                unarchiving
                  ? "archives.unarchiveMessage"
                  : "archives.confirmMessage",
                {
                  name: archiveName(pending.archive, locale),
                  count: pending.archive.applications.length,
                },
              )
            : ""
        }
        confirmLabel={unarchiving ? t("archives.unarchive") : undefined}
        tone={unarchiving ? "accent" : "danger"}
        onCancel={() => setConfirming(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
