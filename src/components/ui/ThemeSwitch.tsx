"use client";

import { THEME_CHOICES } from "@/lib/theme";
import { useTheme } from "@/lib/useTheme";
import { messages } from "@/messages";

/**
 * Three buttons in a row: System, Light and Dark. They are radio buttons,
 * so the arrow keys move between them and screen readers say which one is
 * chosen.
 */
export function ThemeSwitch() {
  const [choice, setChoice] = useTheme();

  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{messages.theme.label}</legend>
      <span
        aria-hidden="true"
        className="text-sm text-slate-600 dark:text-slate-400"
      >
        {messages.theme.label}
      </span>
      <div className="flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
        {THEME_CHOICES.map((option) => (
          <label
            key={option}
            className="cursor-pointer rounded-md px-2.5 py-1.5 text-sm has-checked:bg-slate-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-sky-600 dark:has-checked:bg-slate-100 dark:has-checked:text-slate-900 dark:has-focus-visible:outline-sky-400"
          >
            <input
              type="radio"
              name="theme"
              value={option}
              checked={choice === option}
              onChange={() => setChoice(option)}
              className="sr-only"
            />
            {messages.theme[option]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
