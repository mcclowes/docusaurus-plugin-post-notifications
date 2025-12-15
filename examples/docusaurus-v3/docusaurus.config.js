import path from 'path';
import { fileURLToPath } from 'url';
import pluginStarter from '../../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'Plugin Starter Example',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'example',
  projectName: 'plugin-starter-example-site',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */ ({
        docs: {
          sidebarPath: path.resolve(__dirname, './sidebars.js'),
          remarkPlugins: [
            pluginStarter.createStarterRemarkPlugin({
              marker: 'NOTE',
              replacement: '💡 NOTE',
            }),
          ],
        },
        blog: false,
        pages: {
          remarkPlugins: [
            pluginStarter.createStarterRemarkPlugin({
              marker: 'NOTE',
              replacement: '💡 NOTE',
            }),
          ],
        },
        theme: {
          customCss: path.resolve(__dirname, './src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      // Use the local plugin from the repo root
      path.resolve(__dirname, '../../dist'),
      {
        greetingMessage: 'Welcome to the example site!',
        routePath: '/starter',
      },
    ],
    // Plugin to configure webpack to ignore Node.js modules
    function () {
      return {
        name: 'webpack-node-modules-config',
        configureWebpack(config, isServer) {
          return {
            resolve: {
              fallback: {
                path: false,
                url: false,
                fs: false,
                'fs-extra': false,
                'graceful-fs': false,
                jsonfile: false,
                util: false,
                assert: false,
                stream: false,
                constants: false,
              },
            },
          };
        },
      };
    },
  ],

  // remarkPlugins configured via preset (docs/pages)

  themeConfig: {
    navbar: {
      title: 'Plugin Starter',
      items: [
        { to: '/docs/intro', label: 'Docs', position: 'left' },
        { to: '/starter', label: 'Starter Route', position: 'left' },
      ],
    },
  },
};
