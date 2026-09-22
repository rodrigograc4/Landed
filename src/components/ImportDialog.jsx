import Modal from "./Modal";
import { useI18n } from "../i18n";

const buttonClass =
  "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors";

/**
 * Asked before an import touches anything: merging keeps what is already
 * there, replacing throws it away, and neither happens by accident.
 */
export default function ImportDialog({
  open,
  incoming,
  archived,
  existing,
  existingArchives,
  existingArchived,
  skipped,
  onCancel,
  onMerge,
  onReplace,
}) {
  const { t } = useI18n();
  const title = t("import.title", { count: incoming });

  return (
    <Modal open={open} onClose={onCancel} label={title}>
      <h3 className="text-text text-lg font-bold">{title}</h3>
      <p className="text-muted mt-2 text-sm">
        {t("import.message", { count: existing })}
      </p>
      {existingArchives > 0 && (
        <p className="mt-1 text-sm text-rose-700">
          {t("import.existingArchives", {
            count: existingArchives,
            archived: existingArchived,
          })}
        </p>
      )}
      {archived > 0 && (
        <p className="text-muted mt-1 text-sm">
          {t("import.archived", { count: archived })}
        </p>
      )}
      {skipped > 0 && (
        <p className="text-light-gray mt-1 text-xs">
          {t("import.skipped", { count: skipped })}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onMerge}
          className={`${buttonClass} bg-accent text-white hover:opacity-90`}
        >
          {t("import.merge")}
        </button>
        <button
          type="button"
          onClick={onReplace}
          className={`${buttonClass} bg-bg text-rose-700 hover:bg-white`}
        >
          {t("import.replace")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${buttonClass} text-muted hover:text-text`}
        >
          {t("import.cancel")}
        </button>
      </div>
    </Modal>
  );
}
