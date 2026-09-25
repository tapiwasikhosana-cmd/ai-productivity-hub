import { useEffect, useState } from "react";

/** Persists a form/draft object in localStorage (no backend required). */
export function useLocalDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue({ ...initial, ...(JSON.parse(raw) as T) });
    } catch {
      /* ignore invalid storage */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;
}
