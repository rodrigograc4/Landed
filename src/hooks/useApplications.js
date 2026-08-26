import { useCallback, useEffect, useState } from "react";
import { loadApplications, saveApplications } from "../utils/storage";
import {
  createId,
  mergeApplications,
  normalizeApplication,
  sortApplications,
} from "../utils/application";

/** Single source of truth for the applications, mirrored to localStorage. */
export default function useApplications() {
  const [applications, setApplications] = useState(loadApplications);

  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    setStorageFailed(!saveApplications(applications));
  }, [applications]);

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
  }, []);

  const replaceAll = useCallback((list) => {
    setApplications(sortApplications(list));
  }, []);

  const mergeAll = useCallback((list) => {
    setApplications((current) => mergeApplications(current, list));
  }, []);

  return { applications, storageFailed, upsert, remove, replaceAll, mergeAll };
}
