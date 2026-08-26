import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";
import { VIEW_VALUES } from "../utils/constants";
import { useI18n } from "../i18n";

const VIEW_ICONS = { rows: faTableList, cards: faTableCellsLarge };

/**
 * The green thumb is a single element shared by both buttons through its
 * layout id, so framer-motion slides it across instead of cutting.
 */
export default function ViewToggle({ view, onChange }) {
  const { t } = useI18n();

  return (
    <div className="bg-surface flex shrink-0 items-center rounded-full">
      {VIEW_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={view === value}
          title={t(`applications.view_${value}`)}
          aria-label={t(`applications.view_${value}`)}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
            view === value ? "text-white" : "text-light-gray hover:text-text"
          }`}
        >
          {view === value && (
            <motion.span
              layoutId="viewToggleThumb"
              className="bg-accent absolute inset-0 rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <FontAwesomeIcon icon={VIEW_ICONS[value]} className="relative z-10" />
        </button>
      ))}
    </div>
  );
}
