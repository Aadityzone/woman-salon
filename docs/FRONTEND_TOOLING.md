# Frontend design skills and browser testing

## What is configured in this repository

- `AGENTS.md`: project-specific luxury art direction and quality gates.
- `playwright.config.ts`: desktop Chromium and mobile browser projects.
- `tests/e2e/homepage.spec.ts`: basic navigation, responsive and overflow smoke tests.
- `.mcp.json`: Playwright MCP server definition for MCP clients that support project-level `.mcp.json`.
- `npm run test:e2e`: run the browser test suite.

These files configure the workflow; they do not prove that a particular coding agent has loaded the skills or connected to the MCP server. Browser tests have not yet been run.

## Install Impeccable

Use the skill installer in the project terminal, following the current source README:
```bash
npx skills add https://github.com/daskoon/impeccable --skill frontend-design
```
If the repository's skill name or install syntax changes, follow its README rather than forcing the command.

## Install Taste Skill

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend
```

## Install Vercel Web Interface Guidelines

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

Vercel guidelines reference: https://vercel.com/design/guidelines

## Install dependencies and run tests

```bash
npm install
npx playwright install chromium
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Start/reload your coding agent after installing skills or changing MCP settings. Confirm its MCP tools list contains Playwright browser actions. Then run the site and test both desktop and mobile flows.

## MCP note

The project `.mcp.json` is a project-local server definition for compatible MCP clients. Some clients only read MCP configuration from user-level settings; if your editor does not load it, add the same `playwright` server entry to that editor's MCP settings and restart/reload the client.
