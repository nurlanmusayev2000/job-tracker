import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type SerializedError,
} from "@reduxjs/toolkit";

import type { Job, JobInput, Stage } from "@/jobs/job";
import {
  changesForQuickAction,
  nextUpItems,
  type QuickAction,
} from "@/jobs/nextUp";
import { countByStage, summarize } from "@/jobs/overview";
import { normalizeJobInput } from "@/jobs/jobForm";
import { JobNotFoundError, type JobRepository } from "@/jobs/repository";
import { changesForStage, withStageRules } from "@/jobs/stageRules";
import type { LocalDate } from "@/lib/dates";
import { messages } from "@/messages";

/**
 * What the thunks below get from the store, besides the state. Passing them
 * in (instead of importing them) lets tests use a fake storage and a fixed
 * date.
 */
export interface ThunkExtra {
  repository: JobRepository;
  /** Today's date. */
  today: () => LocalDate;
}

/** Whether the jobs have been read from storage yet. */
export type LoadStatus = "idle" | "loading" | "ready" | "failed";

export interface JobsState {
  items: Job[];
  /**
   * Today's date, read when the jobs load. Keeping it in the state lets the
   * selectors below stay pure functions of the state.
   */
  today: LocalDate;
  status: LoadStatus;
  /** Why loading failed, shown instead of the list. */
  loadError: string | null;
  /** Why the last change could not be saved, shown above the list. */
  saveError: string | null;
}

const initialState: JobsState = {
  items: [],
  today: "",
  status: "idle",
  loadError: null,
  saveError: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: { jobs: JobsState };
  extra: ThunkExtra;
}>();

/** Reads all jobs from storage, and today's date. Called once, after the page has mounted. */
export const loadJobs = createAppAsyncThunk(
  "jobs/load",
  async (_: void, { extra }) => ({
    jobs: await extra.repository.list(),
    today: extra.today(),
  }),
);

/** Saves a new job from the dialog. The stage rules apply to its stage. */
export const addJob = createAppAsyncThunk(
  "jobs/add",
  async (values: JobInput, { extra }) => {
    const input = withStageRules(
      normalizeJobInput(values),
      "saved",
      extra.today(),
    );
    return extra.repository.create(input);
  },
);

/** Saves the dialog's changes to a job. The stage rules apply if the stage changed. */
export const saveJob = createAppAsyncThunk(
  "jobs/save",
  async (
    { id, values }: { id: string; values: JobInput },
    { getState, extra },
  ) => {
    const job = findJob(getState().jobs.items, id);
    const input = withStageRules(
      normalizeJobInput(values),
      job.status,
      extra.today(),
    );
    return extra.repository.update(id, input);
  },
);

/** Moves a job to another stage, for example from its row in the list. */
export const changeStage = createAppAsyncThunk(
  "jobs/changeStage",
  async ({ id, stage }: { id: string; stage: Stage }, { getState, extra }) => {
    const job = findJob(getState().jobs.items, id);
    const changes = changesForStage(job, stage, extra.today());
    return extra.repository.update(id, changes);
  },
);

/** Runs a quick action from "Next up", for example "Remind me in a week". */
export const applyQuickAction = createAppAsyncThunk(
  "jobs/quickAction",
  async (
    { id, action }: { id: string; action: QuickAction },
    { getState, extra },
  ) => {
    const job = findJob(getState().jobs.items, id);
    const changes = changesForQuickAction(job, action, extra.today());
    return extra.repository.update(id, changes);
  },
);

/** Deletes a job and returns its id. */
export const deleteJob = createAppAsyncThunk(
  "jobs/delete",
  async (id: string, { extra }) => {
    await extra.repository.remove(id);
    return id;
  },
);

function findJob(jobs: Job[], id: string): Job {
  const job = jobs.find((item) => item.id === id);
  if (!job) throw new JobNotFoundError(id);
  return job;
}

/** Replaces the job with the same id. */
function replaceJob(state: JobsState, updated: Job) {
  state.items = state.items.map((job) =>
    job.id === updated.id ? updated : job,
  );
  state.saveError = null;
}

/**
 * A readable message for an error. Errors about bad data already have one;
 * anything else (for example full storage) gets a general message.
 */
function messageFor(error: SerializedError, fallback: string): string {
  return error.name === "InvalidDataError" && error.message
    ? error.message
    : fallback;
}

/** A readable message for an error from adding, saving or deleting a job. */
export function describeSaveError(error: unknown): string {
  const serialized =
    typeof error === "object" && error !== null
      ? (error as SerializedError)
      : {};
  return messageFor(serialized, messages.errors.saveFailed);
}

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    dismissSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadJobs.pending, (state) => {
        state.status = "loading";
        state.loadError = null;
      })
      .addCase(loadJobs.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload.jobs;
        state.today = action.payload.today;
      })
      .addCase(loadJobs.rejected, (state, action) => {
        state.status = "failed";
        state.loadError = messageFor(action.error, messages.errors.loadFailed);
      })
      .addCase(addJob.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.saveError = null;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        replaceJob(state, action.payload);
      })
      .addCase(changeStage.fulfilled, (state, action) => {
        replaceJob(state, action.payload);
      })
      .addCase(changeStage.rejected, (state, action) => {
        state.saveError = messageFor(action.error, messages.errors.saveFailed);
      })
      .addCase(applyQuickAction.fulfilled, (state, action) => {
        replaceJob(state, action.payload);
      })
      .addCase(applyQuickAction.rejected, (state, action) => {
        state.saveError = messageFor(action.error, messages.errors.saveFailed);
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((job) => job.id !== action.payload);
        state.saveError = null;
      });
    // The dialog shows its own error when adding, saving or deleting fails,
    // so those rejections are not stored here.
  },
});

export const { dismissSaveError } = jobsSlice.actions;
export const jobsReducer = jobsSlice.reducer;

type StateWithJobs = { jobs: JobsState };

export const selectLoadStatus = (state: StateWithJobs) => state.jobs.status;
export const selectLoadError = (state: StateWithJobs) => state.jobs.loadError;
export const selectSaveError = (state: StateWithJobs) => state.jobs.saveError;

export const selectJobById = (state: StateWithJobs, id: string) =>
  state.jobs.items.find((job) => job.id === id);

export const selectJobs = (state: StateWithJobs) => state.jobs.items;
export const selectToday = (state: StateWithJobs) => state.jobs.today;

// createSelector remembers its last result, so these are only recalculated
// when the jobs or the date change, not on every render.

/** How many jobs are in each stage, for the pipeline header. */
export const selectStageCounts = createSelector([selectJobs], countByStage);

/** Open vacancies and applications sent this week, for the summary line. */
export const selectSummary = createSelector(
  [selectJobs, selectToday],
  // Until the jobs have loaded there is no date yet, and nothing to count.
  (jobs, today) =>
    today === "" ? { open: 0, appliedThisWeek: 0 } : summarize(jobs, today),
);

/** The jobs that need attention soon, most urgent first. */
export const selectNextUp = createSelector(
  [selectJobs, selectToday],
  (jobs, today) => (today === "" ? [] : nextUpItems(jobs, today)),
);
