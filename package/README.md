# docusaurus-plugin-starter

> A lean, batteries-included starter for building your own Docusaurus plugin.

This is the compiled package output. For development, see the [main repository](https://github.com/mcclowes/docusaurus-plugin-starter).

## Installation

```bash
npm install docusaurus-plugin-starter
```

## Usage

Add the plugin to your `docusaurus.config.js`:

```javascript
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
              replacement: 'NOTE',
            }),
          ],
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-starter',
      {
        greetingMessage: 'Welcome!',
        routePath: '/starter',
      },
    ],
  ],
};
```

## Options

| Option            | Type    | Default                       | Description                   |
| ----------------- | ------- | ----------------------------- | ----------------------------- |
| `enabled`         | boolean | `true`                        | Enable/disable the plugin     |
| `greetingMessage` | string  | `'Hello from plugin-starter!'`| Message shown on starter page |
| `routePath`       | string  | `'/starter'`                  | URL path for the starter page |

## What's Included

- **Lifecycle Hooks**: Example implementations of `loadContent`, `contentLoaded`, `getClientModules`, and `getThemePath`
- **Client Module**: Route-aware client script that runs on every navigation
- **Theme Component**: Swizzlable `StarterMessage` component
- **Remark Plugin**: Example markdown transformer

## Development

To use this as a template for your own plugin:

1. Clone the repository
2. Run `npm install`
3. Run `npm run example:start` to see it in action
4. Modify the source files in `src/`
5. Run `npm run build` to compile

See the [full documentation](https://github.com/mcclowes/docusaurus-plugin-starter) for more details.

## License

MIT
