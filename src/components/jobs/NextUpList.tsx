"use client";

import { jobName, nextUpText } from "@/jobs/display";
import { ACTION_FOR_REASON, type NextUpItem } from "@/jobs/nextUp";
import { formatDate } from "@/lib/dates";
import { messages } from "@/messages";
import { useAppDispatch } from "@/store/hooks";
import { applyQuickAction } from "@/store/jobsSlice";

import { Button } from "../ui/Button";

interface NextUpListProps {
  items: NextUpItem[];
  onOpen: (id: string) => void;
}

/** The vacancies that need attention soon, each with one quick action. */
export function NextUpList({ items, onOpen }: NextUpListProps) {
  const dispatch = useAppDispatch();

  return (
    <section aria-labelledby="next-up-heading" className="flex flex-col gap-3">
      <h2 id="next-up-heading" className="text-lg font-semibold">
        {messages.nextUp.heading}
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {messages.nextUp.empty}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {items.map((item) => {
            const name = jobName(item.job);
            const action = ACTION_FOR_REASON[item.reason];
            const actionText = messages.nextUp.actions[action];
            return (
              <li
                key={item.job.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col">
                  <button
                    type="button"
                    onClick={() => onOpen(item.job.id)}
                    aria-label={messages.list.edit(name)}
                    className="self-start text-left font-medium break-words hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400"
                  >
                    {name}
                  </button>
                  <p
                    className={`text-sm ${item.days < 0 ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {nextUpText(item)}
                    <span className="text-slate-500 dark:text-slate-400">
                      {" · "}
                      <time dateTime={item.date}>
                        {formatDate(item.date, messages.locale)}
                      </time>
                    </span>
                  </p>
                </div>
                <Button
                  className="shrink-0 self-start sm:self-center"
                  aria-label={messages.nextUp.actionLabel(actionText, name)}
                  onClick={() =>
                    void dispatch(applyQuickAction({ id: item.job.id, action }))
                  }
                >
                  {actionText}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
