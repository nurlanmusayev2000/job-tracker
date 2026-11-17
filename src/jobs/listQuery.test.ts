import { describe, expect, it } from "vitest";

import { makeJob } from "@/test/factories";

import {
  applyListQuery,
  DEFAULT_QUERY,
  formatListQuery,
  matchesSearch,
  parseListQuery,
  soonestDate,
  type ListQuery,
} from "./listQuery";

const query = (changes: Partial<ListQuery>): ListQuery => ({
  ...DEFAULT_QUERY,
  ...changes,
});
const ids = (jobs: { id: string }[]) => jobs.map((job) => job.id);

describe("matchesSearch", () => {
  const job = makeJob({
    title: "Frontend Developer",
    company: "Acme",
    location: "Berlin",
    source: "LinkedIn",
    notes: "Referral from Anna",
  });

  it("searches the title, company, location, source and notes, ignoring case", () => {
    for (const search of ["frontend", "ACME", "berlin", "linkedin", "anna"]) {
      expect(matchesSearch(job, search)).toBe(true);
    }
  });

  it("needs every word to match", () => {
    expect(matchesSearch(job, "acme berlin")).toBe(true);
    expect(matchesSearch(job, "acme paris")).toBe(false);
  });

  it("does not search other fields", () => {
    expect(matchesSearch(makeJob({ salary: "4000 EUR" }), "4000")).toBe(false);
  });

  it("matches everything when the search is empty", () => {
    expect(matchesSearch(job, "   ")).toBe(true);
  });
});

describe("soonestDate", () => {
  it("uses the next step date, or the deadline while saved", () => {
    expect(
      soonestDate(makeJob({ nextOn: "2026-11-20", deadline: "2026-11-18" })),
    ).toBe("2026-11-18");
    expect(
      soonestDate(
        makeJob({
          status: "applied",
          nextOn: "2026-11-20",
          deadline: "2026-11-18",
        }),
      ),
    ).toBe("2026-11-20");
    expect(soonestDate(makeJob())).toBe("");
  });
});

describe("applyListQuery", () => {
  const jobs = [
    makeJob({
      id: "a",
      company: "beta",
      status: "saved",
      createdAt: "2026-11-01T00:00:00.000Z",
      deadline: "2026-11-30",
    }),
    makeJob({
      id: "b",
      company: "Alpha",
      status: "applied",
      createdAt: "2026-11-03T00:00:00.000Z",
    }),
    makeJob({
      id: "c",
      company: "Ćevapi Labs",
      status: "applied",
      createdAt: "2026-11-02T00:00:00.000Z",
      nextOn: "2026-11-20",
    }),
  ];

  it("sorts the newest first by default", () => {
    expect(ids(applyListQuery(jobs, DEFAULT_QUERY))).toEqual(["b", "c", "a"]);
  });

  it("sorts by the soonest date, with undated vacancies last", () => {
    expect(ids(applyListQuery(jobs, query({ sort: "soonest" })))).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts by company A–Z, ignoring case and accents", () => {
    expect(ids(applyListQuery(jobs, query({ sort: "company" })))).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("filters by stage and search together", () => {
    expect(ids(applyListQuery(jobs, query({ stage: "applied" })))).toEqual([
      "b",
      "c",
    ]);
    expect(
      ids(applyListQuery(jobs, query({ stage: "applied", search: "alpha" }))),
    ).toEqual(["b"]);
  });

  it("does not change the list it was given", () => {
    const copy = [...jobs];
    applyListQuery(jobs, query({ sort: "company" }));
    expect(jobs).toEqual(copy);
  });
});

describe("URL query string", () => {
  it("leaves out default values", () => {
    expect(formatListQuery(DEFAULT_QUERY)).toBe("");
  });

  it("writes and reads every value", () => {
    const full: ListQuery = {
      search: "react dev",
      sort: "company",
      stage: "interview",
      openId: "job-7",
    };
    const text = formatListQuery(full);

    expect(text).toBe("q=react+dev&sort=company&stage=interview&job=job-7");
    expect(parseListQuery(`?${text}`)).toEqual(full);
  });

  it("ignores unknown values instead of failing", () => {
    expect(parseListQuery("?sort=random&stage=ghosted&job=&other=1")).toEqual(
      DEFAULT_QUERY,
    );
  });
});
