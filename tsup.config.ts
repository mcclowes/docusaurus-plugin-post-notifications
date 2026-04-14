import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    plugin: 'src/plugin.ts',
    'client/storage': 'src/client/storage.ts',
    'client/comparison': 'src/client/comparison.ts',
    'theme/NewPostToast/index': 'src/theme/NewPostToast/index.tsx',
    'theme/Root/index': 'src/theme/Root/index.tsx',
  },
  dts: true,
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: [
    '@docusaurus/ExecutionEnvironment',
    '@docusaurus/BrowserOnly',
    '@docusaurus/useGlobalData',
    '@docusaurus/useDocusaurusContext',
    '@docusaurus/Link',
    '@theme/Layout',
    '@theme/Root',
    '@theme-original/Root',
    'react',
    'react-dom',
  ],
  loader: {
    '.css': 'copy',
  },
});
