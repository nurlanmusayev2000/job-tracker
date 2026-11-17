import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { messages } from "@/messages";

import HomePage from "./page";

describe("HomePage", () => {
  it("shows the app name as the main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: messages.app.name }),
    ).toBeVisible();
  });
});
