import { useEffect, useRef } from "react";

export default function useDebouncedSectionsAutosave({
  sections,
  onSave,
  delay = 1000,
  enabled = true,
}) {
  const saveRef = useRef(onSave);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled || typeof saveRef.current !== "function") return undefined;
    const timeoutId = window.setTimeout(() => {
      saveRef.current(sections);
    }, Math.max(250, Number(delay) || 1000));
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, enabled, sections]);
}
