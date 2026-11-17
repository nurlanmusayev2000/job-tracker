import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";
import { renderApp } from "@/test/renderApp";

import { JobsPage } from "./JobsPage";

const fields = messages.dialog.fields;
const saved = makeJob({
  id: "a",
  title: "Frontend Developer",
  company: "Acme",
  status: "applied",
  url: "https://jobs.example.com/42",
});

describe("the bookmarklet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the add dialog with the posting's link and title", async () => {
    const link = "https://jobs.example.com/99";
    window.history.replaceState(
      null,
      "",
      `/?add=${encodeURIComponent(link)}&title=${encodeURIComponent("UI Developer")}`,
    );
    const { user } = renderApp(<JobsPage />, { jobs: [saved] });

    const dialog = await screen.findByRole("dialog", {
      name: messages.dialog.addTitle,
    });
    expect(within(dialog).getByLabelText(fields.url)).toHaveValue(link);
    expect(within(dialog).getByLabelText(fields.title)).toHaveValue(
      "UI Developer",
    );

    await user.type(within(dialog).getByLabelText(fields.company), "Globex");
    await user.click(
      within(dialog).getByRole("button", { name: messages.dialog.save }),
    );

    // Saved, and the request is gone from the URL so a reload does not reopen it.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", {
        name: messages.list.edit("UI Developer"),
      }),
    ).toBeVisible();
    expect(window.location.search).toBe("");
  });

  it("offers the bookmark as a link to drag and as code to copy", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: [saved] });

    const link = await screen.findByText(messages.quickAdd.link);
    expect(link.getAttribute("href")).toMatch(/^javascript:/);
    expect(link.getAttribute("href")).toContain(
      `"${window.location.origin}/?add="`,
    );

    await user.click(
      screen.getByRole("button", { name: messages.quickAdd.copy }),
    );
    // userEvent gives each test its own clipboard, so it can be read back.
    expect(await navigator.clipboard.readText()).toBe(
      link.getAttribute("href"),
    );
    expect(screen.getByText(messages.quickAdd.copied)).toBeVisible();
  });
});

describe("the duplicate warning", () => {
  const warning = messages.dialog.duplicate(
    "Frontend Developer at Acme",
    messages.stages.applied,
  );

  it("warns when a new vacancy has the same title and company, but still saves it", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: [saved] });

    await user.click(
      await screen.findByRole("button", { name: messages.list.add }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(fields.title),
      "frontend developer",
    );
    expect(within(dialog).queryByText(warning)).not.toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(fields.company), "ACME");

    expect(within(dialog).getByText(warning)).toBeVisible();

    await user.click(
      within(dialog).getByRole("button", { name: messages.dialog.save }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("warns when the link is already saved", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: [saved] });

    await user.click(
      await screen.findByRole("button", { name: messages.list.add }),
    );
    await user.type(
      screen.getByLabelText(fields.url),
      "https://jobs.example.com/42/",
    );

    expect(screen.getByText(warning)).toBeVisible();
  });

  it("does not warn about the vacancy being edited", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: [saved] });

    await user.click(
      await screen.findByRole("button", {
        name: messages.list.edit("Frontend Developer"),
      }),
    );
    expect(
      screen.getByRole("dialog", { name: messages.dialog.editTitle }),
    ).toBeVisible();
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
  });
});
