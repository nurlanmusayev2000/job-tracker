import { z } from "zod";

import { isValidLocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import { STAGES, WORK_MODES, type Job } from "./job";

/** True if `value` is a link that starts with http:// or https://. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const dateOrEmpty = z
  .string()
  .refine((value) => value === "" || isValidLocalDate(value), {
    message: messages.validation.date,
  });

const linkOrEmpty = z
  .string()
  .refine((value) => value === "" || isHttpUrl(value), {
    message: messages.validation.link,
  });

/**
 * The rules a stored job must follow. It is used to check data read from
 * localStorage and data from an imported file before the app uses it.
 *
 * `satisfies` makes TypeScript check that this schema and the Job interface
 * describe the same shape, so the two cannot drift apart.
 */
export const jobSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    company: z.string(),
    url: linkOrEmpty,
    location: z.string(),
    mode: z.enum(WORK_MODES),
    salary: z.string(),
    source: z.string(),
    notes: z.string(),
    status: z.enum(STAGES),
    deadline: dateOrEmpty,
    appliedOn: dateOrEmpty,
    nextStep: z.string(),
    nextOn: dateOrEmpty,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .refine((job) => job.title.trim() !== "" || job.company.trim() !== "", {
    message: messages.validation.titleOrCompany,
    path: ["title"],
  }) satisfies z.ZodType<Job>;
