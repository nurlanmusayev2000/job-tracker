import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { STORAGE_KEY } from "@/jobs/localStorageRepository";
import { CURRENT_VERSION } from "@/jobs/storedData";
import { messages } from "@/messages";
import { makeJob } from "@/test/factories";
import { renderApp } from "@/test/renderApp";

import { JobsPage } from "./JobsPage";

const text = messages.data;
const saved = [makeJob({ id: "a", title: "Designer" })];

/** A JSON file as the browser would give it to the file input. */
function jsonFile(content: unknown) {
  const body = typeof content === "string" ? content : JSON.stringify(content);
  return new File([body], "backup.json", { type: "application/json" });
}

describe("Your data", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports every vacancy as a dated JSON file", async () => {
    // Catch the file the app hands to the browser instead of downloading it.
    let blob: Blob | undefined;
    vi.spyOn(URL, "createObjectURL").mockImplementation((value) => {
      blob = value as Blob;
      return "blob:export";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const { user } = renderApp(<JobsPage />, { jobs: saved });
    await user.click(await screen.findByRole("button", { name: text.export }));

    const link = click.mock.instances[0] as HTMLAnchorElement;
    expect(link.download).toBe("job-search-tracker-2026-11-17.json");
    expect(JSON.parse(await blob!.text())).toEqual({
      version: CURRENT_VERSION,
      jobs: saved,
    });
  });

  it("imports a file after you confirm, replacing the saved vacancies", async () => {
    const imported = [
      makeJob({ id: "x", title: "Frontend Developer" }),
      makeJob({ id: "y", title: "React Engineer" }),
    ];
    const { user, storage } = renderApp(<JobsPage />, { jobs: saved });
    await screen.findByText("Designer");

    await user.upload(
      screen.getByTestId("import-file"),
      jsonFile({ version: CURRENT_VERSION, jobs: imported }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: text.confirmTitle,
    });
    expect(dialog).toHaveTextContent(text.confirmText(2, 1));
    await user.click(
      within(dialog).getByRole("button", { name: text.confirmImport }),
    );

    expect(await screen.findByText(text.imported(2))).toBeVisible();
    expect(screen.getByText("React Engineer")).toBeVisible();
    expect(screen.queryByText("Designer")).not.toBeInTheDocument();
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? "").jobs).toEqual(
      imported,
    );
  });

  it("keeps the saved vacancies when you cancel", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: saved });
    await screen.findByText("Designer");

    await user.upload(
      screen.getByTestId("import-file"),
      jsonFile([makeJob({ id: "z" })]),
    );
    await user.click(await screen.findByRole("button", { name: text.cancel }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeVisible();
  });

  it("explains why a bad file cannot be imported, and changes nothing", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: saved });
    await screen.findByText("Designer");

    await user.upload(
      screen.getByTestId("import-file"),
      jsonFile("{ not json"),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      text.importFailed(messages.errors.notJson),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeVisible();
  });

  it("names the vacancy and field that is wrong", async () => {
    const { user } = renderApp(<JobsPage />, { jobs: saved });
    await screen.findByText("Designer");

    const file = jsonFile({
      version: CURRENT_VERSION,
      jobs: [
        makeJob({ id: "a" }),
        { ...makeJob({ id: "b" }), status: "ghosted" },
      ],
    });
    await user.upload(screen.getByTestId("import-file"), file);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      'Vacancy 2, field "status"',
    );
  });
});
