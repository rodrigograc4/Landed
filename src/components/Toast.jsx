import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isError = toast?.type === "error";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role={isError ? "alert" : "status"}
          className={`bg-surface fixed bottom-6 left-1/2 z-50 flex max-w-[90vw] items-center gap-3 rounded-full px-5 py-3 text-sm shadow-xl ${
            isError ? "text-rose-700" : "text-text"
          }`}
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
        >
          <FontAwesomeIcon
            icon={isError ? faCircleExclamation : faCircleCheck}
            className={isError ? "text-rose-600" : "text-accent"}
          />
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
