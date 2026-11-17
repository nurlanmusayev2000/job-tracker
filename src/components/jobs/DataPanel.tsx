"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";

import type { Job } from "@/jobs/job";
import { createExportFile, parseImportFile } from "@/jobs/importExport";
import { downloadTextFile } from "@/lib/download";
import { messages } from "@/messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  describeSaveError,
  importJobs,
  selectJobs,
  selectToday,
} from "@/store/jobsSlice";

import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

const text = messages.data;

/** The "Your data" section: export all vacancies, or import a file to replace them. */
export function DataPanel() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectJobs);
  const today = useAppSelector(selectToday);
  const fileInput = useRef<HTMLInputElement>(null);
  const confirmHeadingId = useId();

  /** The jobs from a checked file, waiting for the user to confirm. */
  const [pending, setPending] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function handleExport() {
    const file = createExportFile(jobs, today);
    downloadTextFile(file.fileName, file.text, "application/json");
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input, so choosing the same file again still works.
    event.target.value = "";
    if (!file) return;

    setError(null);
    setNotice("");
    try {
      setPending(parseImportFile(await file.text()));
    } catch (reason) {
      setError(text.importFailed(describeSaveError(reason)));
    }
  }

  async function handleConfirm() {
    if (!pending) return;
    setBusy(true);
    try {
      await dispatch(importJobs(pending)).unwrap();
      setNotice(text.imported(pending.length));
      setPending(null);
    } catch (reason) {
      setError(text.importFailed(describeSaveError(reason)));
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="data-heading"
      className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800"
    >
      <h2 id="data-heading" className="text-lg font-semibold">
        {text.heading}
      </h2>
      <p className="max-w-prose text-sm text-slate-600 dark:text-slate-400">
        {text.text}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleExport} disabled={jobs.length === 0}>
          {text.export}
        </Button>
        <Button onClick={() => fileInput.current?.click()}>
          {text.import}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
          // The visible "Import JSON" button opens this input, so it is
          // hidden from screen readers and the Tab order.
          aria-hidden="true"
          tabIndex={-1}
          data-testid="import-file"
        />
      </div>

      {error && <Alert>{error}</Alert>}
      <p
        role="status"
        className="text-sm text-emerald-800 dark:text-emerald-300"
      >
        {notice}
      </p>

      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        labelledBy={confirmHeadingId}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 id={confirmHeadingId} className="text-xl font-semibold">
            {text.confirmTitle}
          </h2>
          <p>{text.confirmText(pending?.length ?? 0, jobs.length)}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button autoFocus disabled={busy} onClick={() => setPending(null)}>
              {text.cancel}
            </Button>
            <Button variant="danger" disabled={busy} onClick={handleConfirm}>
              {text.confirmImport}
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
