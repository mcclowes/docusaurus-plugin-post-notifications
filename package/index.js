const path = require('path');
const fs = require('fs-extra');

/**
 * Docusaurus Glossary Plugin
 *
 * A plugin that provides glossary functionality with:
 * - Glossary terms defined in a JSON file
 * - Auto-generated glossary page
 * - GlossaryTerm component for inline definitions
 * - Tooltips on hover
 *
 * @param {object} context - Docusaurus context
 * @param {object} options - Plugin options
 * @param {string} options.glossaryPath - Path to glossary JSON file (default: 'glossary/glossary.json')
 * @param {string} options.routePath - Route path for glossary page (default: '/glossary')
 * @returns {object} Plugin object
 */
function glossaryPlugin(context, options = {}) {
  const { glossaryPath = 'glossary/glossary.json', routePath = '/glossary' } = options;

  return {
    name: 'docusaurus-plugin-glossary',

    async loadContent() {
      // Load glossary terms from JSON file
      const glossaryFilePath = path.resolve(context.siteDir, glossaryPath);

      if (await fs.pathExists(glossaryFilePath)) {
        const glossaryData = await fs.readJson(glossaryFilePath);
        return glossaryData;
      }

      console.warn(`Glossary file not found at ${glossaryFilePath}. Using empty glossary.`);
      return { terms: [] };
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions;

      // Create data file that can be imported by components
      const glossaryDataPath = await createData('glossary-data.json', JSON.stringify(content));

      // Add glossary page route
      addRoute({
        path: routePath,
        component: '@site/src/plugins/docusaurus-plugin-glossary/components/GlossaryPage.js',
        exact: true,
        modules: {
          glossaryData: glossaryDataPath,
        },
      });
    },

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    getPathsToWatch() {
      return [path.resolve(context.siteDir, glossaryPath)];
    },

    async postBuild({ outDir }) {
      // You can add any post-build steps here if needed
      console.log('Glossary plugin: Build completed');
    },
  };
}

module.exports = glossaryPlugin;
