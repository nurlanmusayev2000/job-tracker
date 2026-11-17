import type { LocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import type { Job } from "./job";
import {
  CURRENT_VERSION,
  InvalidDataError,
  parseStoredData,
  type StoredData,
} from "./storedData";

/** The name and contents of an export file. */
export interface ExportFile {
  fileName: string;
  text: string;
}

/**
 * All jobs as a JSON file, in the same format the app saves, so the same
 * code can read it back. The date in the name keeps backups apart.
 */
export function createExportFile(jobs: Job[], today: LocalDate): ExportFile {
  const data: StoredData = { version: CURRENT_VERSION, jobs };
  return {
    fileName: `job-search-tracker-${today}.json`,
    text: `${JSON.stringify(data, null, 2)}\n`,
  };
}

/**
 * Reads the text of an imported file. Returns its jobs, or throws an
 * InvalidDataError that says what is wrong with the file.
 */
export function parseImportFile(text: string): Job[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new InvalidDataError(messages.errors.notJson);
  }
  return parseStoredData(data).jobs;
}
