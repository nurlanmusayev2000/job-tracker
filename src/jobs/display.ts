import { formatDate } from "@/lib/dates";
import { messages } from "@/messages";

import type { Job } from "./job";

/** The name to show for a job: its title, else its company. */
export function jobName(job: Pick<Job, "title" | "company">): string {
  return job.title || job.company || messages.jobs.untitled;
}

/** The second line under the name: the company (if the title is the name), location and work mode. */
export function jobDetails(
  job: Pick<Job, "title" | "company" | "location" | "mode">,
): string {
  const mode = job.mode ? messages.modes[job.mode] : "";
  // Skip the work mode if the location already says it, as in "Remote".
  const modeIsLocation = mode.toLowerCase() === job.location.toLowerCase();
  const parts = [
    job.title ? job.company : "",
    job.location,
    modeIsLocation ? "" : mode,
  ];
  return parts.filter((part) => part !== "").join(" · ");
}

/** The planned next step with its date, or "" if there is none. */
export function nextStepText(job: Pick<Job, "nextStep" | "nextOn">): string {
  const date = job.nextOn
    ? messages.list.nextOn(formatDate(job.nextOn, messages.locale))
    : "";
  return [job.nextStep, date].filter((part) => part !== "").join(" ");
}

/** Short facts about the dates of a job, for example "Apply by 2 Dec 2026". */
export function dateFacts(
  job: Pick<Job, "status" | "deadline" | "appliedOn">,
): string[] {
  const facts: string[] = [];
  if (job.status === "saved" && job.deadline) {
    facts.push(
      messages.list.deadline(formatDate(job.deadline, messages.locale)),
    );
  }
  if (job.appliedOn) {
    facts.push(
      messages.list.appliedOn(formatDate(job.appliedOn, messages.locale)),
    );
  }
  return facts;
}
