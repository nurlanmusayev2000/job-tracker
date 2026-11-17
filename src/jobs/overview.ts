import { startOfWeek, type LocalDate } from "@/lib/dates";

import { STAGES, type Job, type Stage } from "./job";

/** How many jobs are in each stage. Every stage is present, with 0 if empty. */
export function countByStage(
  jobs: Pick<Job, "status">[],
): Record<Stage, number> {
  const counts = Object.fromEntries(
    STAGES.map((stage) => [stage, 0]),
  ) as Record<Stage, number>;
  for (const job of jobs) {
    counts[job.status] += 1;
  }
  return counts;
}

export interface Summary {
  /** Vacancies that are not closed. */
  open: number;
  /** Applications sent from Monday of this week until today. */
  appliedThisWeek: number;
}

/** The numbers for the summary line above the list. */
export function summarize(
  jobs: Pick<Job, "status" | "appliedOn">[],
  today: LocalDate,
): Summary {
  const monday = startOfWeek(today);
  return {
    open: jobs.filter((job) => job.status !== "closed").length,
    // Dates in YYYY-MM-DD form sort like text, so they can be compared with >= and <=.
    appliedThisWeek: jobs.filter(
      (job) =>
        job.appliedOn !== "" &&
        job.appliedOn >= monday &&
        job.appliedOn <= today,
    ).length,
  };
}
