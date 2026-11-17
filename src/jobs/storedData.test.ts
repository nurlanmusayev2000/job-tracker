import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";

import { isHttpUrl } from "./schema";
import {
  CURRENT_VERSION,
  InvalidDataError,
  parseStoredData,
} from "./storedData";

describe("isHttpUrl", () => {
  it("accepts http and https links", () => {
    expect(isHttpUrl("https://example.com/jobs/42")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects other links and plain text", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});

describe("parseStoredData", () => {
  it("accepts data in the current format", () => {
    const data = { version: CURRENT_VERSION, jobs: [makeJob()] };
    expect(parseStoredData(data)).toEqual(data);
  });

  it("updates version 0 (a plain array of jobs) to the current format", () => {
    const job = makeJob();
    expect(parseStoredData([job])).toEqual({
      version: CURRENT_VERSION,
      jobs: [job],
    });
  });

  it("removes fields the app does not know", () => {
    const data = {
      version: CURRENT_VERSION,
      jobs: [{ ...makeJob(), color: "red" }],
    };
    expect(parseStoredData(data).jobs[0]).not.toHaveProperty("color");
  });

  it("rejects data from a newer version of the app", () => {
    const data = { version: CURRENT_VERSION + 1, jobs: [] };
    expect(() => parseStoredData(data)).toThrow(messages.errors.newerVersion);
  });

  it("rejects data in an unknown shape", () => {
    for (const data of [null, "jobs", 42, { jobs: [] }, { version: "1" }]) {
      expect(() => parseStoredData(data)).toThrow(
        messages.errors.unknownFormat,
      );
    }
  });

  it("says which vacancy and field is wrong", () => {
    const data = {
      version: CURRENT_VERSION,
      jobs: [makeJob(), makeJob({ id: "job-2", deadline: "next Friday" })],
    };

    expect(() => parseStoredData(data)).toThrow(InvalidDataError);
    expect(() => parseStoredData(data)).toThrow(
      messages.errors.badJob(2, "deadline", messages.validation.date),
    );
  });

  it("rejects a job with neither a title nor a company", () => {
    const data = {
      version: CURRENT_VERSION,
      jobs: [makeJob({ title: " ", company: "" })],
    };
    expect(() => parseStoredData(data)).toThrow(
      messages.validation.titleOrCompany,
    );
  });

  it("rejects a link that is not http or https", () => {
    const data = {
      version: CURRENT_VERSION,
      jobs: [makeJob({ url: "javascript:alert(1)" })],
    };
    expect(() => parseStoredData(data)).toThrow(messages.validation.link);
  });

  it("rejects an unknown stage", () => {
    const data = {
      version: CURRENT_VERSION,
      jobs: [{ ...makeJob(), status: "ghosted" }],
    };
    expect(() => parseStoredData(data)).toThrow(InvalidDataError);
  });
});
