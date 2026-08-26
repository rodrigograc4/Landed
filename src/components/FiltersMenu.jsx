import { Fragment, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronDown,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import useDismiss from "../hooks/useDismiss";
import { useI18n } from "../i18n";

function Option({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
        selected
          ? "text-accent bg-bg"
          : "text-text hover:bg-bg focus-visible:bg-bg"
      }`}
    >
      <span className="flex w-3.5 shrink-0 justify-center">
        {selected && (
          <FontAwesomeIcon icon={faCheck} className="text-accent text-xs" />
        )}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * Multi-select filter menu. Each group keeps its own list of picked values,
 * an empty list meaning everything, and the menu only closes on outside click.
 */
export default function FiltersMenu({ groups, className = "" }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const container = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, container);

  const active = groups.reduce(
    (total, group) => total + group.picked.length,
    0,
  );

  const toggle = (group, value) => {
    const picked = group.picked.includes(value)
      ? group.picked.filter((item) => item !== value)
      : [...group.picked, value];
    group.onChange(picked);
  };

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 text-left text-sm transition-colors ${className}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <FontAwesomeIcon
            icon={faFilter}
            className="text-light-gray shrink-0 text-xs"
          />
          <span className="truncate">{t("applications.filters")}</span>
          {active > 0 && (
            <span className="bg-accent flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">
              {active}
            </span>
          )}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-light-gray text-[10px] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("applications.filters")}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="bg-surface absolute z-40 mt-2 w-full rounded-2xl p-1.5 shadow-xl"
          >
            {groups.map((group, index) => (
              <Fragment key={group.key}>
                {index > 0 && <hr className="border-bg my-1.5 border-t" />}
                <Option
                  selected={group.picked.length === 0}
                  onClick={() => group.onChange([])}
                >
                  {group.allLabel}
                </Option>
                {group.options.map((option) => (
                  <Option
                    key={option.value}
                    selected={group.picked.includes(option.value)}
                    onClick={() => toggle(group, option.value)}
                  >
                    {option.label}
                  </Option>
                ))}
              </Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
