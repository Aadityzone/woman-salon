# MAISON BELLE — Agent Instructions

## Product direction
Build a refined, cinematic luxury salon website. The aesthetic should feel editorial, tactile, warm and confident—not like a generic SaaS landing page. Prioritise a clear visual point of view, excellent typography, spacious composition, rich but restrained colour, purposeful photography, and subtle motion.

## Required design workflow
- Before major UI edits, inspect the existing page, global styles, package manifest and available screenshots. Improve the existing project rather than rebuilding unrelated infrastructure.
- Use the Impeccable frontend-design skill when available for critique, polish, responsive design, motion, typography and accessibility.
- Use Taste Skill (`design-taste-frontend`) when available to challenge generic layouts and establish a distinctive art direction.
- Follow Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- Keep GSAP/ScrollTrigger for scroll-linked scenes and Motion for component-level transitions. Do not have both libraries animate the same property on the same element.
- Respect `prefers-reduced-motion`; provide a usable non-pinned/mobile story layout.
- Avoid placeholder-looking UI, unnecessary cards, gratuitous gradients, excessive rounded boxes and decorative icons without purpose.
- Keep content honest. Never present concept prices, made-up reviews, placeholder address or fake contact details as real business information.

## Quality gates
- Run `npm run typecheck`, `npm run lint`, and `npm run build` after implementation.
- Use Playwright MCP against the running app when the MCP server is configured. Test desktop and mobile, keyboard navigation, menu interactions, all important anchors, scroll forward/backward, reduced motion, image failures, console errors and horizontal overflow.
- Fix observed defects, rerun checks and report what was actually tested. Never claim a build or browser test passed without running it.
- Keep the main branch untouched; implement on the feature branch and review changes in the pull request.
