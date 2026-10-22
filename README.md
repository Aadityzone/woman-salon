# Maison Belle — Luxury Salon Website & Booking

A premium Next.js salon website with a MongoDB-backed appointment flow, protected owner dashboard, service management, and Playwright checks.

> **Pre-launch notice:** Maison Belle branding, service prices/durations, images, reviews, address, phone, opening hours, staff and policies are still illustrative or starter defaults. Confirm them with the salon owner before accepting real customers.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS v4, GSAP + ScrollTrigger, Motion, Lucide
- MongoDB + Mongoose
- Zod request validation
- bcryptjs password-hash verification and jose-signed HTTP-only owner session
- Playwright E2E tests and GitHub Actions quality workflow

## Routes

- `/` — premium salon homepage with animated Hair, Skin, Nails, and Makeup category menus; service links preselect the chosen treatment on the booking page
- `/book` — customer appointment booking with preferred stylist selection and stylist-specific availability
- `/admin` — owner sign-in and appointment dashboard
- `/admin/services` — protected service catalogue management
- `/api/health` — MongoDB connectivity check
- `/api/services` — active salon services
- `/api/availability?serviceId=<id>&date=YYYY-MM-DD&staffId=any|team-1|team-2` — available times for any stylist or a selected team member
- `POST /api/appointments` — create an appointment with unique staff/15-minute slot reservations; optionally posts confirmed bookings to `OWNER_NOTIFICATION_WEBHOOK`

## Run locally

Requirements: Node.js 20.9+ recommended and a MongoDB Atlas cluster or local MongoDB.

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI`, `OWNER_EMAIL`, `OWNER_PASSWORD_HASH`, `OWNER_SESSION_SECRET`, `SALON_OPEN_TIME`, `SALON_CLOSE_TIME`, and the `NEXT_PUBLIC_SALON_*` values.
3. Generate an owner password hash:
   ```powershell
   node -e "require('bcryptjs').hash('REPLACE_WITH_A_STRONG_PASSWORD', 12).then(console.log)"
   ```
   Put the printed hash in `OWNER_PASSWORD_HASH`; never store the plain password in the repo.
4. Install and seed the starter service menu:
   ```powershell
   npm install
   npm run seed
   npm run dev
   ```
5. Open http://localhost:3000, then test `/book`, `/admin`, and `/api/health`.

See [Booking & Deployment](docs/BOOKING_AND_DEPLOYMENT.md) for MongoDB Atlas and Vercel Preview setup.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright needs the configured Chromium and WebKit browsers installed. The GitHub Actions workflow runs the test suite against a disposable MongoDB service, including a concurrent-booking capacity test.

## Booking protection

Bookings use Asia/Kolkata time and configurable salon opening hours. Stylist names, working days, and individual shift hours can be configured with `SALON_STAFF_1_*` and `SALON_STAFF_2_*` variables (days are comma-separated `Mon,Tue,Wed,Thu,Fri,Sat,Sun`). Availability and booking creation both enforce those shifts and the selected service duration, then reserve 15-minute blocks for one of two staff IDs. A unique compound index on `staffId + slotStart` prevents concurrent requests from reserving the same staff slot; requests that cannot reserve every required block return HTTP 409. Owner cancellation releases the reserved blocks.

## Before production

- Replace all starter service names/prices/durations and confirm real business hours.
- Set the real public salon name/contact/address and approved/licensed images.
- Set production MongoDB Atlas credentials and Vercel environment variables separately from development. Configure `OWNER_NOTIFICATION_WEBHOOK` with a trusted endpoint if the owner needs server-to-server booking alerts; leave it blank to disable external notifications.
- Configure the real stylist names, working days, and shift hours using the `SALON_STAFF_1_*` / `SALON_STAFF_2_*` environment variables. Add staff profile photos/bios, blocked dates, customer cancellation, a tested notification provider, rate limiting, audit logs, monitoring/backups, and privacy/cancellation policies.
- Run all quality checks on the latest commit and test with the owner before launch.

## Motion direction

GSAP owns scroll-driven reveals, parallax and the pinned chapter sequence. Motion owns component-level entrance and hover interactions. Do not animate the same element with both libraries. Respect `prefers-reduced-motion`, keep primary actions immediately available, and verify fast-scroll, reverse-scroll and mobile behavior.
