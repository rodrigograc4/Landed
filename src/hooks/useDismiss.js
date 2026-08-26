import { useEffect } from "react";

/**
 * Closes a floating layer on outside click and on Escape.
 * Shared by every menu so the dismissal behaviour stays identical.
 */
export default function useDismiss(open, onDismiss, containerRef) {
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onDismiss();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onDismiss, containerRef]);
}
