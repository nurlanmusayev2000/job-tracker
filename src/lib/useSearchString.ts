"use client";

import { useSyncExternalStore } from "react";

/**
 * Keeps React in sync with the query string of the address bar (the part
 * after "?").
 *
 * The page is a static file, so the query string is only known in the
 * browser. useSyncExternalStore renders with "" while the page is built and
 * hydrated, then with the real value, without a hydration mismatch.
 */

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // The browser's back and forward buttons also change the query string.
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

/** The current query string, for example "?q=react&sort=company". */
export function useSearchString(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Changes the query string without reloading the page or adding a history
 * entry, then tells every component that uses useSearchString. Next.js
 * supports calling the History API like this.
 */
export function replaceSearchString(searchString: string): void {
  const url =
    searchString === "" ? window.location.pathname : `?${searchString}`;
  window.history.replaceState(null, "", url);
  listeners.forEach((listener) => listener());
}
