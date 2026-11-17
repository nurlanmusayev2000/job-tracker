import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";

import { changesForStage, FOLLOW_UP_AFTER_DAYS } from "./stageRules";

const TODAY = "2026-11-17";

describe("changesForStage", () => {
  it("changes nothing when the stage stays the same", () => {
    const job = makeJob({ status: "applied" });
    expect(changesForStage(job, "applied", TODAY)).toEqual({});
  });

  describe("moving to Applied", () => {
    it("sets the application date to today and plans a follow-up a week later", () => {
      const job = makeJob({ status: "saved" });

      expect(changesForStage(job, "applied", TODAY)).toEqual({
        status: "applied",
        appliedOn: "2026-11-17",
        nextStep: messages.jobs.followUpStep,
        nextOn: "2026-11-24",
      });
      expect(FOLLOW_UP_AFTER_DAYS).toBe(7);
    });

    it("keeps an application date that is already set, and follows up from it", () => {
      const job = makeJob({ status: "saved", appliedOn: "2026-11-10" });

      expect(changesForStage(job, "applied", TODAY)).toEqual({
        status: "applied",
        nextStep: messages.jobs.followUpStep,
        nextOn: "2026-11-17",
      });
    });

    it("keeps a next step that is already planned", () => {
      const job = makeJob({
        status: "saved",
        nextStep: "Ask Anna for a referral",
        nextOn: "2026-11-19",
      });

      expect(changesForStage(job, "applied", TODAY)).toEqual({
        status: "applied",
        appliedOn: "2026-11-17",
      });
    });

    it("counts a next step with only a date as planned", () => {
      const job = makeJob({ status: "saved", nextOn: "2026-11-19" });
      const changes = changesForStage(job, "applied", TODAY);

      expect(changes).not.toHaveProperty("nextStep");
      expect(changes).not.toHaveProperty("nextOn");
    });

    it("ignores a next step that is only spaces", () => {
      const job = makeJob({ status: "saved", nextStep: "   " });
      const changes = changesForStage(job, "applied", TODAY);

      expect(changes.nextStep).toBe(messages.jobs.followUpStep);
      expect(changes.nextOn).toBe("2026-11-24");
    });
  });

  describe("moving to Closed", () => {
    it("removes the next step", () => {
      const job = makeJob({
        status: "interview",
        nextStep: "Send a thank-you email",
        nextOn: "2026-11-18",
      });

      expect(changesForStage(job, "closed", TODAY)).toEqual({
        status: "closed",
        nextStep: "",
        nextOn: "",
      });
    });

    it("keeps the application date", () => {
      const job = makeJob({ status: "applied", appliedOn: "2026-11-01" });
      expect(changesForStage(job, "closed", TODAY)).not.toHaveProperty(
        "appliedOn",
      );
    });
  });

  describe("other stages", () => {
    it("only change the stage", () => {
      const job = makeJob({
        status: "applied",
        appliedOn: "2026-11-01",
        nextStep: "Prepare for the call",
        nextOn: "2026-11-20",
      });

      expect(changesForStage(job, "interview", TODAY)).toEqual({
        status: "interview",
      });
      expect(changesForStage(job, "offer", TODAY)).toEqual({ status: "offer" });
      expect(changesForStage(job, "saved", TODAY)).toEqual({ status: "saved" });
    });
  });
});
