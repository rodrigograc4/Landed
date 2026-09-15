import { useCallback, useEffect, useState } from "react";
import {
  loadApplications,
  loadDeletions,
  saveApplications,
  saveDeletions,
} from "../utils/storage";
import {
  createId,
  normalizeApplication,
  sortApplications,
} from "../utils/application";

/**
 * Single source of truth for the applications, mirrored to localStorage, along
 * with the log of deletions that lets a merge tell "deleted" from "never seen".
 */
export default function useApplications() {
  const [applications, setApplications] = useState(loadApplications);
  const [deleted, setDeleted] = useState(loadDeletions);

  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    const saved = saveApplications(applications);
    setStorageFailed(!(saveDeletions(deleted) && saved));
  }, [applications, deleted]);

  const upsert = useCallback((draft) => {
    const application = normalizeApplication({
      ...draft,
      id: draft.id ?? createId(),
      updatedAt: new Date().toISOString(),
    });
    if (!application) return;

    setApplications((current) => {
      const exists = current.some((item) => item.id === application.id);
      const next = exists
        ? current.map((item) =>
            item.id === application.id ? application : item,
          )
        : [...current, application];
      return sortApplications(next);
    });
  }, []);

  const remove = useCallback((id) => {
    setApplications((current) => current.filter((item) => item.id !== id));
    setDeleted((current) => [
      ...current.filter((entry) => entry.id !== id),
      { id, deletedAt: new Date().toISOString() },
    ]);
  }, []);

  /** Takes a backup as the whole truth, its deletion log included. */
  const replaceAll = useCallback((backup) => {
    setApplications(sortApplications(backup.applications));
    setDeleted(backup.deleted);
  }, []);

  /** Stores the result of planMerge. */
  const applyMerge = useCallback((merged) => {
    setApplications(merged.applications);
    setDeleted(merged.deleted);
  }, []);

  return {
    applications,
    deleted,
    storageFailed,
    upsert,
    remove,
    replaceAll,
    applyMerge,
  };
}
