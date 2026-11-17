import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { makeJob } from "@/test/factories";
import { renderApp } from "@/test/renderApp";

import { JobsPage } from "./JobsPage";

// renderApp treats Tuesday 17 November 2026 as today.
const jobs = [
  makeJob({
    id: "designer",
    title: "Product Designer",
    company: "Globex",
    status: "saved",
    deadline: "2026-11-18",
    createdAt: "2026-11-03T09:00:00.000Z",
  }),
  makeJob({
    id: "frontend",
    title: "Frontend Developer",
    company: "Acme",
    location: "Berlin",
    status: "applied",
    appliedOn: "2026-11-05",
    createdAt: "2026-11-05T09:00:00.000Z",
  }),
  makeJob({
    id: "react",
    title: "React Engineer",
    company: "Northwind",
    status: "interview",
    appliedOn: "2026-11-16",
    nextStep: "Prepare the take-home task",
    nextOn: "2026-11-30",
    createdAt: "2026-11-10T09:00:00.000Z",
  }),
];

const vacancyList = () =>
  screen.findByRole("list", { name: messages.list.heading });

async function namesInList() {
  const rows = within(await vacancyList()).getAllByRole("listitem");
  return rows.map((row) => within(row).getByRole("heading").textContent);
}

/** The button for a pipeline stop, found by its stage and count. */
const stop = (stage: string, count: number) =>
  screen.getByRole("button", { name: messages.pipeline.count(count, stage) });

describe("JobsPage overview", () => {
  it("shows the summary line", async () => {
    renderApp(<JobsPage />, { jobs });
    expect(await screen.findByText(messages.summary(3, 1))).toBeVisible();
  });

  it("shows a count for every stage on the pipeline", async () => {
    renderApp(<JobsPage />, { jobs });
    await vacancyList();

    expect(stop(messages.stages.saved, 1)).toBeVisible();
    expect(stop(messages.stages.applied, 1)).toBeVisible();
    expect(stop(messages.stages.interview, 1)).toBeVisible();
    expect(stop(messages.stages.offer, 0)).toBeVisible();
    expect(stop(messages.stages.closed, 0)).toBeVisible();
  });

  it("filters the list by clicking a stop, and shows everything on a second click", async () => {
    const { user } = renderApp(<JobsPage />, { jobs });
    await vacancyList();

    await user.click(stop(messages.stages.applied, 1));
    expect(stop(messages.stages.applied, 1)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await namesInList()).toEqual(["Frontend Developer"]);
    expect(window.location.search).toBe("?stage=applied");

    await user.click(stop(messages.stages.applied, 1));
    expect(await namesInList()).toHaveLength(3);
    expect(window.location.search).toBe("");
  });

  it("searches, shows the count and clears the search", async () => {
    const { user } = renderApp(<JobsPage />, { jobs });
    await vacancyList();

    await user.type(screen.getByLabelText(messages.list.search), "berlin");

    expect(await namesInList()).toEqual(["Frontend Developer"]);
    expect(screen.getByRole("status")).toHaveTextContent(
      messages.list.showing(1, 3),
    );
    expect(window.location.search).toBe("?q=berlin");

    await user.click(
      screen.getByRole("button", { name: messages.list.clearFilters }),
    );
    expect(await namesInList()).toHaveLength(3);
    expect(screen.getByLabelText(messages.list.search)).toHaveValue("");
  });

  it("says so when nothing matches", async () => {
    const { user } = renderApp(<JobsPage />, { jobs });
    await vacancyList();

    await user.type(
      screen.getByLabelText(messages.list.search),
      "nothing like this",
    );
    expect(screen.getByText(messages.list.noMatches)).toBeVisible();
  });

  it("sorts by company", async () => {
    const { user } = renderApp(<JobsPage />, { jobs });
    expect(await namesInList()).toEqual([
      "React Engineer",
      "Frontend Developer",
      "Product Designer",
    ]);

    await user.selectOptions(
      screen.getByLabelText(messages.list.sort),
      messages.list.sortOrders.company,
    );

    expect(await namesInList()).toEqual([
      "Frontend Developer",
      "Product Designer",
      "React Engineer",
    ]);
    expect(window.location.search).toBe("?sort=company");
  });

  it("restores the search, sort and stage filter from the URL", async () => {
    window.history.replaceState(null, "", "/?q=e&sort=company&stage=interview");
    renderApp(<JobsPage />, { jobs });

    expect(await namesInList()).toEqual(["React Engineer"]);
    expect(screen.getByLabelText(messages.list.search)).toHaveValue("e");
    expect(screen.getByLabelText(messages.list.sort)).toHaveValue("company");
  });

  it("opens the vacancy named in the URL, and removes it from the URL on close", async () => {
    window.history.replaceState(null, "", "/?job=react");
    const { user } = renderApp(<JobsPage />, { jobs });

    const dialog = await screen.findByRole("dialog", {
      name: messages.dialog.editTitle,
    });
    expect(
      within(dialog).getByLabelText(messages.dialog.fields.title),
    ).toHaveValue("React Engineer");

    await user.click(
      within(dialog).getByRole("button", { name: messages.dialog.cancel }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("puts the open vacancy in the URL", async () => {
    const { user } = renderApp(<JobsPage />, { jobs });

    await user.click(
      within(await vacancyList()).getByRole("button", {
        name: messages.list.edit("Frontend Developer"),
      }),
    );
    expect(window.location.search).toBe("?job=frontend");
  });

  describe("Next up", () => {
    it("lists what needs attention, most urgent first", async () => {
      renderApp(<JobsPage />, { jobs });

      const section = await screen.findByRole("region", {
        name: messages.nextUp.heading,
      });
      const items = within(section).getAllByRole("listitem");

      // The application from 5 November (12 days ago) is older than tomorrow's deadline.
      expect(items[0]).toHaveTextContent("Frontend Developer");
      expect(items[0]).toHaveTextContent(messages.nextUp.noReply(-12));
      expect(items[1]).toHaveTextContent("Product Designer");
      expect(items[1]).toHaveTextContent(messages.nextUp.deadlineSoon(1));
      // React Engineer's next step is 13 days away, so it is not here.
      expect(items).toHaveLength(2);
    });

    it("runs a quick action and updates the vacancy", async () => {
      const { user } = renderApp(<JobsPage />, { jobs });
      const section = await screen.findByRole("region", {
        name: messages.nextUp.heading,
      });

      await user.click(
        within(section).getByRole("button", {
          name: messages.nextUp.actionLabel(
            messages.nextUp.actions.markApplied,
            "Product Designer",
          ),
        }),
      );

      // Product Designer is now applied, with a follow-up in a week.
      expect(stop(messages.stages.applied, 2)).toBeVisible();
      const row = within(await vacancyList())
        .getByRole("button", { name: messages.list.edit("Product Designer") })
        .closest("li");
      expect(row).toHaveTextContent(
        `${messages.jobs.followUpStep} on 24 Nov 2026`,
      );
      expect(within(section).getAllByRole("listitem")).toHaveLength(1);
    });

    it("says when nothing is due", async () => {
      renderApp(<JobsPage />, { jobs: [jobs[2]] });
      expect(await screen.findByText(messages.nextUp.empty)).toBeVisible();
    });
  });
});
