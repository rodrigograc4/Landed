import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Notes clamped to `lines`, or the full text when `expanded`. The toggle lives
 * on the parent, so this only reports through `onTruncatedChange` whether
 * there is anything to expand.
 */
export default function NotesCell({
  notes,
  expanded,
  onTruncatedChange,
  onToggle,
  lines = 2,
  className = "",
}) {
  const [truncated, setTruncated] = useState(false);
  const ref = useRef(null);
  const reportedRef = useRef(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const isTruncated = el.scrollHeight > el.clientHeight + 1;
    setTruncated(isTruncated);
    if (reportedRef.current !== isTruncated) {
      reportedRef.current = isTruncated;
      onTruncatedChange(isTruncated);
    }
  }, [expanded, onTruncatedChange]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, notes]);

  if (!notes) return <p className={`text-muted ${className}`}>-</p>;

  const interactive = Boolean(onToggle) && (truncated || expanded);

  return (
    <p
      ref={ref}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-expanded={interactive ? expanded : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onToggle();
            }
          : undefined
      }
      style={
        expanded
          ? undefined
          : {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: lines,
              overflow: "hidden",
            }
      }
      className={`text-muted break-words ${className}`}
    >
      {notes}
    </p>
  );
}
