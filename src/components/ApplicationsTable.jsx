import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faBriefcase,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "./Badge";
import EmptyState from "./EmptyState";
import NotesCell from "./NotesCell";
import { formatDate } from "../utils/application";
import { useI18n } from "../i18n";

function LocationCell({ location, workMode }) {
  const { t } = useI18n();
  const isRemote = workMode === "remote";

  const primary = isRemote ? t("workMode.remote") : location || "-";
  const secondary = isRemote ? location : t(`workMode.${workMode}`);

  return (
    <>
      <div className="text-text font-bold">{primary}</div>
      {secondary && <div className="text-muted text-xs">{secondary}</div>}
    </>
  );
}

function ApplicationRow({ application, onEdit }) {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const toggles = truncated || expanded;
  const toggle = () => setExpanded((value) => !value);

  return (
    <tr
      className={`hover:bg-bg/70 transition-colors ${
        toggles ? "cursor-pointer" : ""
      }`}
      onClick={toggles ? toggle : undefined}
    >
      <td className="rounded-l-xl px-4 py-3">
        <div className="text-text flex items-center gap-2 font-bold">
          {application.company}
          {application.link && (
            <a
              href={application.link}
              target="_blank"
              rel="noreferrer"
              title={t("table.openPosting")}
              onClick={(event) => event.stopPropagation()}
              className="text-light-gray hover:text-accent text-xs transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </a>
          )}
          {application.status === "landed" && (
            <span title={t("table.landed")} className="text-briefcase text-xs">
              <FontAwesomeIcon icon={faBriefcase} />
            </span>
          )}
        </div>
        <div className="text-muted text-xs">{application.role}</div>
      </td>
      <td className="px-4 py-3">
        <LocationCell
          location={application.location}
          workMode={application.workMode}
        />
      </td>
      <td className="text-muted px-4 py-3 whitespace-nowrap">
        {application.date ? formatDate(application.date, locale) : "-"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>
      <td className="max-w-[240px] px-4 py-3">
        <NotesCell
          notes={application.notes}
          expanded={expanded}
          onTruncatedChange={setTruncated}
          onToggle={toggle}
        />
      </td>
      <td className="w-px rounded-r-xl px-4 py-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(application);
          }}
          aria-label={t("table.edit", { company: application.company })}
          className="text-light-gray hover:text-accent -ml-2.5 rounded-full px-2.5 py-1.5 transition-colors hover:bg-white"
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
      </td>
    </tr>
  );
}

export default function ApplicationsTable({ applications, onEdit, onCreate }) {
  const { t } = useI18n();

  if (applications.length === 0) return <EmptyState onCreate={onCreate} />;

  return (
    <div className="bg-surface rounded-surface overflow-x-auto p-2">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="text-muted text-[11px] tracking-wider uppercase">
            <th className="px-4 py-3 font-bold">{t("table.companyRole")}</th>
            <th className="px-4 py-3 font-bold">{t("table.location")}</th>
            <th className="px-4 py-3 font-bold">{t("table.date")}</th>
            <th className="px-4 py-3 font-bold">{t("table.status")}</th>
            <th className="px-4 py-3 font-bold">{t("table.notes")}</th>
            <th className="relative w-px px-4 py-3">
              <span className="sr-only">{t("table.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
