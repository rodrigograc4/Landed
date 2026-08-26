import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "../i18n";

export default function EmptyState({ onCreate }) {
  const { t } = useI18n();

  return (
    <div className="bg-surface rounded-surface text-muted flex flex-col items-center gap-3 px-6 py-16 text-center">
      <FontAwesomeIcon icon={faInbox} className="text-light-gray text-3xl" />
      <p className="text-sm">{t("applications.empty")}</p>
      <button
        type="button"
        onClick={onCreate}
        className="text-accent text-sm font-bold hover:underline"
      >
        {t("applications.emptyAction")}
      </button>
    </div>
  );
}
