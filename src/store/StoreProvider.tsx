"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { createLocalStorageRepository } from "@/jobs/localStorageRepository";
import { today } from "@/lib/dates";

import { makeStore } from "./store";

/**
 * Reaches localStorage only when a method is called, never while the page
 * is built or first rendered. At build time there is no `window`, and
 * reading saved data before the page has mounted would make the first
 * render differ from the server HTML (a hydration mismatch).
 */
const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) =>
    window.localStorage.setItem(key, value),
};

/** Gives every component below it access to the one Redux store. */
export function StoreProvider({ children }: { children: ReactNode }) {
  // useState with a function creates the store once, on the first render.
  const [store] = useState(() =>
    makeStore({
      repository: createLocalStorageRepository({ storage: browserStorage }),
      today: () => today(),
    }),
  );

  return <Provider store={store}>{children}</Provider>;
}
