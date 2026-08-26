import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside the panel, ignoring layers that do not hold the focus. */
function trapFocus(event, panel) {
  if (!panel?.contains(document.activeElement)) return;

  const items = [...panel.querySelectorAll(FOCUSABLE)].filter(
    (node) => node.offsetParent !== null,
  );
  if (items.length === 0) return;

  const first = items[0];
  const last = items[items.length - 1];
  const leavingStart =
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === panel);

  if (leavingStart) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Shared plumbing for the dialogs and the drawer: Escape closes the layer, the
 * page behind stops scrolling, and focus moves into the panel and back out.
 */
export default function useModalLayer(open, onClose, panelRef) {
  useEffect(() => {
    if (!open) return undefined;

    const restoreTo = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") trapFocus(event, panelRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.();
    };
  }, [open, onClose, panelRef]);
}
