import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { GITHUB_LICENSE, GITHUB_PROFILE } from "../utils/constants";
import { useI18n } from "../i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16">
      <div className="text-muted mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-xs sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <p>
          {t("footer.tagline")} · v{__APP_VERSION__}
        </p>
        <div className="flex items-center gap-4">
          <a
            href={GITHUB_LICENSE}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent transition-colors"
          >
            {t("footer.license")}
          </a>
          <a
            href={GITHUB_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent inline-flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faGithub} />
            rodrigograc4
          </a>
        </div>
      </div>
    </footer>
  );
}
