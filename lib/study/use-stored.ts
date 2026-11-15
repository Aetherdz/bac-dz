"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emitStudyChange, readStored, writeStored, type StorageKey } from "./store";

/**
 * localStorage-backed state that stays hydration-safe: the first render always
 * uses `initial`, then the stored value is adopted after mount.
 */
export function useStoredState<T>(
  key: StorageKey,
  initial: T,
  guard: (value: unknown) => value is T,
): [T, (next: T | ((previous: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initial);
  const guardRef = useRef(guard);
  guardRef.current = guard;

  useEffect(() => {
    setValue(readStored(key, initialRef.current, guardRef.current));
    setReady(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
        writeStored(key, resolved);
        emitStudyChange(key);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, ready];
}

/** Subscribe to study-store changes (same tab and other tabs). */
export function useStudySignal(): number {
  const [signal, setSignal] = useState(0);

  useEffect(() => {
    const bump = () => setSignal((value) => value + 1);
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("bacdz.study.")) bump();
    };
    window.addEventListener("bacdz:study:change", bump);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bacdz:study:change", bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return signal;
}

/**
 * Current epoch ms, refreshed on an interval while `active`. Reading
 * `Date.now()` on each tick (rather than decrementing) is what keeps the timer
 * exact after a suspended tab.
 */
export function useNow(active: boolean, interval = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const update = () => setNow(Date.now());
    update();
    const id = window.setInterval(update, interval);
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, interval]);

  return now;
}
