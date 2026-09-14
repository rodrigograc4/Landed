import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { STATUS_VALUES, WORK_MODE_VALUES } from "../utils/constants";
import Select from "./Select";
import { emptyApplication, hasDate, todayISO } from "../utils/application";
import useModalLayer from "../hooks/useModalLayer";
import { useI18n } from "../i18n";

const fieldClass =
  "w-full rounded-xl bg-bg px-3 py-2.5 text-sm text-text placeholder:text-light-gray";

function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      <span className="text-muted mb-1.5 block text-xs font-bold tracking-wide uppercase">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
      {!error && hint && (
        <span className="text-light-gray mt-1 block text-xs">{hint}</span>
      )}
    </label>
  );
}

export default function ApplicationDrawer({
  open,
  application,
  onClose,
  onSave,
  onDelete,
}) {
  const { t } = useI18n();
  const [form, setForm] = useState(emptyApplication);
  const [errors, setErrors] = useState({});
  const panel = useRef(null);

  useModalLayer(open, onClose, panel);

  useEffect(() => {
    if (!open) return;
    setForm(application ?? emptyApplication());
    setErrors({});
  }, [open, application]);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const updateValue = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));

  /**
   * Switching to a saved posting clears the application date - there is none
   * yet. Switching back restores today's date so the field is never empty.
   */
  const updateStatus = (status) => {
    if (!hasDate(status)) {
      setErrors((current) => ({ ...current, date: undefined }));
    }
    setForm((current) => ({
      ...current,
      status,
      date: hasDate(status) ? current.date || todayISO() : "",
    }));
  };

  const dateEnabled = hasDate(form.status);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.company.trim()) nextErrors.company = t("form.errorCompany");
    if (!form.role.trim()) nextErrors.role = t("form.errorRole");
    if (hasDate(form.status) && !form.date)
      nextErrors.date = t("form.errorDate");

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave(form);
  };

  const title = form.id ? t("form.editTitle") : t("form.createTitle");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="bg-surface relative flex h-full w-full max-w-xl flex-col shadow-2xl focus:outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between px-7 py-5">
              <h2 className="text-text text-lg font-bold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("form.close")}
                className="text-light-gray hover:text-text rounded-full px-2 py-1 transition-colors hover:bg-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-5"
            >
              <Field label={t("form.company")} required error={errors.company}>
                <input
                  className={fieldClass}
                  value={form.company}
                  onChange={update("company")}
                  placeholder={t("form.companyPlaceholder")}
                  maxLength={120}
                />
              </Field>

              <Field label={t("form.role")} required error={errors.role}>
                <input
                  className={fieldClass}
                  value={form.role}
                  onChange={update("role")}
                  placeholder={t("form.rolePlaceholder")}
                  maxLength={120}
                />
              </Field>

              <Field label={t("form.location")}>
                <input
                  className={fieldClass}
                  value={form.location}
                  onChange={update("location")}
                  placeholder={t("form.locationPlaceholder")}
                  maxLength={80}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={t("form.workMode")} required>
                  <Select
                    value={form.workMode}
                    onChange={updateValue("workMode")}
                    options={WORK_MODE_VALUES.map((value) => ({
                      value,
                      label: t(`workMode.${value}`),
                    }))}
                    className={fieldClass}
                  />
                </Field>

                <Field label={t("form.status")} required>
                  <Select
                    value={form.status}
                    onChange={updateStatus}
                    options={STATUS_VALUES.map((value) => ({
                      value,
                      label: t(`status.${value}`),
                    }))}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <Field
                label={t("form.date")}
                required={dateEnabled}
                error={errors.date}
                hint={dateEnabled ? undefined : t("form.dateSavedHint")}
              >
                <input
                  type="date"
                  className={`${fieldClass} disabled:text-light-gray disabled:cursor-not-allowed`}
                  value={form.date}
                  onChange={update("date")}
                  disabled={!dateEnabled}
                />
              </Field>

              <Field label={t("form.source")}>
                <input
                  className={fieldClass}
                  value={form.source}
                  onChange={update("source")}
                  placeholder={t("form.sourcePlaceholder")}
                  maxLength={60}
                />
              </Field>

              <Field label={t("form.link")}>
                <input
                  type="url"
                  className={fieldClass}
                  value={form.link}
                  onChange={update("link")}
                  placeholder="https://..."
                />
              </Field>

              <Field label={t("form.notes")}>
                <textarea
                  rows={5}
                  className={`${fieldClass} resize-none`}
                  value={form.notes}
                  onChange={update("notes")}
                  placeholder={t("form.notesPlaceholder")}
                  maxLength={2000}
                />
              </Field>

              {form.id && (
                <button
                  type="button"
                  onClick={() => onDelete(application)}
                  className="mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full px-1 py-1 text-sm font-bold text-red-600 transition-opacity hover:opacity-70"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {t("form.delete")}
                </button>
              )}

              <div className={`flex gap-3 pt-2 ${form.id ? "" : "mt-auto"}`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-bg text-muted hover:text-text flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white"
                >
                  {t("form.cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-accent flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  {form.id ? t("form.save") : t("form.add")}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
