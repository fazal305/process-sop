import { useEffect, useState } from 'react';

// Per-viewer-only convenience storage — never sent anywhere by this hook itself.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private browsing, quota) — the app still works,
      // it just won't remember this value on the next visit.
    }
  }, [key, value]);

  return [value, setValue];
}
