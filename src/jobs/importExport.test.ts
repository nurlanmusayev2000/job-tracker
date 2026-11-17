import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";

import { createExportFile, parseImportFile } from "./importExport";
import { CURRENT_VERSION, InvalidDataError } from "./storedData";

describe("createExportFile", () => {
  it("names the file with the date and writes the saved format", () => {
    const jobs = [makeJob({ id: "a" }), makeJob({ id: "b" })];
    const file = createExportFile(jobs, "2026-11-17");

    expect(file.fileName).toBe("job-search-tracker-2026-11-17.json");
    expect(JSON.parse(file.text)).toEqual({ version: CURRENT_VERSION, jobs });
  });

  it("can be imported again without changes", () => {
    const jobs = [makeJob({ id: "a", notes: 'Línea 1\nLine 2 — "quoted"' })];
    expect(parseImportFile(createExportFile(jobs, "2026-11-17").text)).toEqual(
      jobs,
    );
  });
});

describe("parseImportFile", () => {
  it("reads an older format too", () => {
    const job = makeJob();
    expect(parseImportFile(JSON.stringify([job]))).toEqual([job]);
  });

  it("explains each kind of bad file", () => {
    const cases: [string, string][] = [
      ["this is not json", messages.errors.notJson],
      ["", messages.errors.notJson],
      [
        JSON.stringify({ name: "a different app" }),
        messages.errors.unknownFormat,
      ],
      [
        JSON.stringify({ version: CURRENT_VERSION + 1, jobs: [] }),
        messages.errors.newerVersion,
      ],
      [
        JSON.stringify({
          version: CURRENT_VERSION,
          jobs: [makeJob(), makeJob()],
        }),
        messages.errors.duplicateIds,
      ],
      [
        JSON.stringify({
          version: CURRENT_VERSION,
          jobs: [makeJob({ url: "ftp://x" })],
        }),
        messages.errors.badJob(1, "url", messages.validation.link),
      ],
    ];

    for (const [text, message] of cases) {
      expect(() => parseImportFile(text)).toThrow(InvalidDataError);
      expect(() => parseImportFile(text)).toThrow(message);
    }
  });
});
