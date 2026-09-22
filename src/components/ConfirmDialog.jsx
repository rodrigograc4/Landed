import Modal from "./Modal";
import { useI18n } from "../i18n";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = "danger",
  onCancel,
  onConfirm,
}) {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onCancel} label={title} className="max-w-sm">
      <h3 className="text-text text-lg font-bold">{title}</h3>
      <p className="text-muted mt-2 text-sm">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-muted hover:text-text bg-bg flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors hover:bg-white"
        >
          {t("confirm.cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 ${
            tone === "danger" ? "bg-red-600" : "bg-accent"
          }`}
        >
          {confirmLabel ?? t("confirm.delete")}
        </button>
      </div>
    </Modal>
  );
}
