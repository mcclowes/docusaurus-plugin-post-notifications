import path from 'path';
import { fileURLToPath } from 'url';
import type { LoadContext, Plugin } from '@docusaurus/types';
import validatePeerDependencies from 'validate-peer-dependencies';
import type { NewPostToastOptions, BlogPostMetadata, NewPostToastGlobalData } from './types';
import { resolveOptions } from './options';
import { validateOptions, logValidationWarnings } from './validation';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

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

type AllContent = Record<string, Record<string, BlogPluginContent | undefined>>;

export default function pluginNewPostToast(
  _context: LoadContext,
  options: NewPostToastOptions = {}
): Plugin<void> {
  validatePeerDependencies(currentDirname);

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async contentLoaded(args: any) {
      if (!opts.enabled) return;

      const allContent = args.allContent as AllContent;
      const { setGlobalData, createData } = args.actions;

      const blogPluginId = opts.blog.pluginId;
      const blogContent = allContent['docusaurus-plugin-content-blog']?.[blogPluginId];

      if (!blogContent) {
        console.warn(
          '[new-post-toast] Blog plugin content not found. ' +
            `Make sure @docusaurus/plugin-content-blog is installed and the pluginId "${blogPluginId}" is correct.`
        );
        return;
      }

      const posts: BlogPostMetadata[] = [];
      for (const post of blogContent.blogPosts) {
        const parsed = Date.parse(post.metadata.date);
        if (Number.isNaN(parsed)) {
          console.warn(
            `[new-post-toast] Skipping post "${post.id}" with invalid date: ${post.metadata.date}`
          );
          continue;
        }
        posts.push({
          id: post.id,
          title: post.metadata.title,
          description: post.metadata.description,
          permalink: post.metadata.permalink,
          date: new Date(parsed).toISOString(),
          image: post.metadata.frontMatter?.image,
          tags: post.metadata.tags?.map(t => t.label),
        });
      }

      posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

      await createData('posts-manifest.json', JSON.stringify(posts));

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

    getThemePath() {
      return path.join(currentDirname, 'theme');
    },
  };
}
