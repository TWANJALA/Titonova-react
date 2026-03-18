export const DEFAULT_HISTORY_LIMIT = 100;

export const cloneSnapshot = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export const createHistoryState = (initialSnapshot) => ({
  past: [],
  present: cloneSnapshot(initialSnapshot),
  future: [],
});

export const commitHistory = (historyState, nextSnapshot, limit = DEFAULT_HISTORY_LIMIT) => {
  const next = cloneSnapshot(nextSnapshot);
  return {
    past: [...historyState.past, cloneSnapshot(historyState.present)].slice(-(Math.max(1, Number(limit) || DEFAULT_HISTORY_LIMIT))),
    present: next,
    future: [],
  };
};

export const undoHistory = (historyState) => {
  if (!Array.isArray(historyState.past) || historyState.past.length === 0) return historyState;
  const previous = historyState.past[historyState.past.length - 1];
  return {
    past: historyState.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(historyState.present), ...(historyState.future || [])],
  };
};

export const redoHistory = (historyState) => {
  if (!Array.isArray(historyState.future) || historyState.future.length === 0) return historyState;
  const [next, ...restFuture] = historyState.future;
  return {
    past: [...(historyState.past || []), cloneSnapshot(historyState.present)],
    present: cloneSnapshot(next),
    future: restFuture,
  };
};
