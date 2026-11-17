"use client";

import { useCallback, useMemo } from "react";

import {
  formatListQuery,
  parseListQuery,
  type ListQuery,
} from "@/jobs/listQuery";
import { replaceSearchString, useSearchString } from "@/lib/useSearchString";

/**
 * The list query (search, sort, stage filter and open vacancy), read from
 * and written to the URL. Works like useState, but the value lives in the
 * address bar, so a reload or a shared link shows the same list.
 */
export function useListQuery() {
  const searchString = useSearchString();
  const query = useMemo(() => parseListQuery(searchString), [searchString]);

  const updateQuery = useCallback((changes: Partial<ListQuery>) => {
    // Read the URL again here, so two quick updates never undo each other.
    const current = parseListQuery(window.location.search);
    replaceSearchString(formatListQuery({ ...current, ...changes }));
  }, []);

  return [query, updateQuery] as const;
}
