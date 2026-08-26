import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faCalendarDay,
  faLocationDot,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "./Badge";
import EmptyState from "./EmptyState";
import NotesCell from "./NotesCell";
import { formatDate } from "../utils/application";
import { useI18n } from "../i18n";

function Meta({ icon, children }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <FontAwesomeIcon icon={icon} className="text-light-gray text-[11px]" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ApplicationCard({ application, onEdit }) {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const isRemote = application.workMode === "remote";

  const toggles = truncated || expanded;
  const toggle = () => setExpanded((value) => !value);

  const place = isRemote
    ? [t("workMode.remote"), application.location].filter(Boolean).join(" · ")
    : [application.location, t(`workMode.${application.workMode}`)]
        .filter(Boolean)
        .join(" · ");

  return (
    <article
      className={`bg-surface rounded-surface flex min-w-0 flex-col gap-3 p-5 ${
        toggles ? "cursor-pointer" : ""
      }`}
      onClick={toggles ? toggle : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-text flex items-center gap-2 font-bold">
            <span className="truncate">{application.company}</span>
            {application.link && (
              <a
                href={application.link}
                target="_blank"
                rel="noreferrer"
                title={t("table.openPosting")}
                onClick={(event) => event.stopPropagation()}
                className="text-light-gray hover:text-accent shrink-0 text-xs transition-colors"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </a>
            )}
          </h3>
          <p className="text-muted truncate text-sm">{application.role}</p>
        </div>
        <span className="shrink-0">
          <StatusBadge status={application.status} />
        </span>
      </div>

      <div className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <Meta icon={faLocationDot}>{place || "-"}</Meta>
        {application.date && (
          <Meta icon={faCalendarDay}>
            {formatDate(application.date, locale)}
          </Meta>
        )}
      </div>

      <NotesCell
        notes={application.notes}
        expanded={expanded}
        onTruncatedChange={setTruncated}
        onToggle={toggle}
        className="text-sm"
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(application);
        }}
        aria-label={t("table.edit", { company: application.company })}
        className="text-light-gray hover:text-accent mt-auto self-end rounded-full px-2 py-1.5 text-sm transition-colors hover:bg-white"
      >
        <FontAwesomeIcon icon={faPen} />
      </button>
    </article>
  );
}

export default function ApplicationsGrid({ applications, onEdit, onCreate }) {
  if (applications.length === 0) return <EmptyState onCreate={onCreate} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
