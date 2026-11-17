/**
 * Date helpers for local calendar dates.
 *
 * The app stores dates such as a deadline as text in the form "YYYY-MM-DD".
 * They are calendar days in the user's own time zone, not moments in time,
 * so "2026-11-17" means the same day wherever the user is.
 *
 * The math below treats each date as midnight UTC. UTC has no daylight
 * saving time, so every day is exactly 24 hours long and adding days or
 * counting the days between two dates is always exact.
 */

/** A calendar date written as "YYYY-MM-DD". */
export type LocalDate = string;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/** True if `value` is a real date in the form "YYYY-MM-DD" (so not "2026-02-30"). */
export function isValidLocalDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Midnight UTC of a local date, in milliseconds. Throws for an invalid date. */
function toUtcMs(date: LocalDate): number {
  if (!isValidLocalDate(date)) {
    throw new RangeError(`Not a valid date: "${date}"`);
  }
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): LocalDate {
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${twoDigits(date.getUTCMonth() + 1)}-${twoDigits(date.getUTCDate())}`;
}

/** The calendar date that `moment` falls on in the user's time zone. */
export function toLocalDate(moment: Date): LocalDate {
  return `${moment.getFullYear()}-${twoDigits(moment.getMonth() + 1)}-${twoDigits(moment.getDate())}`;
}

/** Today's date in the user's time zone. Pass `now` to use a fixed time in tests. */
export function today(now: Date = new Date()): LocalDate {
  return toLocalDate(now);
}

/** The date `days` days after `date` (or before it, for a negative number). */
export function addDays(date: LocalDate, days: number): LocalDate {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

/**
 * How many days `to` is after `from`. Negative if `to` is earlier.
 * For example daysBetween("2026-11-17", "2026-11-20") is 3.
 */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** The Monday of the week that `date` is in. Weeks start on Monday. */
export function startOfWeek(date: LocalDate): LocalDate {
  const dayOfWeek = new Date(toUtcMs(date)).getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return addDays(date, -daysSinceMonday);
}

/**
 * A date written for people, for example "24 Nov 2026" for the locale
 * "en-GB". The date is formatted in UTC to match how it is stored above.
 */
export function formatDate(date: LocalDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcMs(date));
}
