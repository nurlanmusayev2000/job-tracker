import type { Job, JobChanges, JobInput } from "./job";

/**
 * Where the jobs are saved. The rest of the app talks only to this
 * interface, never to localStorage directly.
 *
 * Every method returns a Promise, even though localStorage answers at once.
 * A version that saves to a server would have to wait for the network, so
 * with async methods it could replace the localStorage version without
 * changing the code that uses it.
 */
export interface JobRepository {
  /** All saved jobs, in the order they were added. */
  list(): Promise<Job[]>;
  /** Saves a new job and returns it with its id and timestamps. */
  create(input: JobInput): Promise<Job>;
  /** Changes some fields of a job and returns the updated job. */
  update(id: string, changes: JobChanges): Promise<Job>;
  /** Deletes a job. Deleting a job that does not exist does nothing. */
  remove(id: string): Promise<void>;
  /** Replaces all saved jobs, for example with the jobs from an imported file. */
  replaceAll(jobs: Job[]): Promise<void>;
}

/** Thrown by `update` when no job has the given id. */
export class JobNotFoundError extends Error {
  constructor(id: string) {
    super(`No job with id "${id}"`);
    this.name = "JobNotFoundError";
  }
}
