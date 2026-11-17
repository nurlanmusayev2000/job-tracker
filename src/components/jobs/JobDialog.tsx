"use client";

import { useId } from "react";

import { emptyJobInput, type Job, type JobInput } from "@/jobs/job";
import { toJobInput } from "@/jobs/jobForm";
import { messages } from "@/messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addJob,
  deleteJob,
  describeSaveError,
  saveJob,
  selectJobs,
} from "@/store/jobsSlice";

import { Dialog } from "../ui/Dialog";
import { JobForm } from "./JobForm";

interface JobDialogProps {
  open: boolean;
  /** The job to edit, or undefined to add a new one. */
  job?: Job;
  /** Starting values for a new job, for example from the bookmarklet. */
  newJobValues?: JobInput;
  onClose: () => void;
}

/** The dialog for adding a vacancy, or editing and deleting one. */
export function JobDialog({
  open,
  job,
  newJobValues,
  onClose,
}: JobDialogProps) {
  const dispatch = useAppDispatch();
  const savedJobs = useAppSelector(selectJobs);
  const headingId = useId();

  async function handleSubmit(values: JobInput) {
    if (job) {
      await dispatch(saveJob({ id: job.id, values })).unwrap();
    } else {
      await dispatch(addJob(values)).unwrap();
    }
    onClose();
  }

  async function handleDelete() {
    if (!job) return;
    await dispatch(deleteJob(job.id)).unwrap();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy={headingId}>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 id={headingId} className="text-xl font-semibold">
          {job ? messages.dialog.editTitle : messages.dialog.addTitle}
        </h2>
        <JobForm
          initialValues={
            job ? toJobInput(job) : (newJobValues ?? emptyJobInput())
          }
          onSubmit={handleSubmit}
          onCancel={onClose}
          onDelete={job ? handleDelete : undefined}
          describeError={describeSaveError}
          savedJobs={savedJobs}
          editedId={job?.id}
        />
      </div>
    </Dialog>
  );
}
