import path from 'path';
import { fileURLToPath } from 'url';
import type { LoadContext, Plugin } from '@docusaurus/types';
import validatePeerDependencies from 'validate-peer-dependencies';
import type {
  NewPostToastOptions,
  BlogPostMetadata,
  NewPostToastPluginContent,
  NewPostToastGlobalData,
} from './types';
import { resolveOptions } from './options';
import { validateOptions, logValidationWarnings } from './validation';

// Standard ES module directory resolution
const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

// Validate peer dependencies at module load time
validatePeerDependencies(currentDirname);

// Type for blog plugin content structure
interface BlogPluginContent {
  blogPosts: Array<{
    id: string;
    metadata: {
      title: string;
      description?: string;
      permalink: string;
      date: string;
      tags?: Array<{ label: string }>;
      frontMatter?: {
        image?: string;
      };
    };
  }>;
}

// Type for allContent from Docusaurus
type AllContent = Record<string, Record<string, BlogPluginContent | undefined>>;

/**
 * Docusaurus New Post Toast Plugin
 *
 * A plugin that shows toast notifications for new blog posts based on the user's
 * last visit timestamp stored in localStorage.
 *
 * ## Features
 *
 * - Tracks user's last visit using localStorage
 * - Shows toast notifications for posts published since last visit
 * - Configurable appearance (position, duration, max toasts)
 * - Dismissable toasts with persistence
 * - Dark mode and accessibility support
 *
 * ## Basic Usage
 *
 * ```javascript
 * module.exports = {
 *   plugins: ['docusaurus-plugin-new-post-toast'],
 * };
 * ```
 *
 * ## Configuration
 *
 * ```javascript
 * module.exports = {
 *   plugins: [
 *     ['docusaurus-plugin-new-post-toast', {
 *       toast: {
 *         position: 'bottom-right',
 *         duration: 8000,
 *         maxToasts: 3,
 *       },
 *       behavior: {
 *         showOnFirstVisit: false,
 *         maxAgeDays: 30,
 *       },
 *     }],
 *   ],
 * };
 * ```
 *
 * @param context - Docusaurus context
 * @param options - Plugin options
 * @param options.enabled - Enable/disable the plugin (default: true)
 * @param options.toast - Toast appearance options
 * @param options.behavior - Behavior options (timing, filtering)
 * @param options.storage - LocalStorage configuration
 * @param options.blog - Blog integration options
 * @returns Plugin object
 */
export default function pluginNewPostToast(
  _context: LoadContext,
  options: NewPostToastOptions = {}
): Plugin<NewPostToastPluginContent | undefined> {
  // Validate options and log warnings
  const validation = validateOptions(options, { throwOnError: false });
  if (!validation.valid) {
    validation.errors.forEach(err => {
      console.error(`[new-post-toast] Config error: [${err.field}] ${err.message}`);
    });
  }
  if (validation.warnings.length > 0) {
    logValidationWarnings(validation.warnings);
  }

  const opts = resolveOptions(options);

  return {
    name: 'docusaurus-plugin-new-post-toast',

    // Using 'any' for args since Docusaurus types don't expose allContent properly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async contentLoaded(args: any) {
      if (!opts.enabled) return;

      const allContent = args.allContent as AllContent;
      const { setGlobalData, createData } = args.actions;

      // Get blog posts from @docusaurus/plugin-content-blog
      const blogPluginId = opts.blog.pluginId;
      const blogContent = allContent['docusaurus-plugin-content-blog']?.[blogPluginId];

      if (!blogContent) {
        console.warn(
          '[new-post-toast] Blog plugin content not found. ' +
            `Make sure @docusaurus/plugin-content-blog is installed and the pluginId "${blogPluginId}" is correct.`
        );
        return;
      }

      const posts: BlogPostMetadata[] = blogContent.blogPosts.map(post => ({
        id: post.id,
        title: post.metadata.title,
        description: post.metadata.description,
        permalink: post.metadata.permalink,
        date: post.metadata.date,
        image: post.metadata.frontMatter?.image,
        tags: post.metadata.tags?.map(t => t.label),
      }));

      // Sort by date descending (newest first)
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Create static data file
      await createData('posts-manifest.json', JSON.stringify(posts));

      // Set global data for client access
      const globalData: NewPostToastGlobalData = {
        posts,
        options: {
          toast: opts.toast,
          behavior: opts.behavior,
          storage: opts.storage,
          blog: opts.blog,
        },
      };

      setGlobalData(globalData);
    },

    getClientModules() {
      if (!opts.enabled) return [];
      return [path.join(currentDirname, 'client/index.js')];
    },

    getThemePath() {
      return path.join(currentDirname, 'theme');
    },

    async postBuild({ outDir }) {
      console.log(`[new-post-toast] Build completed. Output: ${outDir}`);
    },
  };
}
