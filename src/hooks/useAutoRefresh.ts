import { useEffect, useRef } from 'react';

/** Fired after something changes data that an open dashboard shows (a booking sent from a modal, say). */
export const DATA_CHANGED_EVENT = 'iskilllink:data-changed';

export function announceDataChanged() {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

/**
 * Keeps a view in step with the server: calls `refresh` every `intervalMs` while the page is
 * visible, when the window regains focus, and whenever another part of the app announces a change.
 */
export function useAutoRefresh(refresh: () => void, intervalMs = 30000, enabled = true) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;
    const run = () => {
      if (document.visibilityState === 'visible') refreshRef.current();
    };
    const timer = setInterval(run, intervalMs);
    window.addEventListener('focus', run);
    window.addEventListener(DATA_CHANGED_EVENT, run);
    document.addEventListener('visibilitychange', run);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', run);
      window.removeEventListener(DATA_CHANGED_EVENT, run);
      document.removeEventListener('visibilitychange', run);
    };
  }, [intervalMs, enabled]);
}
