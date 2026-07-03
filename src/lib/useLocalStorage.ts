"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A typed `useState` backed by `localStorage`.
 * SSR-safe: reads from storage only after mount to avoid hydration mismatches.
 *
 * @example
 * const [network, setNetwork] = useLocalStorage<"testnet" | "mainnet">("qf_network", "testnet");
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate from storage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage may be unavailable (private browsing, permissions, etc.)
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Silently ignore write failures (quota exceeded, etc.)
        }
        return next;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
