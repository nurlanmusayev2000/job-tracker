"use client";

import { STAGES, type Stage } from "@/jobs/job";
import { messages } from "@/messages";

import { stageColors } from "./stageColors";

interface StageSelectProps {
  id: string;
  stage: Stage;
  /** Read by screen readers, for example "Stage of Frontend Developer". */
  label: string;
  onChange: (stage: Stage) => void;
}

/** A compact drop-down for changing a job's stage from its row. */
export function StageSelect({ id, stage, label, onChange }: StageSelectProps) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={stage}
        onChange={(event) => onChange(event.target.value as Stage)}
        className={`min-h-10 rounded-full border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400 ${stageColors[stage]}`}
      >
        {STAGES.map((option) => (
          <option key={option} value={option}>
            {messages.stages[option]}
          </option>
        ))}
      </select>
    </>
  );
}
