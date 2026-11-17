import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";

import type { Job } from "./job";
import {
  ACTION_FOR_REASON,
  changesForQuickAction,
  nextUpItems,
  type NextUpReason,
} from "./nextUp";

// Tuesday 17 November 2026.
const TODAY = "2026-11-17";

/** The reason a single job is in "Next up", or null if it is not there. */
function reasonOf(job: Partial<Job>): NextUpReason | null {
  const [item] = nextUpItems([makeJob(job)], TODAY);
  return item?.reason ?? null;
}

describe("nextUpItems", () => {
  describe("saved vacancies with a deadline", () => {
    it("include a deadline within 3 days, today included", () => {
      expect(reasonOf({ status: "saved", deadline: "2026-11-17" })).toBe(
        "deadlineSoon",
      );
      expect(reasonOf({ status: "saved", deadline: "2026-11-20" })).toBe(
        "deadlineSoon",
      );
    });

    it("include a deadline that has passed", () => {
      expect(reasonOf({ status: "saved", deadline: "2026-11-16" })).toBe(
        "deadlinePassed",
      );
    });

    it("leave out a deadline more than 3 days away", () => {
      expect(reasonOf({ status: "saved", deadline: "2026-11-21" })).toBeNull();
    });

    it("leave out the deadline once the vacancy is past Saved", () => {
      expect(
        reasonOf({
          status: "applied",
          appliedOn: "2026-11-16",
          deadline: "2026-11-18",
        }),
      ).toBeNull();
    });
  });

  describe("next steps", () => {
    it("include a step due within 3 days or overdue", () => {
      expect(reasonOf({ status: "applied", nextOn: "2026-11-20" })).toBe(
        "stepDue",
      );
      expect(reasonOf({ status: "interview", nextOn: "2026-11-17" })).toBe(
        "stepDue",
      );
      expect(reasonOf({ status: "offer", nextOn: "2026-11-01" })).toBe(
        "stepDue",
      );
    });

    it("leave out a step more than 3 days away", () => {
      expect(reasonOf({ status: "applied", nextOn: "2026-11-21" })).toBeNull();
    });

    it("come before a deadline on the same vacancy", () => {
      expect(
        reasonOf({
          status: "saved",
          deadline: "2026-11-18",
          nextOn: "2026-11-19",
        }),
      ).toBe("stepDue");
    });
  });

  describe("applications with no reply", () => {
    it("include an application sent 7 or more days ago with no next step", () => {
      expect(reasonOf({ status: "applied", appliedOn: "2026-11-10" })).toBe(
        "noReply",
      );
      expect(reasonOf({ status: "applied", appliedOn: "2026-10-01" })).toBe(
        "noReply",
      );
    });

    it("leave out an application sent less than 7 days ago", () => {
      expect(
        reasonOf({ status: "applied", appliedOn: "2026-11-11" }),
      ).toBeNull();
    });

    it("leave out an application that has a next step planned", () => {
      expect(
        reasonOf({
          status: "applied",
          appliedOn: "2026-11-01",
          nextStep: "Wait for Anna",
        }),
      ).toBeNull();
    });

    it("leave out vacancies in a later stage", () => {
      expect(
        reasonOf({ status: "interview", appliedOn: "2026-11-01" }),
      ).toBeNull();
    });
  });

  it("never includes closed vacancies", () => {
    expect(reasonOf({ status: "closed", nextOn: "2026-11-17" })).toBeNull();
  });

  it("puts the earliest date first", () => {
    const jobs = [
      makeJob({ id: "soon", status: "applied", nextOn: "2026-11-19" }),
      makeJob({ id: "overdue", status: "applied", nextOn: "2026-11-15" }),
      makeJob({ id: "today", status: "saved", deadline: "2026-11-17" }),
      makeJob({ id: "later", status: "applied", nextOn: "2026-12-01" }),
    ];

    const items = nextUpItems(jobs, TODAY);

    expect(items.map((item) => item.job.id)).toEqual([
      "overdue",
      "today",
      "soon",
    ]);
    expect(items.map((item) => item.days)).toEqual([-2, 0, 2]);
  });
});

describe("ACTION_FOR_REASON", () => {
  it("gives every reason its quick action", () => {
    expect(ACTION_FOR_REASON).toEqual({
      stepDue: "done",
      deadlineSoon: "markApplied",
      deadlinePassed: "close",
      noReply: "remindInAWeek",
    });
  });
});

describe("changesForQuickAction", () => {
  it("Mark applied follows the stage rules", () => {
    const job = makeJob({ status: "saved", deadline: "2026-11-18" });
    expect(changesForQuickAction(job, "markApplied", TODAY)).toEqual({
      status: "applied",
      appliedOn: TODAY,
      nextStep: messages.jobs.followUpStep,
      nextOn: "2026-11-24",
    });
  });

  it("Close it closes the vacancy and clears the next step", () => {
    const job = makeJob({ status: "saved", deadline: "2026-11-10" });
    expect(changesForQuickAction(job, "close", TODAY)).toEqual({
      status: "closed",
      nextStep: "",
      nextOn: "",
    });
  });

  it("Done clears the next step", () => {
    const job = makeJob({
      status: "applied",
      nextStep: "Call back",
      nextOn: "2026-11-17",
    });
    expect(changesForQuickAction(job, "done", TODAY)).toEqual({
      nextStep: "",
      nextOn: "",
    });
  });

  it("Remind me in a week plans a follow-up 7 days from today", () => {
    const job = makeJob({ status: "applied", appliedOn: "2026-11-01" });
    expect(changesForQuickAction(job, "remindInAWeek", TODAY)).toEqual({
      nextStep: messages.jobs.followUpStep,
      nextOn: "2026-11-24",
    });
  });
});
