"use client";

import { dateFacts, jobDetails, jobName, nextStepText } from "@/jobs/display";
import type { Job, Stage } from "@/jobs/job";
import { messages } from "@/messages";
import { useAppDispatch } from "@/store/hooks";
import { changeStage } from "@/store/jobsSlice";

import { StageSelect } from "./StageSelect";

interface JobRowProps {
  job: Job;
  onEdit: (id: string) => void;
}

/** One vacancy in the list: its name and details, its stage and an edit button. */
export function JobRow({ job, onEdit }: JobRowProps) {
  const dispatch = useAppDispatch();
  const name = jobName(job);
  const details = jobDetails(job);
  const nextStep = nextStepText(job);
  const facts = dateFacts(job);

  function handleStageChange(stage: Stage) {
    void dispatch(changeStage({ id: job.id, stage }));
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-base font-semibold break-words">
          <button
            type="button"
            onClick={() => onEdit(job.id)}
            aria-label={messages.list.edit(name)}
            className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400"
          >
            {name}
          </button>
        </h3>
        {details && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {details}
          </p>
        )}
        {nextStep && <p className="text-sm">{nextStep}</p>}
        {facts.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {facts.join(" · ")}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.list.openLink(name)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-400"
          >
            <span aria-hidden="true">↗</span>
          </a>
        )}
        <StageSelect
          id={`stage-${job.id}`}
          stage={job.status}
          label={messages.list.stageLabel(name)}
          onChange={handleStageChange}
        />
      </div>
    </li>
  );
}
