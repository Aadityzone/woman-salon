# Test plan

## Local setup
- [ ] npm install
- [ ] npm run typecheck
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run dev and open localhost:3000

## Playwright browser smoke test
- [ ] Homepage loads with hero content visible.
- [ ] Verify all navigation anchors (services, experience, gallery, about, visit).
- [ ] Open and close the mobile navigation; ensure its links navigate and menu closes.
- [ ] Verify WhatsApp links point to the configured number and open externally.
- [ ] Scroll down and back up across the pinned story; confirm chapter text/images synchronize and page does not get stuck.
- [ ] Scroll quickly across the story in both directions.
- [ ] Test at a desktop viewport and phone viewport.
- [ ] Confirm mobile viewport uses the non-pinned story fallback.
- [ ] Check keyboard focus and reduced-motion behavior.
- [ ] Review console for errors and network panel for failed image requests.
- [ ] Check for horizontal overflow and overlapping content.

## Content / production readiness
- [ ] Replace the demo WhatsApp number.
- [ ] Replace service prices and confirm with the business owner.
- [ ] Replace illustrative testimonials with authorized, real reviews.
- [ ] Use approved/licensed imagery and a real salon portfolio.
- [ ] Add the verified address, hours and directions.
- [ ] Confirm the real conversion flow; do not claim booking confirmation without persistence and salon confirmation.
