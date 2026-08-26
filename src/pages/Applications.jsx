import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ApplicationsTable from "../components/ApplicationsTable";
import ApplicationsGrid from "../components/ApplicationsGrid";
import ApplicationsToolbar from "../components/ApplicationsToolbar";
import ApplicationDrawer from "../components/ApplicationDrawer";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import {
  PAGE_SIZE,
  UNSUCCESSFUL,
  UNSUCCESSFUL_STATUSES,
} from "../utils/constants";
import { sortApplications } from "../utils/application";
import { loadView, saveView } from "../utils/storage";
import { useI18n } from "../i18n";

export default function Applications({ applications, onSave, onDelete }) {
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [sort, setSort] = useState("date");
  const [view, setView] = useState(loadView);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveView(view);
  }, [view]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    const matches = applications.filter((application) => {
      const matchesStatus =
        statuses.length === 0 ||
        statuses.some((value) =>
          value === UNSUCCESSFUL
            ? UNSUCCESSFUL_STATUSES.includes(application.status)
            : application.status === value,
        );
      const matchesWorkMode =
        workModes.length === 0 || workModes.includes(application.workMode);
      const matchesTerm =
        term === "" ||
        [
          application.company,
          application.role,
          application.location,
          application.source,
          application.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesWorkMode && matchesTerm;
    });

    return sortApplications(matches, sort);
  }, [applications, query, sort, statuses, workModes]);

  const totalPages = Math.max(Math.ceil(visible.length / PAGE_SIZE), 1);

  /** Filtering or deleting can leave the current page past the end. */
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, statuses, workModes]);

  const pageStart = (Math.min(page, totalPages) - 1) * PAGE_SIZE;
  const paginated = useMemo(
    () => visible.slice(pageStart, pageStart + PAGE_SIZE),
    [visible, pageStart],
  );

  const changePage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (application) => {
    setEditing(application);
    setDrawerOpen(true);
  };

  const handleSave = (draft) => {
    onSave(draft);
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    onDelete(pendingDelete.id);
    setPendingDelete(null);
    setDrawerOpen(false);
    setEditing(null);
  };

  const countKey = applications.length === 1 ? "countOne" : "countMany";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-text text-2xl font-bold">
            {t("applications.title")}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {t(`applications.${countKey}`, { count: applications.length })}
            {visible.length !== applications.length &&
              ` · ${t("applications.visible", { count: visible.length })}`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-accent inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-52"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("applications.create")}
        </button>
      </div>

      <div className="mt-6">
        <ApplicationsToolbar
          query={query}
          onQueryChange={setQuery}
          view={view}
          onViewChange={setView}
          sort={sort}
          onSortChange={setSort}
          statuses={statuses}
          onStatusesChange={setStatuses}
          workModes={workModes}
          onWorkModesChange={setWorkModes}
        />
      </div>

      <div className="mt-6">
        {view === "cards" ? (
          <ApplicationsGrid
            applications={paginated}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        ) : (
          <ApplicationsTable
            applications={paginated}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={changePage}
          />
          <p className="text-light-gray text-xs">
            {t("pagination.range", {
              from: pageStart + 1,
              to: pageStart + paginated.length,
              total: visible.length,
            })}
          </p>
        </div>
      )}

      <ApplicationDrawer
        open={drawerOpen}
        application={editing}
        onClose={() => !pendingDelete && setDrawerOpen(false)}
        onSave={handleSave}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("confirm.title")}
        message={
          pendingDelete
            ? t("confirm.message", {
                role: pendingDelete.role,
                company: pendingDelete.company,
              })
            : ""
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
