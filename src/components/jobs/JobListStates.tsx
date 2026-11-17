import { messages } from "@/messages";

/** Grey placeholder rows shown until the saved vacancies have been read. */
export function JobListSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">{messages.list.loading}</p>
      <ul className="flex flex-col gap-3" aria-hidden="true">
        {[0, 1, 2].map((row) => (
          <li
            key={row}
            className="flex animate-pulse flex-col gap-2 rounded-xl border border-slate-200 p-4 motion-reduce:animate-none dark:border-slate-800"
          >
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown when there are no vacancies yet. */
export function EmptyJobList() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      <h3 className="font-semibold">{messages.list.emptyTitle}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        {messages.list.emptyText}
      </p>
    </div>
  );
}
