import { describe, expect, it } from "vitest";

import { makeJob } from "@/test/factories";

import { emptyJobInput } from "./job";
import {
  bookmarkletCode,
  describeJob,
  findDuplicate,
  parseAddRequest,
} from "./quickAdd";

describe("parseAddRequest", () => {
  it("returns nothing when the bookmarklet was not used", () => {
    expect(parseAddRequest("")).toBeNull();
    expect(parseAddRequest("?q=react")).toBeNull();
  });

  it("reads the link and the page title", () => {
    const search = `?add=${encodeURIComponent("https://jobs.example.com/42?ref=a&b=c")}&title=${encodeURIComponent("Frontend Developer – Acme")}`;
    expect(parseAddRequest(search)).toEqual({
      ...emptyJobInput(),
      url: "https://jobs.example.com/42?ref=a&b=c",
      title: "Frontend Developer – Acme",
    });
  });

  it("leaves out a link that is not http(s)", () => {
    const request = parseAddRequest("?add=javascript%3Aalert(1)&title=Job");
    expect(request?.url).toBe("");
    expect(request?.title).toBe("Job");
  });

  it("shortens a very long title", () => {
    const request = parseAddRequest(`?add=&title=${"a".repeat(500)}`);
    expect(request?.title).toHaveLength(200);
  });
});

describe("bookmarkletCode", () => {
  const code = bookmarkletCode("https://example.github.io/job-tracker/");

  it("is a javascript: link that opens this app", () => {
    expect(code.startsWith("javascript:")).toBe(true);
    expect(code).toContain('"https://example.github.io/job-tracker/?add="');
  });

  it("sends the page's link and title, encoded for a URL", () => {
    // Run the code the way a browser would, on a pretend job page.
    let opened = "";
    const fakeWindow = { open: (url: string) => (opened = url) };
    const run = new Function(
      "window",
      "location",
      "document",
      code.slice("javascript:".length),
    );
    run(
      fakeWindow,
      { href: "https://jobs.example.com/42?x=1&y=2" },
      { title: "Designer & Co" },
    );

    expect(parseAddRequest(new URL(opened).search)).toMatchObject({
      url: "https://jobs.example.com/42?x=1&y=2",
      title: "Designer & Co",
    });
  });
});

describe("findDuplicate", () => {
  const saved = [
    makeJob({
      id: "a",
      title: "Frontend Developer",
      company: "Acme",
      url: "https://jobs.example.com/42/",
    }),
    makeJob({ id: "b", title: "Designer", company: "", url: "" }),
  ];

  it("finds the same link, ignoring a trailing slash, #part and case", () => {
    const values = {
      title: "",
      company: "",
      url: "HTTPS://jobs.example.com/42#apply",
    };
    expect(findDuplicate(values, saved)?.id).toBe("a");
  });

  it("finds the same title and company, ignoring case and spaces", () => {
    const values = { title: " frontend developer ", company: "ACME", url: "" };
    expect(findDuplicate(values, saved)?.id).toBe("a");
  });

  it("needs both a title and a company to match by name", () => {
    expect(
      findDuplicate({ title: "Designer", company: "", url: "" }, saved),
    ).toBeNull();
    expect(
      findDuplicate(
        { title: "Frontend Developer", company: "Globex", url: "" },
        saved,
      ),
    ).toBeNull();
  });

  it("does not match the job being edited", () => {
    const values = { title: "Frontend Developer", company: "Acme", url: "" };
    expect(findDuplicate(values, saved, "a")).toBeNull();
  });
});

describe("describeJob", () => {
  it("names the title and company", () => {
    expect(describeJob({ title: "Designer", company: "Acme" })).toBe(
      "Designer at Acme",
    );
    expect(describeJob({ title: "", company: "Acme" })).toBe("Acme");
  });
});
