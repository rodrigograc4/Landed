import { createContext, useContext } from "react";
import { LANGUAGE_KEY } from "../utils/constants";
import pt from "./pt";
import en from "./en";

export const LANGUAGES = { en, pt };

export const DEFAULT_LANGUAGE = "en";

function storedLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export function detectLanguage() {
  const stored = storedLanguage();
  if (stored && LANGUAGES[stored]) return stored;

  const candidates = window.navigator?.languages ?? [
    window.navigator?.language,
  ];
  return (
    candidates
      .filter(Boolean)
      .map((tag) => String(tag).slice(0, 2).toLowerCase())
      .find((code) => LANGUAGES[code]) ?? DEFAULT_LANGUAGE
  );
}

export function resolveKey(dictionary, path) {
  return path.split(".").reduce((node, key) => node?.[key], dictionary);
}

export const interpolate = (template, values) =>
  template.replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined ? match : String(values[key]),
  );

export const I18nContext = createContext(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>.");
  return context;
}
