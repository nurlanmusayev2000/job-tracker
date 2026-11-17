import { addDays, type LocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import {
  hasNextStep,
  type Job,
  type JobChanges,
  type JobInput,
  type Stage,
} from "./job";

/** The fields the stage rules read. */
type StageFields = Pick<Job, "status" | "appliedOn" | "nextStep" | "nextOn">;

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
  job: StageFields,
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

/**
 * Applies the stage rules to a job filled in with the dialog.
 *
 * `previousStage` is the stage the job had before (for a new job: "saved").
 * The rules look at the values from the dialog, so anything the user typed
 * in (for example an application date) is kept.
 */
export function withStageRules(
  values: JobInput,
  previousStage: Stage,
  today: LocalDate,
): JobInput {
  const changes = changesForStage(
    { ...values, status: previousStage },
    values.status,
    today,
  );
  return { ...values, ...changes };
}
