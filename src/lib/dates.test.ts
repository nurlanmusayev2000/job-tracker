import { describe, expect, it } from "vitest";

import {
  addDays,
  daysBetween,
  formatDate,
  isValidLocalDate,
  startOfWeek,
  toLocalDate,
  today,
} from "./dates";

describe("test setup", () => {
  // vitest.config.mts runs the tests in New York time. It is behind UTC, so
  // the local date and the UTC date differ in the evening, and it has
  // daylight saving time, so some days there are 23 or 25 hours long.
  it("runs in a time zone with daylight saving time", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      "America/New_York",
    );
  });
});

describe("isValidLocalDate", () => {
  it("accepts real dates", () => {
    expect(isValidLocalDate("2026-11-17")).toBe(true);
    expect(isValidLocalDate("2028-02-29")).toBe(true); // leap year
  });

  it("rejects dates that do not exist", () => {
    expect(isValidLocalDate("2026-02-29")).toBe(false);
    expect(isValidLocalDate("2026-04-31")).toBe(false);
    expect(isValidLocalDate("2026-13-01")).toBe(false);
    expect(isValidLocalDate("2026-00-10")).toBe(false);
  });

  it("rejects other formats", () => {
    expect(isValidLocalDate("")).toBe(false);
    expect(isValidLocalDate("2026-1-5")).toBe(false);
    expect(isValidLocalDate("17.11.2026")).toBe(false);
    expect(isValidLocalDate("2026-11-17T10:00:00Z")).toBe(false);
  });
});

describe("toLocalDate and today", () => {
  it("uses the local date, not the UTC date", () => {
    // 21:30 in New York on 17 November is already 18 November in UTC.
    const evening = new Date(2026, 10, 17, 21, 30);
    expect(evening.toISOString().slice(0, 10)).toBe("2026-11-18");

    expect(toLocalDate(evening)).toBe("2026-11-17");
    expect(today(evening)).toBe("2026-11-17");
  });

  it("pads the month and day with a zero", () => {
    expect(toLocalDate(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("adds and subtracts days", () => {
    expect(addDays("2026-11-17", 7)).toBe("2026-11-24");
    expect(addDays("2026-11-17", -17)).toBe("2026-10-31");
    expect(addDays("2026-11-17", 0)).toBe("2026-11-17");
  });

  it("crosses months, years and leap days", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("is not affected by daylight saving time changes", () => {
    // Clocks change on 8 March and 1 November 2026 in New York.
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
  });

  it("throws for an invalid date", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow(RangeError);
    expect(() => addDays("", 1)).toThrow(RangeError);
  });
});

describe("daysBetween", () => {
  it("counts the days from the first date to the second", () => {
    expect(daysBetween("2026-11-17", "2026-11-20")).toBe(3);
    expect(daysBetween("2026-11-20", "2026-11-17")).toBe(-3);
    expect(daysBetween("2026-11-17", "2026-11-17")).toBe(0);
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("counts whole days across daylight saving time changes", () => {
    // 7 to 9 March is only 47 hours in New York, but it is still 2 days.
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
  });
});

describe("startOfWeek", () => {
  it("returns the Monday of the week", () => {
    expect(startOfWeek("2026-11-16")).toBe("2026-11-16"); // Monday
    expect(startOfWeek("2026-11-18")).toBe("2026-11-16"); // Wednesday
    expect(startOfWeek("2026-11-21")).toBe("2026-11-16"); // Saturday
  });

  it("treats Sunday as the last day of the week", () => {
    expect(startOfWeek("2026-11-22")).toBe("2026-11-16");
  });

  it("can go back into the previous month or year", () => {
    expect(startOfWeek("2026-11-01")).toBe("2026-10-26"); // Sunday
    expect(startOfWeek("2027-01-01")).toBe("2026-12-28"); // Friday
  });
});

describe("formatDate", () => {
  it("writes the date for people in the given language", () => {
    expect(formatDate("2026-11-24", "en-GB")).toBe("24 Nov 2026");
    expect(formatDate("2026-11-24", "en-US")).toBe("Nov 24, 2026");
  });

  it("shows the same day in every time zone", () => {
    // A late-evening time zone like New York would show 31 December if the
    // date were formatted in local time from midnight UTC.
    expect(formatDate("2027-01-01", "en-GB")).toBe("1 Jan 2027");
  });
});
