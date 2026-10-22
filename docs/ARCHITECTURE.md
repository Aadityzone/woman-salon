# Maison Belle architecture and workflow

## Current demo architecture

```text
Browser (mobile / desktop)
        |
        v
Next.js App Router
  |-- page composition and accessible HTML
  |-- GSAP + ScrollTrigger (scroll story, reveal, parallax)
  |-- Motion for React (small interactive transitions)
  |-- static service/gallery content
  |-- external WhatsApp enquiry link
        |
        v
No booking backend in the demo yet
```

The website is a concept/demo. It intentionally does not store appointments or assert confirmed booking success.

## Animation ownership

- GSAP: scroll-linked reveal, parallax, pinned chapter timeline.
- Motion: hero entrance and small hover/interaction feedback.
- Do not animate the same DOM property on the same element using both systems.
- Keep primary enquiry actions usable without waiting for animation.
- Provide a non-pinned reading path for reduced-motion and narrow/mobile viewports.

## Before a real booking system

Confirm client requirements first. If needed, add server-side validation and persistence, availability rules, overlap protection, booking statuses, owner notification, privacy controls and tests. Never trust browser-provided availability or price.

## Demo content

Service prices, reviews, address, hours, phone, WhatsApp number and remote imagery are placeholders. Replace with approved, verified information before production.
