import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isDarkTheme,
  parseThemeChoice,
  THEME_CHOICES,
  THEME_STORAGE_KEY,
  themeScript,
} from "./theme";

describe("parseThemeChoice", () => {
  it("reads a saved choice, and falls back to the system setting", () => {
    expect(parseThemeChoice("dark")).toBe("dark");
    expect(parseThemeChoice("light")).toBe("light");
    expect(parseThemeChoice(null)).toBe("system");
    expect(parseThemeChoice("purple")).toBe("system");
  });
});

describe("isDarkTheme", () => {
  it("follows the device for System, and overrides it otherwise", () => {
    expect(isDarkTheme("system", true)).toBe(true);
    expect(isDarkTheme("system", false)).toBe(false);
    expect(isDarkTheme("dark", false)).toBe(true);
    expect(isDarkTheme("light", true)).toBe(false);
  });
});

describe("themeScript", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
  });

  /** Runs the <head> script the way the browser does. */
  function runScript(saved: string | null, deviceIsDark: boolean) {
    if (saved !== null) localStorage.setItem(THEME_STORAGE_KEY, saved);
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: deviceIsDark,
    } as MediaQueryList);
    new Function(themeScript)();
    return document.documentElement.classList.contains("dark");
  }

  it("makes the same decision as isDarkTheme for every case", () => {
    for (const choice of THEME_CHOICES) {
      for (const deviceIsDark of [true, false]) {
        document.documentElement.classList.remove("dark");
        localStorage.clear();
        expect(runScript(choice, deviceIsDark)).toBe(
          isDarkTheme(choice, deviceIsDark),
        );
      }
    }
  });

  it("follows the device when nothing is saved", () => {
    expect(runScript(null, true)).toBe(true);
  });
});
