import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob, makeJobInput } from "@/test/factories";

import { normalizeJobInput, toJobInput, validateJobInput } from "./jobForm";

describe("validateJobInput", () => {
  it("accepts a job with a title or a company", () => {
    expect(validateJobInput(makeJobInput({ company: "" }))).toEqual({});
    expect(validateJobInput(makeJobInput({ title: "" }))).toEqual({});
  });

  it("asks for a title or a company", () => {
    const errors = validateJobInput(makeJobInput({ title: " ", company: "" }));
    expect(errors).toEqual({ title: messages.validation.titleOrCompany });
  });

  it("only accepts http and https links", () => {
    expect(
      validateJobInput(makeJobInput({ url: "https://example.com" })),
    ).toEqual({});
    expect(validateJobInput(makeJobInput({ url: "  " }))).toEqual({});
    expect(validateJobInput(makeJobInput({ url: "example.com" }))).toEqual({
      url: messages.validation.link,
    });
    expect(
      validateJobInput(makeJobInput({ url: "mailto:hr@example.com" })),
    ).toEqual({
      url: messages.validation.link,
    });
  });

  it("checks every date field", () => {
    const errors = validateJobInput(
      makeJobInput({
        deadline: "2026-02-30",
        appliedOn: "soon",
        nextOn: "2026-11-24",
      }),
    );
    expect(errors).toEqual({
      deadline: messages.validation.date,
      appliedOn: messages.validation.date,
    });
  });
});

describe("normalizeJobInput", () => {
  it("removes spaces around text", () => {
    const input = makeJobInput({
      title: "  Designer ",
      url: " https://example.com ",
      notes: "\nHi\n",
    });
    expect(normalizeJobInput(input)).toMatchObject({
      title: "Designer",
      url: "https://example.com",
      notes: "Hi",
    });
  });
});

describe("toJobInput", () => {
  it("drops the fields the user cannot edit", () => {
    const input = toJobInput(makeJob());
    expect(input).not.toHaveProperty("id");
    expect(input).not.toHaveProperty("createdAt");
    expect(input).not.toHaveProperty("updatedAt");
    expect(input).toEqual(makeJobInput());
  });
});
