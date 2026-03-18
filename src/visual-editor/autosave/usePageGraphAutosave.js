import { useEffect, useRef, useState } from "react";

const DEFAULT_AUTOSAVE_DELAY = 900;

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

const postGraphSnapshot = async ({ pageId, graph, endpoint }) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pageId,
      graph,
    }),
  });
  if (!response.ok) {
    let message = "Autosave failed";
    try {
      const payload = await response.json();
      message = String(payload?.error || message);
    } catch {
      // Ignore malformed payload errors.
    }
    throw new Error(message);
  }
  return response;
};

export default function usePageGraphAutosave({
  pageId,
  graph,
  enabled = true,
  delayMs = DEFAULT_AUTOSAVE_DELAY,
  endpoint = "/api/save-page",
}) {
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [lastError, setLastError] = useState("");
  const timerRef = useRef(0);
  const payloadRef = useRef("");

  useEffect(() => {
    if (!enabled) return undefined;
    const nextPayload = safeStringify(graph);
    if (!nextPayload || nextPayload === payloadRef.current) return undefined;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setStatus("saving");
    timerRef.current = window.setTimeout(async () => {
      try {
        await postGraphSnapshot({ pageId, graph, endpoint });
        payloadRef.current = nextPayload;
        setStatus("saved");
        setLastSavedAt(new Date().toISOString());
        setLastError("");
      } catch (error) {
        setStatus("error");
        setLastError(String(error?.message || "Autosave failed"));
        try {
          window.localStorage.setItem(
            `titonova_graph_autosave_${String(pageId || "page")}`,
            JSON.stringify({
              pageId,
              graph,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore local storage failures.
        }
      }
    }, Math.max(250, Number(delayMs) || DEFAULT_AUTOSAVE_DELAY));

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [delayMs, enabled, endpoint, graph, pageId]);

  return {
    status,
    lastSavedAt,
    lastError,
  };
}
