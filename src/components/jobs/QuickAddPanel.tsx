"use client";

import { useEffect, useId, useRef, useState } from "react";

import { bookmarkletCode } from "@/jobs/quickAdd";
import { messages } from "@/messages";

import { Button } from "../ui/Button";

const text = messages.quickAdd;

/** The address of this app without a query string, for example ".../job-tracker/". */
function currentAppUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

/** Explains the bookmarklet and offers it as a link to drag, or as code to copy. */
export function QuickAddPanel() {
  const link = useRef<HTMLAnchorElement>(null);
  const hintId = useId();
  const [copyStatus, setCopyStatus] = useState("");

  // React 19 refuses "javascript:" links in href, as a protection against
  // links that run code. A bookmarklet has to be one, so the address is set
  // directly on the element. The code is our own and never includes user data.
  useEffect(() => {
    link.current?.setAttribute("href", bookmarkletCode(currentAppUrl()));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bookmarkletCode(currentAppUrl()));
      setCopyStatus(text.copied);
    } catch {
      setCopyStatus(text.copyFailed);
    }
  }

  return (
    <section
      aria-labelledby="quick-add-heading"
      className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800"
    >
      <h2 id="quick-add-heading" className="text-lg font-semibold">
        {text.heading}
      </h2>
      <p className="max-w-prose text-sm text-slate-600 dark:text-slate-400">
        {text.text}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <a
          ref={link}
          aria-describedby={hintId}
          // Clicking it here would only open this page again.
          onClick={(event) => event.preventDefault()}
          className="inline-flex min-h-10 cursor-grab items-center rounded-lg border border-dashed border-slate-400 bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-500 dark:bg-slate-900 dark:focus-visible:outline-sky-400"
        >
          {text.link}
        </a>
        <Button variant="ghost" onClick={handleCopy}>
          {text.copy}
        </Button>
      </div>
      <p id={hintId} className="text-xs text-slate-600 dark:text-slate-400">
        {text.dragHint} {text.note}
      </p>
      <p
        role="status"
        className="text-sm text-emerald-800 dark:text-emerald-300"
      >
        {copyStatus}
      </p>
    </section>
  );
}
