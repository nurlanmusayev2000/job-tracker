import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";

import {
  dateFacts,
  jobDetails,
  jobName,
  nextStepText,
  nextUpText,
} from "./display";
import type { NextUpItem } from "./nextUp";

describe("jobName", () => {
  it("uses the title, then the company", () => {
    expect(jobName({ title: "Designer", company: "Acme" })).toBe("Designer");
    expect(jobName({ title: "", company: "Acme" })).toBe("Acme");
    expect(jobName({ title: "", company: "" })).toBe(messages.jobs.untitled);
  });
});

describe("jobDetails", () => {
  it("joins the company, location and work mode", () => {
    const job = makeJob({
      company: "Acme",
      location: "Berlin",
      mode: "hybrid",
    });
    expect(jobDetails(job)).toBe("Acme · Berlin · Hybrid");
  });

  it("leaves out the company when it is already the name", () => {
    const job = makeJob({ title: "", company: "Acme", location: "Berlin" });
    expect(jobDetails(job)).toBe("Berlin");
  });

  it("does not repeat a work mode that is also the location", () => {
    const job = makeJob({
      company: "Acme",
      location: "Remote",
      mode: "remote",
    });
    expect(jobDetails(job)).toBe("Acme · Remote");
  });

  it("is empty when nothing is filled in", () => {
    expect(jobDetails(makeJob({ title: "", company: "Acme" }))).toBe("");
  });
});

describe("nextStepText", () => {
  it("shows the step with its date", () => {
    const job = makeJob({ nextStep: "Call back", nextOn: "2026-11-24" });
    expect(nextStepText(job)).toBe("Call back on 24 Nov 2026");
  });

  it("works with only a step or only a date", () => {
    expect(nextStepText(makeJob({ nextStep: "Call back" }))).toBe("Call back");
    expect(nextStepText(makeJob({ nextOn: "2026-11-24" }))).toBe(
      "on 24 Nov 2026",
    );
    expect(nextStepText(makeJob())).toBe("");
  });
});

describe("dateFacts", () => {
  it("shows the deadline only while the vacancy is saved", () => {
    expect(
      dateFacts(makeJob({ status: "saved", deadline: "2026-12-02" })),
    ).toEqual(["Apply by 2 Dec 2026"]);
    expect(
      dateFacts(makeJob({ status: "applied", deadline: "2026-12-02" })),
    ).toEqual([]);
  });

  it("shows the application date", () => {
    expect(
      dateFacts(makeJob({ status: "interview", appliedOn: "2026-11-10" })),
    ).toEqual(["Applied 10 Nov 2026"]);
  });
});

describe("nextUpText", () => {
  const item = (
    reason: NextUpItem["reason"],
    days: number,
    nextStep = "",
  ): NextUpItem => ({
    job: makeJob({ nextStep }),
    reason,
    date: "2026-11-17",
    days,
  });

  it("describes a due or overdue next step", () => {
    expect(nextUpText(item("stepDue", 0, "Call back"))).toBe(
      "Call back: due today",
    );
    expect(nextUpText(item("stepDue", 1, "Call back"))).toBe(
      "Call back: due tomorrow",
    );
    expect(nextUpText(item("stepDue", 3, "Call back"))).toBe(
      "Call back: due in 3 days",
    );
    expect(nextUpText(item("stepDue", -1, "Call back"))).toBe(
      "Call back: overdue by 1 day",
    );
    expect(nextUpText(item("stepDue", -4))).toBe(
      "Next step: overdue by 4 days",
    );
  });

  it("describes a deadline", () => {
    expect(nextUpText(item("deadlineSoon", 0))).toBe(
      "Last day to apply is today",
    );
    expect(nextUpText(item("deadlineSoon", 2))).toBe(
      "Last day to apply in 2 days",
    );
    expect(nextUpText(item("deadlinePassed", -1))).toBe(
      "The deadline passed yesterday",
    );
    expect(nextUpText(item("deadlinePassed", -5))).toBe(
      "The deadline passed 5 days ago",
    );
  });

  it("describes an application with no reply", () => {
    expect(nextUpText(item("noReply", -9))).toBe("No reply for 9 days");
  });
});
