# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`docusaurus-plugin-new-post-toast` — a Docusaurus v3 plugin that shows toast notifications for new blog posts based on a `lastVisit` timestamp in localStorage. Fully client-side, no backend.

## Stack

- TypeScript, React 18, Docusaurus 3 (peer deps)
- Jest + React Testing Library for unit tests; Playwright for e2e
- Build: tsup produces ESM, CommonJS, declarations, source maps, and CSS assets in `dist/`
- ESLint flat config, Prettier, Husky + lint-staged

`tsup.config.ts` defines the entries and module shims. Node 20 or newer is required; CI checks Node 20 and 22.

## Layout

```
src/
  index.ts            # Main export
  plugin.ts           # Plugin factory (allContentLoaded, getThemePath)
  options.ts          # Defaults + resolveOptions
  validation.ts       # Options validation
  types.ts
  client/
    index.ts          # Client module (lifecycle hooks, SSR-safe)
    storage.ts        # localStorage read/write
    comparison.ts     # New-post detection logic
  theme/
    NewPostToast/     # Toast component + CSS module
    Root/             # Wraps app, mounts toast container
__tests__/            # Jest tests
e2e/                  # Playwright tests
examples/docusaurus-v3/  # Example site (consumes ../../dist)
scripts/              # Built-package tests and release-state helpers/tests
```

## Common commands

- `npm ci` — install locked dependencies
- `npm run build` — bundle package formats and assets into `dist/`
- `npm run watch` — rebuild on changes
- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run test:package` — check the built ESM/CommonJS entry points, theme, and default blog data
- `npm run test:release` — check release decisions without registry requests
- `npm run typecheck` — check TypeScript without emitting files
- `npm run test:e2e` — Playwright
- `npm run example:start` — run the example site against the built `dist/`
- `npm ci --prefix examples/docusaurus-v3` — install the example's locked dependencies
- `npm run example:build` — production-build the example
- `npm run lint` / `npm run format` / `npm run format:check`

Build before running package tests or the example, and install the example's dependencies before starting it. CI runs release tests, a clean root install, build, package tests, types, lint, formatting, Jest, a clean example install, and the example build.

## Conventions

- TDD where practical; colocate or mirror tests under `__tests__/` or alongside components
- Keep client code SSR-safe — guard with `ExecutionEnvironment.canUseDOM` before touching `window`/`localStorage`
- CSS modules for component styles; respect Docusaurus CSS variables for theming
- Sentence case in docs and commit messages
- Track work via GitHub issues; reference with `Fixes #N` in PRs

## Publishing

`prepublishOnly` runs build, package tests, and Jest. `files` ships only `dist/`, `README.md`, `LICENSE`.

## Related docs

- `README.md` — user-facing usage and options
- `CONTRIBUTING.md` — contributor workflow
- `PLUGIN-DESIGN.md` — design rationale
- `docs/CLIENT_MODULES.md` — client module details
- `AGENTS.md` — available Claude skills for this repo
