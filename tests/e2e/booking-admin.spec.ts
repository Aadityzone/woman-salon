import { expect, test } from "@playwright/test";

test("booking page presents the appointment flow", async ({ page }) => {
  await page.goto("/book");
  await expect(page.getByRole("heading", { name: /book your moment/i })).toBeVisible();
  await expect(page.getByLabel("Appointment date")).toBeVisible();
  await expect(page.getByLabel("Preferred stylist")).toBeVisible();
  await expect(page.getByRole("heading", { name: /almost yours/i })).toBeVisible();
});

test("owner dashboard requires authentication", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  const response = await request.get("/api/admin/appointments");
  expect(response.status()).toBe(401);
  const servicesResponse = await request.get("/api/admin/services");
  expect(servicesResponse.status()).toBe(401);
});

test("invalid appointment payload is rejected before database access", async ({ request }) => {
  const response = await request.post("/api/appointments", { data: { serviceId: "not-an-id" } });
  expect(response.status()).toBe(400);
  const invalidPhone = await request.post("/api/appointments", { data: {
    serviceId: "507f1f77bcf86cd799439011", date: "2030-01-02", time: "10:00",
    customerName: "Test Guest", customerPhone: "not-a-phone",
  } });
  expect(invalidPhone.status()).toBe(400);
});

test("concurrent bookings never exceed available staff capacity and owner can view them", async ({ page, request }, testInfo) => {
  test.skip(process.env.E2E_FULL_FLOW !== "1", "Requires the MongoDB-backed CI test environment.");
  const servicesResponse = await request.get("/api/services");
  expect(servicesResponse.ok()).toBeTruthy();
  const { services } = await servicesResponse.json();
  const service = services[0];
  expect(service).toBeTruthy();

  // Give each browser project and retry a separate future date so a failed
  // attempt cannot leave reservations that poison the next retry.
  const daysAhead = 2 + testInfo.retry + (testInfo.project.name.includes("mobile") ? 5 : 0);
  const future = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(future);
  const dateValues = Object.fromEntries(dateParts.map(part => [part.type, part.value]));
  const date = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;
  const time = testInfo.project.name.includes("mobile") ? "13:00" : "10:00";
  const payload = (index: number) => ({
    serviceId: service.id,
    date,
    time,
    customerName: `CI Guest ${testInfo.project.name} ${index}`,
    customerPhone: `+91990000${String(index).padStart(4, "0")}`,
    customerEmail: "",
    notes: "Automated Playwright integration test",
  });
  const results = await Promise.all([0, 1, 2].map(index =>
    request.post("/api/appointments", { data: payload(index) })
  ));
  expect(results.filter(r => r.status() === 201)).toHaveLength(2);
  expect(results.filter(r => r.status() === 409)).toHaveLength(1);

  await page.goto("/admin");
  await page.getByLabel("Owner email").fill(process.env.OWNER_EMAIL ?? "owner@example.com");
  await page.getByLabel("Password").fill("TestOwnerPass123!");
  await page.getByRole("button", { name: /sign in securely/i }).click();
  await expect(page.getByRole("heading", { name: /the appointment book/i })).toBeVisible();
  // Start a fresh authenticated dashboard session after the API writes finish.
  // This exercises the same reload path owners use when reopening the appointment book.
  await page.reload();
  const sessionAfterReload = await page.evaluate(async () => {
    const response = await fetch("/api/admin/me", { cache: "no-store" });
    return { status: response.status, body: await response.text(), url: window.location.href };
  });
  console.log("Owner session after dashboard reload:", sessionAfterReload);
  console.log("Headings after dashboard reload:", await page.locator("h1").allTextContents());
  await expect(page.getByRole("heading", { name: /the appointment book/i })).toBeVisible({ timeout: 15000 });
  const guestName = `CI Guest ${testInfo.project.name}`;
  // The database is shared by both browser projects and retries. Wait for this
  // project's booking specifically so another project's older booking cannot
  // satisfy the poll before the current appointment appears in the owner list.
  let guestBookingFound = false;
  // Poll without Playwright's newer expect.poll/toPass helpers so this test
  // remains compatible with the repository's installed Playwright typings.
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = await page.evaluate(async (expectedGuestName) => {
      const response = await fetch("/api/admin/appointments", { cache: "no-store" });
      if (!response.ok) return Number(response.status);
      const data = await response.json();
      return data.appointments?.some((appointment: { customerName: string }) =>
        appointment.customerName.startsWith(expectedGuestName)
      ) ? 200 : 202;
    }, guestName);
    if (result === 200) {
      guestBookingFound = true;
      break;
    }
    await page.waitForTimeout(500);
  }
  expect(guestBookingFound).toBe(true);
  // Wait for the rendered dashboard to catch up with the API-confirmed booking.
  // The refresh handler updates React state asynchronously, so a single click
  // followed by an immediate locator assertion can race on slower mobile WebKit.
  const refreshButton = page.getByRole("button", { name: /refresh/i });
  const bookingCard = page.locator("article").filter({ hasText: guestName }).filter({
    has: page.getByRole("button", { name: /cancel/i }),
  }).first();
  let renderedBookingFound = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await refreshButton.click();
    try {
      await expect(bookingCard).toBeVisible({ timeout: 1500 });
      renderedBookingFound = true;
      break;
    } catch {
      // Keep refreshing until the async dashboard request has rendered it.
    }
  }
  expect(renderedBookingFound).toBe(true);
  await bookingCard.getByRole("button", { name: /cancel/i }).click();
  const reopened = await request.post("/api/appointments", { data: payload(4) });
  expect(reopened.status()).toBe(201);
});
