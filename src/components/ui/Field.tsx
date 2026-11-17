import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const controlClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 " +
  "aria-[invalid=true]:border-red-600 " +
  "dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-sky-400 dark:aria-[invalid=true]:border-red-400";

interface FieldProps {
  /** The id of the input, also used to build the id of its error message. */
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/** A label, the input passed as children, and an error message if there is one. */
export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId(id)} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** The id of a field's error message, for aria-describedby. */
export function errorId(id: string): string {
  return `${id}-error`;
}

/** The accessibility attributes an input needs when it has an error. */
export function errorProps(id: string, error?: string) {
  return error ? { "aria-invalid": true, "aria-describedby": errorId(id) } : {};
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={controlClass} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={controlClass} rows={3} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={controlClass} {...props} />;
}
