import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "../i18n";

/**
 * Builds the page list with gaps ("...") so the control keeps a fixed width
 * however many pages there are: 1 ... 4 5 6 ... 12
 */
function pageItems(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const around = [page - 1, page, page + 1].filter(
    (value) => value > 1 && value < total,
  );
  const pages = [1, ...around, total];

  return pages.flatMap((value, index) =>
    index > 0 && value - pages[index - 1] > 1 ? ["gap", value] : [value],
  );
}

const arrowClass =
  "bg-surface text-light-gray hover:text-accent flex h-9 w-9 items-center justify-center rounded-full text-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-light-gray";

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label={t("pagination.previous")}
        className={arrowClass}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="text-light-gray flex h-9 w-6 items-center justify-center text-sm"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={t("pagination.page", { page: item })}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm tabular-nums transition-colors ${
              item === page
                ? "bg-accent font-bold text-white"
                : "bg-surface text-muted hover:text-accent hover:font-bold"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label={t("pagination.next")}
        className={arrowClass}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </nav>
  );
}
