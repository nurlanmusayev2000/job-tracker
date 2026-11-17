"use client";

import { useEffect, useMemo, useState } from "react";

import { applyListQuery } from "@/jobs/listQuery";
import { messages } from "@/messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  dismissSaveError,
  loadJobs,
  selectJobById,
  selectJobs,
  selectLoadError,
  selectLoadStatus,
  selectNextUp,
  selectSaveError,
  selectStageCounts,
  selectSummary,
} from "@/store/jobsSlice";

import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { JobDialog } from "./JobDialog";
import { EmptyJobList, JobListSkeleton } from "./JobListStates";
import { JobRow } from "./JobRow";
import { ListToolbar } from "./ListToolbar";
import { NextUpList } from "./NextUpList";
import { PipelineHeader } from "./PipelineHeader";
import { useListQuery } from "./useListQuery";

/** The main page: the header, the pipeline, "Next up", the list and the dialog. */
export function JobsPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectLoadStatus);
  const loadError = useAppSelector(selectLoadError);
  const saveError = useAppSelector(selectSaveError);
  const jobs = useAppSelector(selectJobs);
  const counts = useAppSelector(selectStageCounts);
  const summary = useAppSelector(selectSummary);
  const nextUp = useAppSelector(selectNextUp);

  // Search, sort, stage filter and the open vacancy live in the URL.
  const [query, updateQuery] = useListQuery();
  const visibleJobs = useMemo(() => applyListQuery(jobs, query), [jobs, query]);
  const openJob = useAppSelector((state) =>
    query.openId ? selectJobById(state, query.openId) : undefined,
  );
  // "Add vacancy" has no id yet, so it is the one dialog state not in the URL.
  const [isAdding, setIsAdding] = useState(false);

  // Read the saved vacancies once, after the page is on screen. Reading
  // them during the first render would make it differ from the server HTML.
  useEffect(() => {
    void dispatch(loadJobs());
  }, [dispatch]);

  const isReady = status === "ready";
  const openVacancy = (id: string) => updateQuery({ openId: id });
  const closeDialog = () => {
    setIsAdding(false);
    updateQuery({ openId: null });
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {messages.app.name}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {isReady && jobs.length > 0
              ? messages.summary(summary.open, summary.appliedThisWeek)
              : messages.app.description}
          </p>
        </div>
        <Button
          variant="primary"
          disabled={!isReady}
          onClick={() => setIsAdding(true)}
        >
          {messages.list.add}
        </Button>
      </header>

      {saveError && (
        <Alert>
          <span>{saveError}</span>
          <Button variant="ghost" onClick={() => dispatch(dismissSaveError())}>
            {messages.errors.dismiss}
          </Button>
        </Alert>
      )}

      {isReady && jobs.length > 0 && (
        <>
          <PipelineHeader
            counts={counts}
            activeStage={query.stage}
            onSelect={(stage) => updateQuery({ stage })}
          />
          <NextUpList items={nextUp} onOpen={openVacancy} />
        </>
      )}

      <section aria-labelledby="list-heading" className="flex flex-col gap-4">
        <h2 id="list-heading" className="text-lg font-semibold">
          {messages.list.heading}
        </h2>

        {status === "failed" && <Alert>{loadError}</Alert>}
        {(status === "idle" || status === "loading") && <JobListSkeleton />}
        {isReady && jobs.length === 0 && <EmptyJobList />}
        {isReady && jobs.length > 0 && (
          <>
            <ListToolbar
              query={query}
              onChange={updateQuery}
              shown={visibleJobs.length}
              total={jobs.length}
            />
            {visibleJobs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                {messages.list.noMatches}
              </p>
            ) : (
              <ul
                aria-label={messages.list.heading}
                className="flex flex-col gap-3"
              >
                {visibleJobs.map((job) => (
                  <JobRow key={job.id} job={job} onEdit={openVacancy} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <JobDialog
        open={isAdding || openJob !== undefined}
        job={isAdding ? undefined : openJob}
        onClose={closeDialog}
      />
    </main>
  );
}
