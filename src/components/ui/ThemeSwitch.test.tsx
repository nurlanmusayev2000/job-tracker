import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/theme";
import { messages } from "@/messages";

import { ThemeSwitch } from "./ThemeSwitch";

const isDark = () => document.documentElement.classList.contains("dark");

describe("ThemeSwitch", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("follows the system by default", () => {
    render(<ThemeSwitch />);
    expect(
      screen.getByRole("radio", { name: messages.theme.system }),
    ).toBeChecked();
  });

  it("switches to dark and back, and remembers the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.click(screen.getByRole("radio", { name: messages.theme.dark }));
    expect(isDark()).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("radio", { name: messages.theme.light }));
    expect(isDark()).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("shows a saved choice", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeSwitch />);
    expect(
      screen.getByRole("radio", { name: messages.theme.dark }),
    ).toBeChecked();
  });

  it("can be used with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.tab();
    expect(
      screen.getByRole("radio", { name: messages.theme.system }),
    ).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("radio", { name: messages.theme.light }),
    ).toBeChecked();
  });
});
