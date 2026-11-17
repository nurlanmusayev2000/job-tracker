import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { Provider } from "react-redux";

import {
  createLocalStorageRepository,
  STORAGE_KEY,
} from "@/jobs/localStorageRepository";
import type { Job } from "@/jobs/job";
import type { JobRepository } from "@/jobs/repository";
import { CURRENT_VERSION } from "@/jobs/storedData";
import type { LocalDate } from "@/lib/dates";
import { makeStore } from "@/store/store";

import { createFakeStorage } from "./factories";

/** The date the tests treat as today: Tuesday 17 November 2026. */
export const TEST_TODAY: LocalDate = "2026-11-17";

interface Options {
  /** Jobs that are already saved when the app starts. */
  jobs?: Job[];
  /** Raw text already in storage, to test broken data. */
  storedText?: string;
  /** Replaces the repository, for example with one that fails. */
  repository?: JobRepository;
}

/**
 * Renders a component with its own store, an in-memory storage and a fixed
 * date, and returns a userEvent instance for typing and clicking.
 */
export function renderApp(ui: ReactElement, options: Options = {}) {
  const storedText =
    options.storedText ??
    (options.jobs
      ? JSON.stringify({ version: CURRENT_VERSION, jobs: options.jobs })
      : undefined);
  const storage = createFakeStorage(
    storedText === undefined ? {} : { [STORAGE_KEY]: storedText },
  );

  let nextId = 1;
  const repository =
    options.repository ??
    createLocalStorageRepository({
      storage,
      now: () => new Date("2026-11-17T09:00:00.000Z"),
      createId: () => `new-${nextId++}`,
    });

  const store = makeStore({ repository, today: () => TEST_TODAY });
  const user = userEvent.setup();
  const result = render(<Provider store={store}>{ui}</Provider>);

  return { ...result, user, store, storage };
}
