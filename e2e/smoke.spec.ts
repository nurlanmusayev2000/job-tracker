import { expect, test } from "@playwright/test";

import { messages } from "../src/messages";

test("the exported site loads under the GitHub Pages base path", async ({
  page,
}) => {
  // Collect every request that fails, for example a stylesheet or script
  // whose URL is missing the base path.
  const failedRequests: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("./");

  await expect(page).toHaveTitle(messages.app.name);
  await expect(
    page.getByRole("heading", { level: 1, name: messages.app.name }),
  ).toBeVisible();
  expect(failedRequests).toEqual([]);
});
