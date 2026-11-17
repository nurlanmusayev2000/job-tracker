"use client";

import { STAGES, type Stage } from "@/jobs/job";
import { SORT_ORDERS, type ListQuery, type SortOrder } from "@/jobs/listQuery";
import { messages } from "@/messages";

import { Button } from "../ui/Button";
import { Select, TextInput } from "../ui/Field";

const text = messages.list;

interface ListToolbarProps {
  query: ListQuery;
  onChange: (changes: Partial<ListQuery>) => void;
  shown: number;
  total: number;
}

/** Search, sort and stage filter above the list, with how many vacancies are shown. */
export function ListToolbar({
  query,
  onChange,
  shown,
  total,
}: ListToolbarProps) {
  const isFiltered = query.search !== "" || query.stage !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="list-search" className="text-sm font-medium">
            {text.search}
          </label>
          <TextInput
            id="list-search"
            type="search"
            value={query.search}
            placeholder={text.searchPlaceholder}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="list-sort" className="text-sm font-medium">
            {text.sort}
          </label>
          <Select
            id="list-sort"
            value={query.sort}
            onChange={(event) =>
              onChange({ sort: event.target.value as SortOrder })
            }
          >
            {SORT_ORDERS.map((order) => (
              <option key={order} value={order}>
                {text.sortOrders[order]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="list-stage" className="text-sm font-medium">
            {text.stageFilter}
          </label>
          <Select
            id="list-stage"
            value={query.stage ?? ""}
            onChange={(event) =>
              onChange({
                stage:
                  event.target.value === ""
                    ? null
                    : (event.target.value as Stage),
              })
            }
          >
            <option value="">{text.allStages}</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {messages.stages[stage]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {/*
          role="status" makes screen readers announce the new count as you
          type. The element is always there (empty when not filtering), because
          screen readers only announce changes to a status that already exists.
        */}
        <p role="status" className="text-slate-600 dark:text-slate-400">
          {isFiltered ? text.showing(shown, total) : ""}
        </p>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => onChange({ search: "", stage: null })}
          >
            {text.clearFilters}
          </Button>
        )}
      </div>
    </div>
  );
}
