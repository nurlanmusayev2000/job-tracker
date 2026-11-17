import { describe, expect, it } from "vitest";

import { makeJob } from "@/test/factories";

import { countByStage, summarize } from "./overview";

describe("countByStage", () => {
  it("counts the jobs in each stage, with 0 for empty stages", () => {
    const jobs = [
      makeJob({ status: "saved" }),
      makeJob({ status: "applied" }),
      makeJob({ status: "applied" }),
      makeJob({ status: "closed" }),
    ];
    expect(countByStage(jobs)).toEqual({
      saved: 1,
      applied: 2,
      interview: 0,
      offer: 0,
      closed: 1,
    });
  });
});

describe("summarize", () => {
  // Tuesday 17 November 2026; that week starts on Monday 16 November.
  const TODAY = "2026-11-17";

  it("counts every vacancy that is not closed as open", () => {
    const jobs = [
      makeJob({ status: "saved" }),
      makeJob({ status: "offer" }),
      makeJob({ status: "closed" }),
    ];
    expect(summarize(jobs, TODAY).open).toBe(2);
  });

  it("counts applications sent from Monday until today", () => {
    const jobs = [
      makeJob({ status: "applied", appliedOn: "2026-11-15" }), // Sunday, last week
      makeJob({ status: "applied", appliedOn: "2026-11-16" }), // Monday
      makeJob({ status: "interview", appliedOn: "2026-11-17" }), // today, now in Interview
      makeJob({ status: "closed", appliedOn: "2026-11-16" }), // sent this week, then closed
      makeJob({ status: "saved", appliedOn: "" }),
    ];
    expect(summarize(jobs, TODAY).appliedThisWeek).toBe(3);
  });
});
