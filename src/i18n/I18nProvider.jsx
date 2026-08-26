import { useCallback, useEffect, useMemo, useState } from "react";
import { LANGUAGE_KEY } from "../utils/constants";
import {
  DEFAULT_LANGUAGE,
  I18nContext,
  LANGUAGES,
  detectLanguage,
  interpolate,
  resolveKey,
} from "./context";

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES[next]) return;
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const dictionary = LANGUAGES[language] ?? LANGUAGES[DEFAULT_LANGUAGE];

    const t = (path, values) => {
      const entry =
        resolveKey(dictionary, path) ??
        resolveKey(LANGUAGES[DEFAULT_LANGUAGE], path);
      if (typeof entry !== "string") return path;
      return values ? interpolate(entry, values) : entry;
    };

    return { t, language, setLanguage, locale: dictionary.meta.locale };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
