# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`docusaurus-plugin-new-post-toast` — a Docusaurus v3 plugin that shows toast notifications for new blog posts based on a `lastVisit` timestamp in localStorage. Fully client-side, no backend.

## Stack

- TypeScript, React 18, Docusaurus 3 (peer deps)
- Jest + React Testing Library for unit tests; Playwright for e2e
- Build: `tsc` + `node scripts/build.js` (copies theme CSS/assets into `dist/`)
- ESLint flat config, Prettier, Husky + lint-staged

Note: `tsup.config.ts` exists but is unused — the build goes through `scripts/build.js`.

## Layout

```
src/
  index.ts            # Main export
  plugin.ts           # Plugin factory (loadContent, contentLoaded, getClientModules, getThemePath)
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
scripts/              # build.js, watch.js, copy-theme-files.js, watch-css.js
```

## Common commands

- `npm run build` — compile + copy assets to `dist/`
- `npm run watch` — rebuild on changes
- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run test:e2e` — Playwright
- `npm run example:start` — run the example site against the built `dist/`
- `npm run lint` / `npm run format`

Rebuild before running the example if you change `src/`.

## Conventions

- TDD where practical; colocate or mirror tests under `__tests__/` or alongside components
- Keep client code SSR-safe — guard with `ExecutionEnvironment.canUseDOM` before touching `window`/`localStorage`
- SCSS modules for component styles; respect Docusaurus CSS variables for theming
- Sentence case in docs and commit messages
- Track work via GitHub issues; reference with `Fixes #N` in PRs

## Publishing

`prepublishOnly` runs build + tests. `files` ships only `dist/`, `README.md`, `LICENSE`.

## Related docs

- `README.md` — user-facing usage and options
- `CONTRIBUTING.md` — contributor workflow
- `PLUGIN-DESIGN.md` — design rationale
- `docs/CLIENT_MODULES.md` — client module details
- `AGENTS.md` — available Claude skills for this repo
