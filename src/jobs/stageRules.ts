import { addDays, type LocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import { hasNextStep, type Job, type JobChanges, type Stage } from "./job";

/** How many days after applying the app suggests following up. */
export const FOLLOW_UP_AFTER_DAYS = 7;

/**
 * The changes to make when a job moves to a new stage.
 *
 * - Applied: if the application date is empty, it becomes today. If no next
 *   step is planned, a follow-up is planned 7 days after the application date.
 * - Closed: the next step is removed, because nothing is left to do.
 *
 * Returns only the fields that change, or an empty object if the stage is
 * the same. The caller saves them with the repository.
 */
export function changesForStage(
  job: Job,
  stage: Stage,
  today: LocalDate,
): JobChanges {
  if (stage === job.status) return {};

  const changes: JobChanges = { status: stage };

  if (stage === "applied") {
    const appliedOn = job.appliedOn === "" ? today : job.appliedOn;
    if (job.appliedOn === "") {
      changes.appliedOn = appliedOn;
    }
    if (!hasNextStep(job)) {
      changes.nextStep = messages.jobs.followUpStep;
      changes.nextOn = addDays(appliedOn, FOLLOW_UP_AFTER_DAYS);
    }
  }

  if (stage === "closed") {
    changes.nextStep = "";
    changes.nextOn = "";
  }

  return changes;
}
