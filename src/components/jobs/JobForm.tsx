"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import { STAGES, WORK_MODES, type JobInput } from "@/jobs/job";
import { validateJobInput, type JobFormErrors } from "@/jobs/jobForm";
import { messages } from "@/messages";

import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { errorProps, Field, Select, TextArea, TextInput } from "../ui/Field";

const text = messages.dialog;

interface JobFormProps {
  initialValues: JobInput;
  /** Saves the values. Throws if saving failed. */
  onSubmit: (values: JobInput) => Promise<void>;
  onCancel: () => void;
  /** Deletes the job. Only given when editing an existing job. */
  onDelete?: () => Promise<void>;
  /** Turns an error from saving or deleting into a message. */
  describeError: (error: unknown) => string;
}

/** The id of the input for a field, for example "job-title". */
const fieldId = (field: keyof JobInput) => `job-${field}`;

/** The add/edit form inside the vacancy dialog. */
export function JobForm({
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
  describeError,
}: JobFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  /** Returns a change handler that stores the new value of one field. */
  function handleChange(field: keyof JobInput) {
    return (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  /** Runs a save or a delete and shows a message if it fails. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(describeError(error));
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateJobInput(values);
    setErrors(found);

    const firstInvalid = Object.keys(found)[0] as keyof JobInput | undefined;
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    void run(() => onSubmit(values));
  }

  /** The props every text input gets. */
  function inputProps(field: keyof JobInput) {
    return {
      id: fieldId(field),
      name: field,
      value: values[field],
      onChange: handleChange(field),
      ...errorProps(fieldId(field), errors[field]),
    };
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {text.requiredHint}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={fieldId("title")}
          label={text.fields.title}
          error={errors.title}
        >
          <TextInput {...inputProps("title")} autoComplete="off" autoFocus />
        </Field>
        <Field id={fieldId("company")} label={text.fields.company}>
          <TextInput {...inputProps("company")} autoComplete="organization" />
        </Field>

        <div className="sm:col-span-2">
          <Field id={fieldId("url")} label={text.fields.url} error={errors.url}>
            <TextInput
              {...inputProps("url")}
              type="url"
              inputMode="url"
              placeholder={text.placeholders.url}
            />
          </Field>
        </div>

        <Field id={fieldId("status")} label={text.fields.status}>
          <Select {...inputProps("status")}>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {messages.stages[stage]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={fieldId("mode")} label={text.fields.mode}>
          <Select {...inputProps("mode")}>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {messages.modes[mode]}
              </option>
            ))}
          </Select>
        </Field>

        <Field id={fieldId("location")} label={text.fields.location}>
          <TextInput {...inputProps("location")} />
        </Field>
        <Field id={fieldId("salary")} label={text.fields.salary}>
          <TextInput
            {...inputProps("salary")}
            placeholder={text.placeholders.salary}
          />
        </Field>

        <Field id={fieldId("source")} label={text.fields.source}>
          <TextInput
            {...inputProps("source")}
            placeholder={text.placeholders.source}
          />
        </Field>
        <Field
          id={fieldId("deadline")}
          label={text.fields.deadline}
          error={errors.deadline}
        >
          <TextInput {...inputProps("deadline")} type="date" />
        </Field>

        <Field
          id={fieldId("appliedOn")}
          label={text.fields.appliedOn}
          error={errors.appliedOn}
        >
          <TextInput {...inputProps("appliedOn")} type="date" />
        </Field>
        <Field
          id={fieldId("nextOn")}
          label={text.fields.nextOn}
          error={errors.nextOn}
        >
          <TextInput {...inputProps("nextOn")} type="date" />
        </Field>

        <div className="sm:col-span-2">
          <Field id={fieldId("nextStep")} label={text.fields.nextStep}>
            <TextInput
              {...inputProps("nextStep")}
              placeholder={text.placeholders.nextStep}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id={fieldId("notes")} label={text.fields.notes}>
            <TextArea {...inputProps("notes")} />
          </Field>
        </div>
      </div>

      {actionError && <Alert>{actionError}</Alert>}

      {confirmingDelete && onDelete ? (
        <div className="flex flex-col gap-3 rounded-lg border border-red-300 p-4 dark:border-red-800">
          <p className="text-sm font-medium">{text.confirmDelete}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => void run(onDelete)}
            >
              {text.confirmDeleteYes}
            </Button>
            <Button
              autoFocus
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
            >
              {text.confirmDeleteNo}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap-reverse items-center justify-between gap-3">
          <div>
            {onDelete && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setConfirmingDelete(true)}
              >
                {text.delete}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={onCancel}>
              {text.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? text.saving : text.save}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
