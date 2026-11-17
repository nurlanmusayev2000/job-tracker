import { messages } from "@/messages";

import { jobName } from "./display";
import { emptyJobInput, type Job, type JobInput } from "./job";
import { isHttpUrl } from "./schema";

/** The longest title the bookmarklet passes on; page titles can be very long. */
const MAX_TITLE_LENGTH = 200;

/**
 * Reads a request from the bookmarklet in the query string, for example
 * "?add=https%3A%2F%2Fjobs.example.com%2F42&title=Frontend%20Developer".
 * Returns the values for a new vacancy, or null if there is no request.
 * A link that is not http(s) is left out.
 */
export function parseAddRequest(searchString: string): JobInput | null {
  const params = new URLSearchParams(searchString);
  if (!params.has("add")) return null;

  const url = (params.get("add") ?? "").trim();
  const title = (params.get("title") ?? "").trim().slice(0, MAX_TITLE_LENGTH);
  return {
    ...emptyJobInput(),
    url: isHttpUrl(url) ? url : "",
    title,
  };
}

/**
 * The code of the bookmarklet: a bookmark that, clicked on any job posting,
 * opens this app with the page's link and title in the "Add" dialog.
 * `appUrl` is the address of this app, for example
 * "https://nurlanmusayev2000.github.io/job-tracker/".
 */
export function bookmarkletCode(appUrl: string): string {
  return (
    "javascript:(function(){window.open(" +
    `${JSON.stringify(`${appUrl}?add=`)}+encodeURIComponent(location.href)` +
    `+"&title="+encodeURIComponent(document.title),"_blank");})();`
  );
}

/** A link without spaces, a trailing slash or a #part, for comparing two links. */
function comparableUrl(url: string): string {
  return url.trim().replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();
}

const sameText = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/**
 * A saved job that looks like the same vacancy: the same link, or the same
 * title and company. Returns null if there is none. `ignoreId` is the job
 * being edited, which should not match itself.
 */
export function findDuplicate(
  values: Pick<JobInput, "title" | "company" | "url">,
  jobs: Job[],
  ignoreId?: string,
): Job | null {
  const url = comparableUrl(values.url);
  const hasTitleAndCompany =
    values.title.trim() !== "" && values.company.trim() !== "";

  return (
    jobs.find((job) => {
      if (job.id === ignoreId) return false;
      const sameUrl = url !== "" && comparableUrl(job.url) === url;
      const sameRole =
        hasTitleAndCompany &&
        sameText(job.title, values.title) &&
        sameText(job.company, values.company);
      return sameUrl || sameRole;
    }) ?? null
  );
}

/** "Frontend Developer at Acme", for the duplicate warning. */
export function describeJob(job: Pick<Job, "title" | "company">): string {
  return job.title && job.company
    ? messages.jobs.titleAtCompany(job.title, job.company)
    : jobName(job);
}
