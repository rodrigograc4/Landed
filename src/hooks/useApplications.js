import { useCallback, useEffect, useState } from "react";
import {
  loadApplications,
  loadArchives,
  loadDeletions,
  saveApplications,
  saveArchives,
  saveDeletions,
} from "../utils/storage";
import {
  createId,
  mergeApplications,
  normalizeApplication,
  sortApplications,
} from "../utils/application";
import { createArchiveId } from "../utils/archive";

const logDeletions = (current, ids) => {
  const deletedAt = new Date().toISOString();
  return [
    ...current.filter((entry) => !ids.includes(entry.id)),
    ...ids.map((id) => ({ id, deletedAt })),
  ];
};

/**
 * Single source of truth for the applications and archives, mirrored to
 * localStorage, with the deletion log that tells "deleted" from "never seen".
 */
export default function useApplications() {
  const [applications, setApplications] = useState(loadApplications);
  const [archives, setArchives] = useState(loadArchives);
  const [deleted, setDeleted] = useState(loadDeletions);

  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    const saved = [
      saveApplications(applications),
      saveArchives(archives),
      saveDeletions(deleted),
    ];
    setStorageFailed(saved.includes(false));
  }, [applications, archives, deleted]);

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
    setDeleted((current) => logDeletions(current, [id]));
  }, []);

  const archive = useCallback(
    (name) => {
      if (applications.length === 0) return;

      setArchives((current) => [
        {
          id: createArchiveId(),
          name: name.trim().slice(0, 80),
          archivedAt: new Date().toISOString(),
          applications,
        },
        ...current,
      ]);
      setApplications([]);
    },
    [applications],
  );

  const unarchive = useCallback(
    (id) => {
      const target = archives.find((item) => item.id === id);
      if (!target) return;

      setArchives((current) => current.filter((item) => item.id !== id));
      setApplications((current) =>
        mergeApplications(current, target.applications),
      );
      setDeleted((current) => logDeletions(current, [id]));
    },
    [archives],
  );

  const removeArchive = useCallback(
    (id) => {
      const target = archives.find((item) => item.id === id);
      if (!target) return;

      setArchives((current) => current.filter((item) => item.id !== id));
      setDeleted((current) =>
        logDeletions(current, [
          id,
          ...target.applications.map((item) => item.id),
        ]),
      );
    },
    [archives],
  );

  /** Takes a backup as the whole truth, its deletion log included. */
  const replaceAll = useCallback((backup) => {
    setApplications(sortApplications(backup.applications));
    setArchives(backup.archives);
    setDeleted(backup.deleted);
  }, []);

  /** Stores the result of planMerge. */
  const applyMerge = useCallback((merged) => {
    setApplications(merged.applications);
    setArchives(merged.archives);
    setDeleted(merged.deleted);
  }, []);

  return {
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
  };
}
