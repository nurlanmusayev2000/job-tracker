"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  /** Called when the dialog closes, including with the Escape key. */
  onClose: () => void;
  /** The id of the element that names the dialog, usually its heading. */
  labelledBy: string;
  children: ReactNode;
}

/**
 * A modal dialog built on the browser's own <dialog> element. The browser
 * keeps keyboard focus inside it, closes it with Escape and puts focus back
 * on the button that opened it, so this component only has to open and
 * close it.
 */
export function Dialog({ open, onClose, labelledBy, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50 dark:bg-slate-900 dark:text-slate-100"
    >
      {/* The content is only rendered while open, so the form starts fresh each time. */}
      {open && children}
    </dialog>
  );
}
