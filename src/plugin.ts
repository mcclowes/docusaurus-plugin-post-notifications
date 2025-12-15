import path from 'path';
import { fileURLToPath } from 'url';
import type { LoadContext, Plugin } from '@docusaurus/types';
import type { PluginStarterOptions, StarterPluginContent } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function pluginStarter(
  _context: LoadContext,
  options: PluginStarterOptions = {}
): Plugin<StarterPluginContent | undefined> {
  const resolvedOptions: Required<PluginStarterOptions> = {
    enabled: options.enabled ?? true,
    greetingMessage: options.greetingMessage ?? 'Hello from plugin-starter!',
    routePath: options.routePath ?? '/starter',
  };

  return {
    name: 'docusaurus-plugin-starter',

    async loadContent() {
      if (!resolvedOptions.enabled) return undefined;

      return {
        greeting: resolvedOptions.greetingMessage,
        routePath: resolvedOptions.routePath,
      };
    },

    async contentLoaded({ content, actions }) {
      if (!content) return;

      const { createData, addRoute, setGlobalData } = actions;

      const dataPath = await createData('starter-data.json', JSON.stringify(content, null, 2));

      addRoute({
        path: resolvedOptions.routePath,
        exact: true,
        component: path.join(__dirname, 'components/StarterPage.js'),
        modules: {
          starterData: dataPath,
        },
      });

      setGlobalData(content);
    },

    getClientModules() {
      if (!resolvedOptions.enabled) return [];
      return [path.join(__dirname, 'client/index.js')];
    },

    getThemePath() {
      return path.join(__dirname, 'theme');
    },
  };
}
