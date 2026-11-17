"use client";

import { STAGES, type Stage } from "@/jobs/job";
import { messages } from "@/messages";

import { stageDotColors } from "./stageColors";

interface PipelineHeaderProps {
  counts: Record<Stage, number>;
  /** The stage the list is filtered to, or null for all. */
  activeStage: Stage | null;
  /** Called with a stage to filter by it, or with null to show all again. */
  onSelect: (stage: Stage | null) => void;
}

/**
 * The five stages as stops on one horizontal line, each with its count.
 * Choosing a stop filters the list to that stage; choosing it again shows
 * everything.
 */
export function PipelineHeader({
  counts,
  activeStage,
  onSelect,
}: PipelineHeaderProps) {
  return (
    <div role="group" aria-label={messages.pipeline.label} className="relative">
      {/*
        The line runs from the middle of the first stop to the middle of the
        last one. There are five equal columns, so those are at 10% and 90%.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] top-[1.0625rem] h-0.5 bg-slate-300 dark:bg-slate-700"
      />
      <ol className="relative grid grid-cols-5">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage;
          const isDimmed = activeStage !== null && !isActive;
          return (
            <li key={stage} className="flex justify-center">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(isActive ? null : stage)}
                className="flex w-full flex-col items-center gap-1 rounded-lg px-0.5 pt-2 pb-1 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 dark:hover:bg-slate-800/60 dark:focus-visible:outline-sky-400"
              >
                <span
                  aria-hidden="true"
                  className={`size-3.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-950 ${stageDotColors[stage]} ${isActive ? "scale-125 motion-safe:transition-transform" : ""} ${isDimmed ? "opacity-40" : ""}`}
                />
                {/* The count and the stage name are what screen readers say, for example "2 Applied". */}
                <span
                  className={`text-2xl font-semibold tabular-nums sm:text-3xl ${isDimmed ? "text-slate-500 dark:text-slate-400" : ""}`}
                >
                  {counts[stage]}
                </span>{" "}
                <span
                  className={`text-[11px] leading-tight sm:text-sm ${isActive ? "font-semibold underline underline-offset-4" : "text-slate-600 dark:text-slate-400"}`}
                >
                  {messages.stages[stage]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
