import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import useDismiss from "../hooks/useDismiss";

const MENU_WIDTH = "w-48";

/**
 * Menu anchored to a trigger button. Closes on outside click, on Escape and
 * whenever an item is picked, so callers never manage that state themselves.
 */
export default function Dropdown({
  label,
  icon,
  children,
  menuClassName = MENU_WIDTH,
  triggerClassName = "",
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, container);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`inline-flex h-9 items-center justify-center gap-2 rounded-full text-sm font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white ${triggerClassName}`}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
        {label}
        <span className="hidden sm:inline">
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            onClick={() => setOpen(false)}
            className={`bg-surface absolute right-0 z-40 mt-2 overflow-hidden rounded-2xl p-1.5 shadow-xl ${menuClassName}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon, onClick, active = false, children }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
        active ? "text-accent bg-bg" : "text-text hover:bg-bg"
      }`}
    >
      <span className="flex w-3.5 justify-center">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={`text-xs ${active ? "text-accent" : "text-light-gray"}`}
          />
        )}
      </span>
      {children}
    </button>
  );
}
