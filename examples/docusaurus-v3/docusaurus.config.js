import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'New Post Toast Example',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'example',
  projectName: 'new-post-toast-example-site',
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
        },
        blog: {
          showReadingTime: true,
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: path.resolve(__dirname, './src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        // Toast appearance
        toast: {
          position: 'bottom-right',
          duration: 8000,
          maxToasts: 3,
          showDescription: true,
          showDate: true,
        },
        // Behavior
        behavior: {
          showOnFirstVisit: true, // Show on first visit for demo purposes
          maxAgeDays: 365, // Show older posts for demo
          delay: 1000,
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'New Post Toast Demo',
      items: [
        { to: '/docs/intro', label: 'Docs', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
      ],
    },
  },
};
