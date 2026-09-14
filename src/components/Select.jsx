import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import useDismiss from "../hooks/useDismiss";

/**
 * Custom listbox used everywhere instead of a native <select>, so the app
 * looks the same on every operating system. Options are { value, label }.
 */
export default function Select({
  value,
  options,
  onChange,
  className = "",
  icon,
}) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const itemRefs = useRef([]);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, container);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (open) itemRefs.current[Math.max(selectedIndex, 0)]?.focus();
  }, [open, selectedIndex]);

  const handleMenuKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();

    const current = itemRefs.current.indexOf(document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = (current + step + options.length) % options.length;
    itemRefs.current[next]?.focus();
  };

  const pick = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 text-left text-sm transition-colors ${className}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className="text-light-gray shrink-0 text-xs"
            />
          )}
          <span className="truncate">{selected?.label ?? ""}</span>
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
          <motion.ul
            role="listbox"
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="bg-surface absolute z-40 mt-2 w-full rounded-2xl p-1.5 shadow-xl"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => pick(option)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none ${
                      isSelected
                        ? "text-accent bg-bg"
                        : "text-text hover:bg-bg focus:bg-bg"
                    }`}
                  >
                    <span className="flex w-3.5 justify-center">
                      {isSelected && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-accent text-xs"
                        />
                      )}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
