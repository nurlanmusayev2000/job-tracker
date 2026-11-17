import { emptyJobInput, type Job, type JobInput } from "@/jobs/job";

/** A valid job input for tests. Pass only the fields a test cares about. */
export function makeJobInput(overrides: Partial<JobInput> = {}): JobInput {
  return {
    ...emptyJobInput(),
    title: "Frontend Developer",
    company: "Acme",
    ...overrides,
  };
}

/** A valid saved job for tests. Pass only the fields a test cares about. */
export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    ...makeJobInput(),
    id: "job-1",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
    ...overrides,
  };
}

/** An in-memory stand-in for localStorage. */
export function createFakeStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}
