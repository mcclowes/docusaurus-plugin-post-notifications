# Contributing to docusaurus-plugin-new-post-toast

Thanks for helping improve the plugin! This document explains how to work on the project and what to expect from the contribution process.

## Code of conduct

Be kind, inclusive, and constructive. We aim to foster a welcoming environment for everyone.

## Ways to contribute

### Report issues

Open an issue with:

- A concise description of the problem or question
- Steps to reproduce (if applicable)
- What you expected to happen and what actually happened
- Environment details (Node version, OS, Docusaurus version)

### Suggest enhancements

Share your idea by opening an issue that includes:

- The problem you are trying to solve
- Why it matters for people using the plugin
- Any screenshots, mock-ups, or references that give context

### Submit pull requests

1. Fork the repository and branch from `main`.
2. Keep changes focused; unrelated fixes should be separate PRs.
3. Update docs and tests when behaviour changes.
4. Run the checks listed below before opening your PR.

## Local development

Use Node 20 or newer. CI runs on Node 20 and 22.

```bash
git clone https://github.com/mcclowes/docusaurus-plugin-post-notifications.git
cd docusaurus-plugin-post-notifications
npm ci
```

- `npm run build` – use tsup to bundle ESM, CommonJS, declarations, source maps, and CSS assets into `dist/`
- `npm run watch` – rebuild on changes (ideal while running the example site)
- `npm test` – run Jest
- `npm run test:package` – check the built package's module formats, theme, and default blog data
- `npm run test:release` – check publication decisions without installing dependencies or contacting registries
- `npm run typecheck` / `npm run lint` – check types and code quality
- `npm ci --prefix examples/docusaurus-v3` – install the example's locked dependencies
- `npm run example:build` / `npm run example:start` – build or launch the example after building the plugin and installing the example's dependencies
- `npm run format` / `npm run format:check` – apply or verify Prettier formatting

## Project layout

```text
src/
  index.ts             # Main export
  plugin.ts            # Plugin implementation with allContentLoaded hook
  types.ts             # TypeScript interfaces
  options.ts           # Default options and resolution
  validation.ts        # Diagnostic validation
  client/
    index.ts           # Client module (lifecycle hooks)
    storage.ts         # localStorage utilities
    comparison.ts      # Post date comparison logic
  theme/
    NewPostToast/      # Toast component and styles
    Root/              # Root wrapper for toast container
dist/                  # Compiled output shipped to npm
examples/docusaurus-v3/  # Example site consuming ../../dist
scripts/               # Built-package tests and release-state helpers/tests
__tests__/             # Jest tests
```

Edit files in `src/` and run the build script before publishing or testing against `dist/`.

## Testing checklist

- Add or update tests near the code you touched (plugin logic under `__tests__/`, component tests in `src/theme`).
- Match CI: run `npm run test:release`, `npm ci`, `npm run build`, `npm run test:package`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test`.
- Install the example with `npm ci --prefix examples/docusaurus-v3`, then run `npm run example:build`.
- Run `npm run example:start` if your change affects runtime behaviour.
- Keep coverage healthy—try not to reduce it without a strong reason.

## Style guidelines

- TypeScript for plugin logic; TSX for components.
- Follow Prettier formatting (`npm run format`).
- Use meaningful names and add comments for non-obvious logic.
- Avoid editing files in `dist/` directly; they are generated.

## Pull request process

1. Ensure your branch is up to date with `main`.
2. Run the testing checklist above. Use `npm run watch` while developing.
3. Update documentation (README, example site) if behaviour changes.
4. Describe the change clearly in the PR template, including testing steps.
5. Address review feedback promptly—collaboration is the goal.

## Changelog

We maintain a [CHANGELOG.md](CHANGELOG.md) following [Keep a Changelog](https://keepachangelog.com/) format. When making changes:

- Add entries under the `[Unreleased]` section
- Use categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
- Write entries from the user's perspective
- Reference issues/PRs where applicable

## Releases

Maintainers handle releases. Typical steps:

1. Move `[Unreleased]` entries to a new version section in CHANGELOG.md
2. Bump the version in `package.json`
3. Run the test and build commands
4. Commit with message like `chore: release v0.2.0`
5. Tag the release and publish to npm

## License

By contributing, you agree that your contributions will be released under the MIT License alongside the rest of the project.
