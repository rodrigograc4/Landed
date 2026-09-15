import { DELETED_KEY, STORAGE_KEY, VIEW_KEY, VIEW_VALUES } from "./constants";
import {
  normalizeApplication,
  normalizeDeletion,
  sortApplications,
} from "./application";

/** Reads localStorage, ignoring anything invalid (broken JSON, an older shape). */
export function loadApplications() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortApplications(parsed.map(normalizeApplication).filter(Boolean));
  } catch {
    return [];
  }
}

export function saveApplications(applications) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    return true;
  } catch {
    return false;
  }
}

export function loadDeletions() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DELETED_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeDeletion).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function saveDeletions(deletions) {
  try {
    window.localStorage.setItem(DELETED_KEY, JSON.stringify(deletions));
    return true;
  } catch {
    return false;
  }
}

export function loadView() {
  try {
    const stored = window.localStorage.getItem(VIEW_KEY);
    return VIEW_VALUES.includes(stored) ? stored : VIEW_VALUES[0];
  } catch {
    return VIEW_VALUES[0];
  }
}

export function saveView(view) {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
    return true;
  } catch {
    return false;
  }
}
