import { z } from "zod";

import { messages } from "@/messages";

import { jobSchema } from "./schema";

/**
 * The version of the saved data format. Saved data always includes it, so a
 * later version of the app can tell how old data is and update it.
 */
export const CURRENT_VERSION = 1;

/** Everything the app saves: the format version and the list of jobs. */
export const storedDataSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  jobs: z.array(jobSchema),
});
export type StoredData = z.infer<typeof storedDataSchema>;

/** Thrown when saved or imported data cannot be read. The message says why. */
export class InvalidDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDataError";
  }
}

/**
 * Steps that update old data. The step at key N turns version N into
 * version N + 1.
 *
 * Version 0 is a plain array of jobs with no version number around it. It
 * is here so the update path is used and tested from the start. When the
 * format changes, add a step for version 1 → 2 and raise CURRENT_VERSION.
 */
const migrations: Record<number, (data: unknown) => unknown> = {
  0: (jobs) => ({ version: 1, jobs }),
};

/** The format version of some data, or null if it is not in a known shape. */
function versionOf(data: unknown): number | null {
  if (Array.isArray(data)) return 0;
  if (typeof data === "object" && data !== null && "version" in data) {
    const { version } = data;
    if (typeof version === "number" && Number.isInteger(version)) {
      return version;
    }
  }
  return null;
}

/** Runs the update steps until the data has the current version. */
function migrate(data: unknown): unknown {
  let version = versionOf(data);
  if (version === null) {
    throw new InvalidDataError(messages.errors.unknownFormat);
  }
  if (version > CURRENT_VERSION) {
    throw new InvalidDataError(messages.errors.newerVersion);
  }

  let current = data;
  while (version < CURRENT_VERSION) {
    current = migrations[version](current);
    version += 1;
  }
  return current;
}

/** A short description of the first problem Zod found, for the user. */
function describeProblem(error: z.ZodError): string {
  const [issue] = error.issues;
  // The path looks like ["jobs", 2, "deadline"]: the third job's deadline.
  const [, index, field] = issue.path;
  if (typeof index === "number" && field !== undefined) {
    return messages.errors.badJob(index + 1, String(field), issue.message);
  }
  return issue.message;
}

/**
 * Turns saved or imported data into the current format and checks it.
 * Throws an InvalidDataError with a readable message if that is not possible.
 */
export function parseStoredData(data: unknown): StoredData {
  const result = storedDataSchema.safeParse(migrate(data));
  if (!result.success) {
    throw new InvalidDataError(describeProblem(result.error));
  }
  return result.data;
}
