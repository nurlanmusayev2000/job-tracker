import { messages } from "@/messages";

import type { Job } from "./job";
import { JobNotFoundError, type JobRepository } from "./repository";
import { jobSchema } from "./schema";
import {
  CURRENT_VERSION,
  InvalidDataError,
  parseStoredData,
  storedDataSchema,
  type StoredData,
} from "./storedData";

/** The localStorage key the jobs are saved under. */
export const STORAGE_KEY = "job-search-tracker";

/**
 * The two methods of `window.localStorage` this file uses. Tests pass a
 * small in-memory object with the same methods instead.
 */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

interface Options {
  storage: KeyValueStorage;
  /** Returns the current time. Tests pass a fixed time. */
  now?: () => Date;
  /** Returns a new unique id. Tests pass a predictable one. */
  createId?: () => string;
}

/** Checks a job against the schema and returns the checked copy. */
function checkJob(job: Job): Job {
  const result = jobSchema.safeParse(job);
  if (!result.success) {
    throw new InvalidDataError(result.error.issues[0].message);
  }
  return result.data;
}

/** A JobRepository that saves everything under one localStorage key. */
export function createLocalStorageRepository({
  storage,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: Options): JobRepository {
  /** Reads, updates (if old) and checks the saved data. */
  function read(): Job[] {
    const text = storage.getItem(STORAGE_KEY);
    if (text === null) return [];

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new InvalidDataError(messages.errors.notJson);
    }
    return parseStoredData(data).jobs;
  }

  /** Saves the jobs together with the current format version. */
  function write(jobs: Job[]): void {
    const data: StoredData = { version: CURRENT_VERSION, jobs };
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return {
    async list() {
      return read();
    },

    async create(input) {
      const timestamp = now().toISOString();
      const job = checkJob({
        ...input,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      write([...read(), job]);
      return job;
    },

    async update(id, changes) {
      const jobs = read();
      const index = jobs.findIndex((job) => job.id === id);
      if (index === -1) throw new JobNotFoundError(id);

      const updated = checkJob({
        ...jobs[index],
        ...changes,
        // These three can never be changed by an update.
        id,
        createdAt: jobs[index].createdAt,
        updatedAt: now().toISOString(),
      });
      write(jobs.map((job, i) => (i === index ? updated : job)));
      return updated;
    },

    async remove(id) {
      const jobs = read();
      write(jobs.filter((job) => job.id !== id));
    },

    async replaceAll(jobs) {
      const result = storedDataSchema.safeParse({
        version: CURRENT_VERSION,
        jobs,
      });
      if (!result.success) {
        throw new InvalidDataError(result.error.issues[0].message);
      }
      write(result.data.jobs);
    },
  };
}
