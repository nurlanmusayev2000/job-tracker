import { isValidLocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import type { Job, JobInput } from "./job";
import { isHttpUrl } from "./schema";

/** An error message for each field that has a problem. */
export type JobFormErrors = Partial<Record<keyof JobInput, string>>;

const DATE_FIELDS = ["deadline", "appliedOn", "nextOn"] as const;

/** The fields of a saved job that the dialog edits. */
export function toJobInput(job: Job): JobInput {
  // Take out the three fields the user cannot edit and keep the rest.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...input } = job;
  return input;
}

/** Removes spaces at the start and end of every text field. */
export function normalizeJobInput(values: JobInput): JobInput {
  return {
    ...values,
    title: values.title.trim(),
    company: values.company.trim(),
    url: values.url.trim(),
    location: values.location.trim(),
    salary: values.salary.trim(),
    source: values.source.trim(),
    notes: values.notes.trim(),
    nextStep: values.nextStep.trim(),
  };
}

/**
 * Checks the dialog's values. Returns an empty object when they can be
 * saved. The same rules are checked again by the schema before saving.
 */
export function validateJobInput(values: JobInput): JobFormErrors {
  const errors: JobFormErrors = {};

  if (values.title.trim() === "" && values.company.trim() === "") {
    errors.title = messages.validation.titleOrCompany;
  }

  const url = values.url.trim();
  if (url !== "" && !isHttpUrl(url)) {
    errors.url = messages.validation.link;
  }

  for (const field of DATE_FIELDS) {
    if (values[field] !== "" && !isValidLocalDate(values[field])) {
      errors[field] = messages.validation.date;
    }
  }

  return errors;
}
