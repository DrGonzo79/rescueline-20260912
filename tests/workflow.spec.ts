import { expect, test } from "@playwright/test";

test("analyzes the queue and completes the highest-priority callback", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Your bot missed it/i })).toBeVisible();
  await page.getByRole("button", { name: "Analyze missed calls" }).click();
  await expect(page.getByRole("status")).toContainText("4 recoverable calls");
  await expect(page.getByText("Maya R.", { exact: true })).toBeVisible();
  await expect(page.getByText("Emergency language detected")).toBeVisible();
  await page.getByRole("button", { name: "Mark demo action complete" }).click();
  await expect(page.getByRole("button", { name: "Resolved in this demo" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Needs rescue/ })).toContainText("3");
});

test("filters handled calls and shows their no-action decision", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Bot handled/ }).click();
  await expect(page.getByRole("button", { name: /Jordan K./ })).toBeVisible();
  await page.getByRole("button", { name: /Jordan K./ }).click();
  await expect(page.getByText("No human follow-up")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark demo action complete" })).toBeDisabled();
});

test("validates and triages a manually entered demo call", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ Add demo call" }).click();
  await page.getByRole("button", { name: "Triage demo call →" }).click();
  await expect(page.locator(".error")).toContainText("Caller name");
  await page.getByLabel("Caller name").fill("Jamie R.");
  await page.getByLabel("Callback number").fill("(555) 010-2323");
  await page.getByLabel("Call summary").fill("Caller sounded frustrated and needs a quote today.");
  await page.getByLabel("Caller sentiment").selectOption("frustrated");
  await page.getByRole("button", { name: "Triage demo call →" }).click();
  await expect(page.getByRole("button", { name: /Jamie R./ })).toBeVisible();
  await expect(page.getByText("Caller frustration detected")).toBeVisible();
  await expect(page.getByText("Quote intent captured")).toBeVisible();
});

test("has no horizontal overflow on mobile through primary workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-only overflow assertion");
  await page.goto("/");
  const before = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(before[0]).toBeLessThanOrEqual(before[1] + 1);
  await page.getByRole("button", { name: "Analyze missed calls" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  const after = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(after[0]).toBeLessThanOrEqual(after[1] + 1);
});
