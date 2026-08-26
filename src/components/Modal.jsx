import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useModalLayer from "../hooks/useModalLayer";

/** Centred dialog shell: overlay, panel animation and dismissal behaviour. */
export default function Modal({
  open,
  onClose,
  label,
  className = "max-w-md",
  children,
}) {
  const panel = useRef(null);
  useModalLayer(open, onClose, panel);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-label={label}
            className={`bg-surface rounded-surface relative w-full p-6 shadow-2xl focus:outline-none ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
