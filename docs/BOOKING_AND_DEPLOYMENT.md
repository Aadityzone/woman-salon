# Booking, Owner Dashboard & Deployment

## Implemented

- MongoDB/Mongoose connection helper with a cached connection for Next.js serverless reuse.
- Service model and read API; initial service records are inserted on first read when the collection is empty.
- Appointment model and 15-minute slot-reservation collection with a unique compound index on `staffId + slotStart`.
- Availability API: `GET /api/availability?serviceId=<id>&date=YYYY-MM-DD`.
- Booking API: `POST /api/appointments`. It validates the payload, checks salon hours (10:00–19:00 Asia/Kolkata), and reserves all required 15-minute slots. If a competing booking wins any slot, partial reservations are removed and the request returns HTTP 409.
- Owner login with bcrypt password-hash verification and an HTTP-only, same-site JWT cookie.
- Protected owner appointments API with status updates; cancellation releases reserved slots.
- Owner service management at `/admin/services` for editing service names, categories, descriptions, prices, durations, and booking visibility.
- Customer booking page at `/book` and owner dashboard/login at `/admin`.

## Local setup

1. Create a MongoDB Atlas cluster and database named `maison_belle`.
2. Create a database user with only the permissions required for this database, and configure Atlas Network Access for your development IP. Do not use `0.0.0.0/0` for a production database unless you have deliberately assessed the exposure.
3. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI`, `OWNER_EMAIL`, `OWNER_PASSWORD_HASH`, and `OWNER_SESSION_SECRET`. Never commit `.env.local`.
4. Generate a bcrypt password hash in the project terminal:
   ```powershell
   node -e "require('bcryptjs').hash('REPLACE_WITH_A_STRONG_PASSWORD', 12).then(console.log)"
   ```
   Put the printed hash in `OWNER_PASSWORD_HASH`; do not put the plain password in the environment file.
5. Install and run:
   ```powershell
   npm install
   npm run seed
   npm run dev
   ```
6. Check `http://localhost:3000/api/health`, then visit `/book` and `/admin`.

## API summary

- `GET /api/health`: database connectivity check; does not reveal connection details.
- `GET /api/services`: active services.
- `GET /api/availability?serviceId=...&date=YYYY-MM-DD`: available 15-minute start times.
- `POST /api/appointments`: create a booking. Requires `serviceId`, `date`, `time`, `customerName`, and `customerPhone`; email and notes are optional.
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`: owner session.
- `GET /api/admin/appointments`: protected appointment list.
- `PATCH /api/admin/appointments?id=...`: protected status transition from `confirmed` to `cancelled` or `completed`; terminal appointments cannot be changed again.

## Deployment checklist

- Deploy the feature branch as a Vercel Preview first. Add environment variables in the Vercel project settings; do not commit real secrets.
- Use a production MongoDB database/user distinct from development. Restrict network access and grant least privilege.
- Configure a random `OWNER_SESSION_SECRET` of at least 32 characters, a verified owner email, and a bcrypt password hash.
- Replace illustrative service prices/durations, testimonials, opening hours, salon address, phone/WhatsApp, images, and policies with owner-approved details.
- Verify business timezone and hours with the owner. Booking uses Asia/Kolkata and configurable `SALON_OPEN_TIME` / `SALON_CLOSE_TIME` values (defaults: 10:00–19:00). The current time-zone offset is India Standard Time (+05:30).
- Configure backups, MongoDB monitoring, error logging, privacy/retention policy, cancellation policy, and a contact method before public launch.
- Run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e` after installing dependencies and browsers.
- Run a concurrent booking test against a real test database before accepting real customer bookings.

## Known limitations / follow-up

- Staff are currently represented by two internal IDs (`team-1`, `team-2`), not a staff-management collection. Service prices and hours are starter defaults, not owner-approved data.
- Owner dashboard currently supports viewing appointments and changing status. Editing service catalog, staff, schedules, and blocked dates still needs to be implemented.
- Confirmation is shown on the website only. Email/WhatsApp notifications, cancellation links for customers, rate limiting, audit logs, and privacy/legal copy are not yet implemented.
- Slot uniqueness prevents two active reservations for the same staff member and 15-minute slot. For production hardening, add explicit integration tests for concurrent requests, idempotency keys, and robust retry/rollback behavior.
- Do not advertise the site as production-ready until environment setup and all checks above have been completed.
