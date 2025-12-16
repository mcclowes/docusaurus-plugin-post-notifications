# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Transformed from docusaurus-plugin-starter to docusaurus-plugin-new-post-toast
- Complete rewrite to implement new blog post toast notifications

### Added

- Toast notifications for new blog posts based on localStorage lastVisit timestamp
- Configurable toast appearance (position, duration, maxToasts, showDescription, showDate, showImage)
- Behavior options (showOnFirstVisit, maxAgeDays, excludePaths, onlyOnBlogPages, delay)
- localStorage utilities for tracking last visit and dismissed posts
- Post comparison logic to find new posts since last visit
- NewPostToast theme component with CSS animations
- Root wrapper component for injecting toast container
- Dark mode support via Docusaurus CSS variables
- Reduced motion accessibility support
- Mobile responsive design
- Comprehensive test suite for plugin and comparison logic

### Removed

- StarterPage component and route
- StarterMessage theme component
- starterRemarkPlugin remark plugin
- Old starter template documentation

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

[Unreleased]: https://github.com/mcclowes/docusaurus-plugin-new-post-toast/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mcclowes/docusaurus-plugin-new-post-toast/releases/tag/v0.1.0
