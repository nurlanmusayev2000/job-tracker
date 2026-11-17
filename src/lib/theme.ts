/**
 * The color theme. "system" follows the device's light or dark setting;
 * "light" and "dark" override it. The choice is saved in localStorage.
 */
export const THEME_CHOICES = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const THEME_STORAGE_KEY = "job-search-tracker-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** A saved value as a theme choice. Anything unknown means "system". */
export function parseThemeChoice(value: string | null): ThemeChoice {
  return THEME_CHOICES.find((choice) => choice === value) ?? "system";
}

/** True if the page should be dark for this choice. */
export function isDarkTheme(
  choice: ThemeChoice,
  systemIsDark: boolean,
): boolean {
  return choice === "dark" || (choice === "system" && systemIsDark);
}

/** True if the device is set to dark mode. */
function systemIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

/** Calls `listener` when the device switches between light and dark. */
export function onSystemThemeChange(listener: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Adds or removes the "dark" class on <html>, which turns on the dark styles. */
export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.classList.toggle(
    "dark",
    isDarkTheme(choice, systemIsDark()),
  );
}

/**
 * The same steps as applyTheme, as a script that layout.tsx puts in <head>.
 * It runs before React and before the page is drawn, so a dark page never
 * flashes white while it loads. It cannot import anything, so it repeats the
 * rule from isDarkTheme; a test checks that the two agree.
 */
export const themeScript = `(function () {
  try {
    var choice = localStorage.getItem("${THEME_STORAGE_KEY}");
    var dark = choice === "dark" ||
      (choice !== "light" && window.matchMedia("${DARK_QUERY}").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (error) {}
})();`;
