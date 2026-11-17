import { addDays, daysBetween, type LocalDate } from "@/lib/dates";
import { messages } from "@/messages";

import { hasNextStep, type Job, type JobChanges } from "./job";
import { changesForStage, FOLLOW_UP_AFTER_DAYS } from "./stageRules";

/** A date within this many days from today counts as "soon". */
export const SOON_DAYS = 3;

/** A reply is "late" this many days after applying. */
export const NO_REPLY_DAYS = 7;

/**
 * Why a job is in "Next up". Each reason comes with one quick action:
 * - stepDue: a next step is due within 3 days or overdue → Done
 * - deadlineSoon: the deadline is within 3 days → Mark applied
 * - deadlinePassed: the deadline has passed → Close it
 * - noReply: applied 7+ days ago with no next step → Remind me in a week
 */
export type NextUpReason =
  "stepDue" | "deadlineSoon" | "deadlinePassed" | "noReply";

export type QuickAction = "markApplied" | "done" | "remindInAWeek" | "close";

export const ACTION_FOR_REASON: Record<NextUpReason, QuickAction> = {
  stepDue: "done",
  deadlineSoon: "markApplied",
  deadlinePassed: "close",
  noReply: "remindInAWeek",
};

export interface NextUpItem {
  job: Job;
  reason: NextUpReason;
  /** The date that put the job here: the step date, the deadline or the application date. */
  date: LocalDate;
  /** daysBetween(today, date): negative when the date has passed. */
  days: number;
}

/** The one reason a job needs attention, or null. A due next step comes first. */
function reasonFor(job: Job, today: LocalDate): NextUpItem | null {
  if (job.status === "closed") {
    return null;
  }

  if (job.nextOn !== "") {
    const days = daysBetween(today, job.nextOn);
    if (days <= SOON_DAYS) {
      return { job, reason: "stepDue", date: job.nextOn, days };
    }
  }

  if (job.status === "saved" && job.deadline !== "") {
    const days = daysBetween(today, job.deadline);
    if (days < 0) {
      return { job, reason: "deadlinePassed", date: job.deadline, days };
    }
    if (days <= SOON_DAYS) {
      return { job, reason: "deadlineSoon", date: job.deadline, days };
    }
  }

  if (job.status === "applied" && job.appliedOn !== "" && !hasNextStep(job)) {
    const days = daysBetween(today, job.appliedOn);
    if (days <= -NO_REPLY_DAYS) {
      return { job, reason: "noReply", date: job.appliedOn, days };
    }
  }

  return null;
}

/** The jobs that need attention soon, the most urgent (earliest date) first. */
export function nextUpItems(jobs: Job[], today: LocalDate): NextUpItem[] {
  return jobs
    .map((job) => reasonFor(job, today))
    .filter((item): item is NextUpItem => item !== null)
    .sort(
      (a, b) =>
        a.days - b.days || a.job.createdAt.localeCompare(b.job.createdAt),
    );
}

/** The changes a quick action makes to a job. */
export function changesForQuickAction(
  job: Job,
  action: QuickAction,
  today: LocalDate,
): JobChanges {
  switch (action) {
    case "markApplied":
      return changesForStage(job, "applied", today);
    case "close":
      return changesForStage(job, "closed", today);
    case "done":
      return { nextStep: "", nextOn: "" };
    case "remindInAWeek":
      return {
        nextStep: job.nextStep.trim() || messages.jobs.followUpStep,
        nextOn: addDays(today, FOLLOW_UP_AFTER_DAYS),
      };
  }
}
