import { expect, test } from "@playwright/test";

import { messages } from "../src/messages";

test("the exported site loads and keeps a vacancy after a reload", async ({
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

  // Add a vacancy with the dialog. This only works if the JavaScript loaded.
  await page.getByRole("button", { name: messages.list.add }).click();
  const dialog = page.getByRole("dialog", { name: messages.dialog.addTitle });
  await dialog
    .getByLabel(messages.dialog.fields.title)
    .fill("Frontend Developer");
  await dialog.getByRole("button", { name: messages.dialog.save }).click();
  await expect(dialog).toBeHidden();

  // It is saved in localStorage, so it is still there after a reload.
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: messages.list.edit("Frontend Developer"),
    }),
  ).toBeVisible();

  expect(failedRequests).toEqual([]);
});
