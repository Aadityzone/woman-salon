import { expect, test } from "@playwright/test";

test("homepage renders key sections and primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /explore services/i }).first()).toBeVisible();
  await expect(page.locator("#services")).toBeAttached();
  await expect(page.locator("#rituals")).toBeAttached();
  await expect(page.locator("#gallery")).toBeAttached();
  await expect(page.locator("#about")).toBeAttached();
  await expect(page.locator("#visit")).toBeAttached();
});

test("navigation anchors move to their sections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Gallery", exact: true }).first().click();
  await expect(page).toHaveURL(/#gallery$/);
  await expect(page.locator("#gallery")).toBeAttached();
});

test("mobile navigation opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: /open navigation menu/i });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.getByRole("navigation", { name: /mobile navigation/i })).toBeVisible();
  await page.getByRole("navigation", { name: /mobile navigation/i }).getByRole("link", { name: "Gallery" }).click();
  await expect(page).toHaveURL(/#gallery$/);
  await expect(page.getByRole("navigation", { name: /mobile navigation/i })).toHaveCount(0);
});

test("page has no horizontal overflow at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
});

test("service categories switch the translucent menu in place", async ({ page }) => {
  await page.goto("/#services");
  await page.getByRole("button", { name: /view all services/i }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: /signature haircut/i })).toBeVisible();
  await page.getByRole("tab", { name: /nails/i }).click();
  await expect(page.getByRole("tab", { name: /nails/i })).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("heading", { name: /classic manicure/i })).toBeVisible();
  await expect(panel.getByRole("heading", { name: /signature haircut/i })).toHaveCount(0);
  await page.getByRole("tab", { name: /makeup/i }).click();
  await expect(panel.getByRole("heading", { name: /soft glam/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /book party makeup/i })).toHaveAttribute("href", /category=Makeup.*service=Party/);
});

test("service menu booking link preselects the requested service", async ({ page }) => {
  // Start at the service explorer so scroll-triggered/pinned sections cannot
  // leave the category controls outside the viewport during this interaction.
  await page.goto("/#services");
  await page.getByRole("button", { name: /view all services/i }).click();
  await expect(page.getByRole("tab", { name: /makeup/i })).toBeVisible();
  await page.getByRole("tab", { name: /makeup/i }).click();
  const makeupPanel = page.getByRole("tabpanel");
  await expect(makeupPanel.getByText("Party makeup", { exact: true })).toBeVisible();
  const bookingLink = makeupPanel.locator('a[aria-label="Book Party makeup"]');
  await expect(bookingLink).toBeVisible();
  await bookingLink.click();
  await expect(page).toHaveURL(/\/book\?category=Makeup&service=Party/);
  await expect(page.getByRole("heading", { name: /party makeup/i })).toBeVisible();
  await expect(page.getByText(/₹2,999 · 75 min/)).toBeVisible();
});
