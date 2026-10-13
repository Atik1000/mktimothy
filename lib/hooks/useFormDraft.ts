"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useFormDraft<T>(key, initialValue)
 *
 * Persists a piece of form state to localStorage so that if the user
 * navigates away from the page (or refreshes) mid-form, their typed values
 * — and the step they were on — are restored when they return. The draft is
 * cleared by calling `clearDraft()`, typically on successful submit.
 *
 * - SSR-safe: no localStorage access during render; hydration happens in an
 *   effect so server and client render the same (initial) value first.
 * - Debounced writes (250ms) to avoid hammering localStorage on every
 *   keystroke.
 *
 * @param key          Storage key (namespaced under "form-draft:").
 * @param initialValue Fallback when no draft exists.
 */
export function useFormDraft<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const storageKey = `form-draft:${key}`;
  const [state, setState] = useState<T>(initialValue);
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // Merge over the initial value so newly-added fields keep their
        // defaults even if the saved draft predates them.
        setState((prev) =>
          typeof prev === "object" && prev !== null && !Array.isArray(prev)
            ? { ...(prev as object), ...(parsed as object) } as T
            : parsed
        );
      }
    } catch {
      // Corrupt or non-JSON draft — ignore and start fresh.
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Quota / serialization errors are non-fatal for a draft.
      }
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, storageKey]);

  const clearDraft = useCallback(() => {
    hydrated.current = false;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return [state, setState, clearDraft];
}
