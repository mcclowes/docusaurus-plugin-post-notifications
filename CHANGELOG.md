# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Updated `.claude/skills/docusaurus-glossary/` to sync with upstream docusaurus-plugin-glossary repo
  - SKILL.md now recommends preset-based configuration
  - configuration.md includes preset and manual configuration options
  - troubleshooting.md updated for preset approach
- Fixed `.claude/skills/docusaurus-plugin-dev/SKILL.md` reference paths (removed hardcoded absolute paths)
- Replaced `package/README.md` with correct docusaurus-plugin-starter documentation (was stale glossary content)
- Removed empty `src/theme/GlossaryTerm/` directory
- Updated `AGENTS.md` to remove outdated skill invocation instructions

## [0.1.0] - 2024-11-17

### Added

- Initial release of docusaurus-plugin-starter
- Typed plugin skeleton with lifecycle hooks (`loadContent`, `contentLoaded`, `getClientModules`, `getThemePath`)
- Client module example (`src/client/index.ts`) for route-aware behavior
- Theme component (`StarterMessage`) exposed for swizzling
- Remark plugin example (`starterRemarkPlugin.ts`) for markdown transformation
- Example Docusaurus v3 site for development and testing
- Jest test setup with React Testing Library
- TypeScript configuration with tsup build
- Prettier formatting configuration
- Claude Code skills for Docusaurus development assistance

[Unreleased]: https://github.com/mcclowes/docusaurus-plugin-starter/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mcclowes/docusaurus-plugin-starter/releases/tag/v0.1.0
