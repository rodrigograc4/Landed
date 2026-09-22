import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import ImportDialog from "./components/ImportDialog";
import Applications from "./pages/Applications";
import Stats from "./pages/Stats";
import Archives from "./pages/Archives";
import useApplications from "./hooks/useApplications";
import {
  exportApplications,
  exportApplicationsCsv,
  importApplications,
} from "./utils/backup";
import { planMerge } from "./utils/application";
import { countArchived } from "./utils/archive";
import { useI18n } from "./i18n";

export default function App() {
  const { t } = useI18n();
  const {
    applications,
    archives,
    deleted,
    storageFailed,
    upsert,
    remove,
    archive,
    unarchive,
    removeArchive,
    replaceAll,
    applyMerge,
  } = useApplications();
  const [toast, setToast] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type, at: Date.now() });
  }, []);

  const storageWarned = useRef(false);

  useEffect(() => {
    if (!storageFailed) {
      storageWarned.current = false;
      return;
    }
    if (storageWarned.current) return;

    storageWarned.current = true;
    notify(t("file.storageFailed"), "error");
  }, [notify, storageFailed, t]);

  const exportWith = useCallback(
    (count, write) => {
      if (count === 0) {
        notify(t("file.nothingToExport"), "error");
        return;
      }

      write();
      notify(t("file.exported", { count }));
    },
    [notify, t],
  );

  const handleExport = () =>
    exportWith(applications.length + countArchived(archives), () =>
      exportApplications(applications, deleted, archives),
    );
  const handleExportCsv = () =>
    exportWith(applications.length, () =>
      exportApplicationsCsv(applications, t),
    );

  const handleImport = useCallback(
    async (file) => {
      const result = await importApplications(file);

      if (result.errorKey) {
        notify(t(result.errorKey), "error");
        return;
      }

      setPendingImport(result);
    },
    [notify, t],
  );

  const applyImport = useCallback(
    (mode) => {
      const incoming = pendingImport;
      setPendingImport(null);

      if (mode === "replace") {
        replaceAll(incoming);
        notify(t("file.replaced", { count: incoming.applications.length }));
        return;
      }

      const merged = planMerge({ applications, archives, deleted }, incoming);
      applyMerge(merged);
      const summary = t(
        merged.removed > 0 ? "file.mergedWithRemoved" : "file.merged",
        merged,
      );
      notify(
        merged.archivesAdded > 0
          ? `${summary.replace(/\.$/, "")} · ${t("file.mergedArchives", { count: merged.archivesAdded })}`
          : summary,
      );
    },
    [
      applications,
      applyMerge,
      archives,
      deleted,
      notify,
      pendingImport,
      replaceAll,
      t,
    ],
  );

  return (
    <Router>
      <div className="bg-bg text-text flex min-h-screen flex-col">
        <Navbar
          onImport={handleImport}
          onExport={handleExport}
          onExportCsv={handleExportCsv}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <Routes>
            <Route
              path="/"
              element={
                <Applications
                  applications={applications}
                  onSave={upsert}
                  onDelete={remove}
                />
              }
            />
            <Route
              path="/stats"
              element={<Stats applications={applications} />}
            />
            <Route
              path="/archives"
              element={
                <Archives
                  applications={applications}
                  archives={archives}
                  onArchive={archive}
                  onUnarchive={unarchive}
                  onDelete={removeArchive}
                  notify={notify}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ImportDialog
          open={Boolean(pendingImport)}
          incoming={
            (pendingImport?.imported ?? 0) + (pendingImport?.archived ?? 0)
          }
          archived={pendingImport?.archived ?? 0}
          existing={applications.length}
          existingArchives={archives.length}
          existingArchived={countArchived(archives)}
          skipped={pendingImport?.skipped ?? 0}
          onCancel={() => setPendingImport(null)}
          onMerge={() => applyImport("merge")}
          onReplace={() => applyImport("replace")}
        />

        <Footer />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </Router>
  );
}
