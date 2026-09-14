import { useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faCheck,
  faDatabase,
  faFileArrowDown,
  faFileArrowUp,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Dropdown, { DropdownItem } from "./Dropdown";
import { GITHUB_REPO } from "../utils/constants";
import { LANGUAGES, useI18n } from "../i18n";

const controlClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors w-9 px-0 sm:w-auto sm:px-3.5";

const linkClass = ({ isActive }) =>
  `${controlClass} ${
    isActive
      ? "bg-white/15 text-white"
      : "text-white/80 hover:bg-white/10 hover:text-white"
  }`;

const Label = ({ children }) => (
  <span className="hidden sm:inline">{children}</span>
);

export default function Navbar({ onImport, onExport }) {
  const fileInput = useRef(null);
  const { t, language, setLanguage } = useI18n();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  };

  return (
    <header className="bg-accent sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-3 py-3 sm:gap-2 sm:px-6">
        <Link
          to="/"
          className="mr-auto flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img src="/icon.png" alt="" className="h-6 w-auto object-contain" />
          <span className="text-xl font-bold text-white">Landed</span>
        </Link>

        <NavLink to="/stats" className={linkClass} title={t("nav.stats")}>
          <FontAwesomeIcon icon={faChartPie} className="text-xs" />
          <Label>{t("nav.stats")}</Label>
        </NavLink>

        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <Dropdown
          icon={faDatabase}
          ariaLabel={t("nav.backup")}
          label={<Label>{t("nav.backup")}</Label>}
          triggerClassName="w-9 px-0 sm:w-auto sm:px-3.5"
        >
          <DropdownItem
            icon={faFileArrowUp}
            onClick={() => fileInput.current?.click()}
          >
            {t("nav.import")}
          </DropdownItem>
          <DropdownItem icon={faFileArrowDown} onClick={onExport}>
            {t("nav.export")}
          </DropdownItem>
        </Dropdown>

        <Dropdown
          icon={faGlobe}
          ariaLabel={language.toUpperCase()}
          label={<Label>{language.toUpperCase()}</Label>}
          triggerClassName="w-9 px-0 sm:w-auto sm:px-3.5"
        >
          {Object.entries(LANGUAGES).map(([code, dictionary]) => (
            <DropdownItem
              key={code}
              icon={code === language ? faCheck : undefined}
              active={code === language}
              onClick={() => setLanguage(code)}
            >
              {dictionary.meta.name}
            </DropdownItem>
          ))}
        </Dropdown>

        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noreferrer"
          title={t("nav.github")}
          aria-label={t("nav.github")}
          className={`${controlClass} w-9 px-0 text-white/80 hover:bg-white/10 hover:text-white sm:w-9 sm:px-0`}
        >
          <FontAwesomeIcon icon={faGithub} className="text-base" />
        </a>
      </div>
    </header>
  );
}
