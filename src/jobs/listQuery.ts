import { STAGES, type Job, type Stage } from "./job";
import { jobName } from "./display";

export const SORT_ORDERS = ["newest", "soonest", "company"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

/** What the list shows. Kept in the URL so a reload or a shared link keeps it. */
export interface ListQuery {
  /** Search text. Empty shows everything. */
  search: string;
  sort: SortOrder;
  /** Only this stage, or null for all stages. */
  stage: Stage | null;
  /** The id of the vacancy open in the dialog, or null. */
  openId: string | null;
}

export const DEFAULT_QUERY: ListQuery = {
  search: "",
  sort: "newest",
  stage: null,
  openId: null,
};

const SEARCHED_FIELDS = [
  "title",
  "company",
  "location",
  "source",
  "notes",
] as const;

/** True if every word of the search appears in one of the searched fields. */
export function matchesSearch(job: Job, search: string): boolean {
  const words = search.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = SEARCHED_FIELDS.map((field) => job[field])
    .join(" ")
    .toLocaleLowerCase();
  return words.every((word) => text.includes(word));
}

/**
 * The next date that matters for a job: its next step, or its deadline while
 * it is saved. Empty if there is none.
 */
export function soonestDate(job: Job): string {
  const dates = [job.nextOn, job.status === "saved" ? job.deadline : ""].filter(
    (date) => date !== "",
  );
  return dates.sort()[0] ?? "";
}

const compare: Record<SortOrder, (a: Job, b: Job) => number> = {
  // The most recently added first.
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  // The earliest date first (so overdue ones come first); jobs without a date last.
  soonest: (a, b) => {
    const dateA = soonestDate(a);
    const dateB = soonestDate(b);
    if (dateA === dateB) return 0;
    if (dateA === "") return 1;
    if (dateB === "") return -1;
    return dateA.localeCompare(dateB);
  },
  // Company A–Z, ignoring case and accents; jobs without a company use their name.
  company: (a, b) =>
    (a.company || jobName(a)).localeCompare(
      b.company || jobName(b),
      undefined,
      {
        sensitivity: "base",
      },
    ),
};

/** The jobs to show for a query: filtered by stage and search, then sorted. */
export function applyListQuery(jobs: Job[], query: ListQuery): Job[] {
  return jobs
    .filter((job) => query.stage === null || job.status === query.stage)
    .filter((job) => matchesSearch(job, query.search))
    .sort((a, b) => compare[query.sort](a, b) || compare.newest(a, b));
}

/** Reads the query from the URL's query string. Unknown values fall back to the default. */
export function parseListQuery(searchString: string): ListQuery {
  const params = new URLSearchParams(searchString);
  const sort = params.get("sort");
  const stage = params.get("stage");
  return {
    search: params.get("q") ?? "",
    sort: SORT_ORDERS.find((order) => order === sort) ?? DEFAULT_QUERY.sort,
    stage: STAGES.find((option) => option === stage) ?? null,
    openId: params.get("job") || null,
  };
}

/** Writes the query as a query string, leaving out the default values. */
export function formatListQuery(query: ListQuery): string {
  const params = new URLSearchParams();
  if (query.search !== "") params.set("q", query.search);
  if (query.sort !== DEFAULT_QUERY.sort) params.set("sort", query.sort);
  if (query.stage !== null) params.set("stage", query.stage);
  if (query.openId !== null) params.set("job", query.openId);
  return params.toString();
}
