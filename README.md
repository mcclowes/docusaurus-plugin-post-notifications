# docusaurus-plugin-starter

> A lean, batteries-included starter for building your own Docusaurus plugin.

- **Typed plugin skeleton** – `src/plugin.ts` shows the essential lifecycle hooks with helpful comments.
- **Client + theme wiring** – `src/client/index.ts` and `src/theme/StarterMessage` demonstrate client-side behaviour and swizzlable components.
- **Remark integration** – `src/remark/starterRemarkPlugin.ts` illustrates how to ship markdown transforms.
- **Example site** – `examples/docusaurus-v3` consumes the plugin locally so you can iterate quickly.
- **Tests + build scripts** – Jest, TypeScript, and copying helpers are configured out-of-the-box.

Use this template as a launchpad: rename things, rip out the examples, and focus on your feature without rebuilding the plumbing.

## Quick start

```bash
npm install
npm run example:start
```

- Open `http://localhost:3000/starter` to see the example route the plugin registers.
- Edit anything in `src/` to iterate; the example site hot-reloads automatically.
- Run `npm run build` when you are ready to consume or publish the compiled plugin in `dist/`.

## What you get

```text
├── src/
│   ├── index.ts                # Package entry – re-exports plugin + helpers
│   ├── plugin.ts               # Lifecycle hooks with typed options
│   ├── client/index.ts         # Minimal client module (logs route updates)
│   ├── components/StarterPage  # Example route wired via addRoute
│   ├── remark/starterRemarkPlugin.ts
│   └── theme/StarterMessage    # Theme component exposed for swizzling
├── __tests__/plugin.test.js    # Lifecycle smoke tests
├── examples/docusaurus-v3/     # Local example site consuming ./dist
├── scripts/                    # Build + watch helpers for copying assets
├── tsconfig.json               # TypeScript config (src → dist)
├── jest.config.cjs             # Jest set up for TS/React
└── README.md                   # You are here
```

### Lifecycle hooks in play

- `loadContent` prepares data that will be shared with the client/theme.
- `contentLoaded` emits a JSON data module, adds an example route, and calls `setGlobalData`.
- `getClientModules` registers a client script that runs on every navigation.
- `getThemePath` exposes `src/theme/StarterMessage` for swizzling.

Swap these hooks for the ones your plugin needs.

## Example configuration

Inside `examples/docusaurus-v3/docusaurus.config.js`:

```js
import path from 'path';
import pluginStarter from 'docusaurus-plugin-starter';

export default {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          remarkPlugins: [
            pluginStarter.createStarterRemarkPlugin({
              marker: 'NOTE',
              replacement: '💡 NOTE',
            }),
          ],
        },
      },
    ],
  ],
  plugins: [
    [
      path.resolve(__dirname, '../../dist'),
      {
        greetingMessage: 'Welcome to the example site!',
        routePath: '/starter',
      },
    ],
  ],
};
```

Copy this into your own project and replace the example pieces with real functionality.

## Scripts

- `npm run build` – Compile TypeScript and copy assets into `dist/`.
- `npm run watch` – Rebuild on changes (perfect when the example site is running).
- `npm run test` – Execute Jest against the TypeScript sources.
- `npm run example:*` – Helpers for the bundled Docusaurus site.

## Next steps for you

1. Rename everything (package name, README copy, example site) to match your plugin.
2. Delete the example components/tests once you understand the wiring.
3. Implement your real plugin behaviour.
4. Update the documentation with the features you ship.

## License

MIT. Ship something cool!
