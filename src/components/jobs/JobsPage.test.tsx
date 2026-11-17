import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { JobRepository } from "@/jobs/repository";
import { messages } from "@/messages";
import { makeJob } from "@/test/factories";
import { renderApp } from "@/test/renderApp";

import { JobsPage } from "./JobsPage";

const text = messages.dialog;

/** Waits for the list to load, then returns the list of vacancies. */
async function findList() {
  return screen.findByRole("list");
}

describe("JobsPage", () => {
  it("shows a loading skeleton, then the empty state", async () => {
    renderApp(<JobsPage />);

    expect(screen.getByText(messages.list.loading)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: messages.list.emptyTitle }),
    ).toBeVisible();
  });

  it("lets you add a vacancy, move it to Applied and see the follow-up", async () => {
    const { user } = renderApp(<JobsPage />);
    await screen.findByText(messages.list.emptyTitle);

    // Add a vacancy.
    await user.click(screen.getByRole("button", { name: messages.list.add }));
    const dialog = screen.getByRole("dialog", { name: text.addTitle });
    await user.type(
      within(dialog).getByLabelText(text.fields.title),
      "Frontend Developer",
    );
    await user.type(within(dialog).getByLabelText(text.fields.company), "Acme");
    await user.click(within(dialog).getByRole("button", { name: text.save }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const row = within(await findList()).getByRole("listitem");
    expect(within(row).getByText("Frontend Developer")).toBeVisible();
    expect(within(row).getByText("Acme")).toBeVisible();

    // Move it to Applied from the row.
    await user.selectOptions(
      within(row).getByLabelText(
        messages.list.stageLabel("Frontend Developer"),
      ),
      messages.stages.applied,
    );

    // The follow-up is planned a week after today, 17 November 2026.
    expect(
      await within(row).findByText(
        `${messages.jobs.followUpStep} on 24 Nov 2026`,
      ),
    ).toBeVisible();
    expect(within(row).getByText("Applied 17 Nov 2026")).toBeVisible();
  });

  it("asks for a title or a company and keeps the dialog open", async () => {
    const { user } = renderApp(<JobsPage />);
    await screen.findByText(messages.list.emptyTitle);

    await user.click(screen.getByRole("button", { name: messages.list.add }));
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(text.fields.url),
      "jobs.example.com",
    );
    await user.click(within(dialog).getByRole("button", { name: text.save }));

    const title = within(dialog).getByLabelText(text.fields.title);
    expect(title).toHaveAccessibleDescription(
      messages.validation.titleOrCompany,
    );
    expect(title).toHaveFocus();
    expect(
      within(dialog).getByLabelText(text.fields.url),
    ).toHaveAccessibleDescription(messages.validation.link);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("edits a vacancy", async () => {
    const job = makeJob({ title: "Designer", company: "Acme" });
    const { user } = renderApp(<JobsPage />, { jobs: [job] });

    await user.click(
      await screen.findByRole("button", {
        name: messages.list.edit("Designer"),
      }),
    );
    const dialog = screen.getByRole("dialog", { name: text.editTitle });
    const title = within(dialog).getByLabelText(text.fields.title);
    expect(title).toHaveValue("Designer");

    await user.clear(title);
    await user.type(title, "Product Designer");
    await user.selectOptions(
      within(dialog).getByLabelText(text.fields.status),
      messages.stages.interview,
    );
    await user.click(within(dialog).getByRole("button", { name: text.save }));

    const row = within(await findList()).getByRole("listitem");
    expect(within(row).getByText("Product Designer")).toBeVisible();
    expect(
      within(row).getByLabelText(messages.list.stageLabel("Product Designer")),
    ).toHaveValue("interview");
  });

  it("closes the dialog without saving when you cancel", async () => {
    const job = makeJob({ title: "Designer" });
    const { user } = renderApp(<JobsPage />, { jobs: [job] });

    await user.click(
      await screen.findByRole("button", {
        name: messages.list.edit("Designer"),
      }),
    );
    await user.type(screen.getByLabelText(text.fields.title), " (draft)");
    await user.click(screen.getByRole("button", { name: text.cancel }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeVisible();
  });

  it("deletes a vacancy only after you confirm", async () => {
    const job = makeJob({ title: "Designer" });
    const { user } = renderApp(<JobsPage />, { jobs: [job] });

    await user.click(
      await screen.findByRole("button", {
        name: messages.list.edit("Designer"),
      }),
    );
    await user.click(screen.getByRole("button", { name: text.delete }));
    expect(screen.getByText(text.confirmDelete)).toBeVisible();

    // "Keep it" goes back without deleting.
    await user.click(
      screen.getByRole("button", { name: text.confirmDeleteNo }),
    );
    expect(screen.queryByText(text.confirmDelete)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: text.delete }));
    await user.click(
      screen.getByRole("button", { name: text.confirmDeleteYes }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByText(messages.list.emptyTitle)).toBeVisible();
  });

  it("lists the newest vacancy first", async () => {
    const jobs = [
      makeJob({
        id: "a",
        title: "Older",
        createdAt: "2026-11-01T09:00:00.000Z",
      }),
      makeJob({
        id: "b",
        title: "Newer",
        createdAt: "2026-11-10T09:00:00.000Z",
      }),
    ];
    renderApp(<JobsPage />, { jobs });

    const rows = within(await findList()).getAllByRole("listitem");
    expect(
      rows.map((row) => within(row).getByRole("heading").textContent),
    ).toEqual(["Newer", "Older"]);
  });

  it("shows a clear message when saved data cannot be read", async () => {
    renderApp(<JobsPage />, { storedText: "{broken" });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      messages.errors.notJson,
    );
    expect(
      screen.getByRole("button", { name: messages.list.add }),
    ).toBeDisabled();
  });

  it("shows an error in the dialog when saving fails", async () => {
    const failing: JobRepository = {
      list: async () => [],
      create: async () => {
        throw new Error("QuotaExceededError");
      },
      update: async () => {
        throw new Error("unused");
      },
      remove: async () => {},
      replaceAll: async () => {},
    };
    const { user } = renderApp(<JobsPage />, { repository: failing });
    await screen.findByText(messages.list.emptyTitle);

    await user.click(screen.getByRole("button", { name: messages.list.add }));
    await user.type(screen.getByLabelText(text.fields.title), "Designer");
    await user.click(screen.getByRole("button", { name: text.save }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      messages.errors.saveFailed,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
