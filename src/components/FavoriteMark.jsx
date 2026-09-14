import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faHeart as faHeartSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { useI18n } from "../i18n";

export default function FavoriteMark({
  application,
  onToggle,
  className = "",
}) {
  const { t } = useI18n();

  if (application.status === "landed") {
    return (
      <span
        title={t("table.landed")}
        className={`text-briefcase inline-flex px-2 py-1.5 text-sm ${className}`}
      >
        <FontAwesomeIcon icon={faBriefcase} />
      </span>
    );
  }

  const { favorite } = application;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle(application);
      }}
      aria-pressed={favorite}
      title={t(favorite ? "table.unfavorite" : "table.favorite")}
      className={`rounded-full px-2 py-1.5 text-sm transition-colors hover:bg-white ${
        favorite ? "text-red-600" : "text-light-gray"
      } ${className}`}
    >
      <FontAwesomeIcon icon={favorite ? faHeartSolid : faHeart} />
    </button>
  );
}
