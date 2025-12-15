# Contributing to docusaurus-plugin-starter

Thanks for helping improve the plugin starter! This document explains how to work on the project and what to expect from the contribution process.

## Code of Conduct

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
- Why it matters for people using the starter
- Any screenshots, mock-ups, or references that give context

### Submit pull requests

1. Fork the repository and branch from `main`.
2. Keep changes focused; unrelated fixes should be separate PRs.
3. Update docs and tests when behaviour changes.
4. Run the checks listed below before opening your PR.

## Local development

```bash
git clone https://github.com/mcclowes/docusaurus-plugin-starter.git
cd docusaurus-plugin-starter
npm install
```

- `npm run build` – compile TypeScript and copy assets into `dist/`
- `npm run watch` – rebuild on changes (ideal while running the example site)
- `npm test` – run Jest
- `npm run example:start` – launch the bundled Docusaurus example for manual testing
- `npm run format` / `npm run format:check` – apply or verify Prettier formatting

## Project layout

```text
src/
  client/                # Client modules shipped via getClientModules
  components/            # React components used by the plugin (StarterPage)
  plugin.ts              # Typed plugin implementation
  remark/                # Example remark plugin
  theme/                 # Theme components exposed for swizzling
dist/                    # Compiled output shipped to npm
examples/docusaurus-v3/  # Example site consuming ../../dist
scripts/                 # Helper scripts for build/watch flows
```

Edit files in `src/` and run the build script before publishing or testing against `dist/`.

## Testing checklist

- Add or update tests near the code you touched (React components under `src/components` or `src/theme`, plugin logic under `__tests__/`).
- Run `npm test` and ensure it passes.
- Run `npm run example:start` if your change affects runtime behaviour.
- Keep coverage healthy—try not to reduce it without a strong reason.

## Style guidelines

- TypeScript for plugin logic; JSX for components.
- Follow Prettier formatting (`npm run format`).
- Use meaningful names and add comments for non-obvious logic.
- Avoid editing files in `dist/` directly; they are generated.

## Pull request process

1. Ensure your branch is up to date with `main`.
2. Run `npm test` and `npm run build` (or `npm run watch` while developing).
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
