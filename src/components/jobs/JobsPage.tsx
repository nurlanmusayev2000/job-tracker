"use client";

import { useEffect, useState } from "react";

import { messages } from "@/messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  dismissSaveError,
  loadJobs,
  selectJobById,
  selectJobsNewestFirst,
  selectLoadError,
  selectLoadStatus,
  selectSaveError,
} from "@/store/jobsSlice";

import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { JobDialog } from "./JobDialog";
import { EmptyJobList, JobListSkeleton } from "./JobListStates";
import { JobRow } from "./JobRow";

/** Which dialog is open: none, the "add" dialog, or the dialog for one job. */
type DialogState =
  { kind: "closed" } | { kind: "add" } | { kind: "edit"; id: string };

/** The main page: a header, the list of vacancies and the vacancy dialog. */
export function JobsPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectLoadStatus);
  const loadError = useAppSelector(selectLoadError);
  const saveError = useAppSelector(selectSaveError);
  const jobs = useAppSelector(selectJobsNewestFirst);
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const editedJob = useAppSelector((state) =>
    dialog.kind === "edit" ? selectJobById(state, dialog.id) : undefined,
  );

  // Read the saved vacancies once, after the page is on screen. Reading
  // them during the first render would make it differ from the server HTML.
  useEffect(() => {
    void dispatch(loadJobs());
  }, [dispatch]);

  const closeDialog = () => setDialog({ kind: "closed" });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {messages.app.name}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {messages.app.description}
          </p>
        </div>
        <Button
          variant="primary"
          disabled={status !== "ready"}
          onClick={() => setDialog({ kind: "add" })}
        >
          {messages.list.add}
        </Button>
      </header>

      <section aria-labelledby="list-heading" className="flex flex-col gap-3">
        <h2 id="list-heading" className="sr-only">
          {messages.list.heading}
        </h2>

        {saveError && (
          <Alert>
            <span>{saveError}</span>
            <Button
              variant="ghost"
              onClick={() => dispatch(dismissSaveError())}
            >
              {messages.errors.dismiss}
            </Button>
          </Alert>
        )}

        {status === "failed" && <Alert>{loadError}</Alert>}
        {(status === "idle" || status === "loading") && <JobListSkeleton />}
        {status === "ready" && jobs.length === 0 && <EmptyJobList />}
        {status === "ready" && jobs.length > 0 && (
          <ul className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onEdit={(id) => setDialog({ kind: "edit", id })}
              />
            ))}
          </ul>
        )}
      </section>

      <JobDialog
        open={dialog.kind !== "closed"}
        job={editedJob}
        onClose={closeDialog}
      />
    </main>
  );
}
