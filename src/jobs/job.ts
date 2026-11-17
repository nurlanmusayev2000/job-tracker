import type { LocalDate } from "@/lib/dates";

/** The stages of an application, in the order a vacancy moves through them. */
export const STAGES = [
  "saved",
  "applied",
  "interview",
  "offer",
  "closed",
] as const;
export type Stage = (typeof STAGES)[number];

/** Where the job is done. An empty string means "not filled in". */
export const WORK_MODES = ["remote", "hybrid", "onsite", ""] as const;
export type WorkMode = (typeof WORK_MODES)[number];

/** One vacancy the user is tracking. Text fields are "" when not filled in. */
export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  location: string;
  mode: WorkMode;
  salary: string;
  source: string;
  notes: string;
  status: Stage;
  /** The last day to apply, or "". */
  deadline: LocalDate;
  /** The day the application was sent, or "". */
  appliedOn: LocalDate;
  /** What to do next, for example "Follow up if there is no reply". */
  nextStep: string;
  /** The day of the next step, or "". */
  nextOn: LocalDate;
  /** When the vacancy was added, as an ISO date-time. */
  createdAt: string;
  /** When the vacancy was last changed, as an ISO date-time. */
  updatedAt: string;
}

/** The fields the user fills in. The repository adds the id and timestamps. */
export type JobInput = Omit<Job, "id" | "createdAt" | "updatedAt">;

/** Some of the fields of a job, for an update. */
export type JobChanges = Partial<JobInput>;

/** A new vacancy with every field empty, in the "saved" stage. */
export function emptyJobInput(): JobInput {
  return {
    title: "",
    company: "",
    url: "",
    location: "",
    mode: "",
    salary: "",
    source: "",
    notes: "",
    status: "saved",
    deadline: "",
    appliedOn: "",
    nextStep: "",
    nextOn: "",
  };
}

/** True if a next step is planned, either as text or as a date. */
export function hasNextStep(job: Pick<Job, "nextStep" | "nextOn">): boolean {
  return job.nextStep.trim() !== "" || job.nextOn !== "";
}
