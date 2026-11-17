"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  applyTheme,
  onSystemThemeChange,
  parseThemeChoice,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "./theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readChoice(): ThemeChoice {
  try {
    return parseThemeChoice(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // Storage can be blocked, for example in some private windows.
    return "system";
  }
}

/**
 * The saved theme choice and a function to change it. While the page is
 * built and hydrated the choice reads as "system"; the script in layout.tsx
 * has already drawn the right colors by then.
 */
export function useTheme() {
  const choice = useSyncExternalStore(
    subscribe,
    readChoice,
    () => "system" as const,
  );

  // While following the system, switch when the device switches.
  useEffect(() => {
    if (choice !== "system") return;
    return onSystemThemeChange(() => applyTheme("system"));
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Without storage the choice still applies until the page is reloaded.
    }
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return [choice, setChoice] as const;
}
