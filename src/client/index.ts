import type { NewPostToastGlobalData, BlogPostMetadata } from '../types';
import { getLastVisit, updateLastVisit, addDismissedPost } from './storage.js';
import { getNewPosts, shouldExcludePath } from './comparison.js';

const PLUGIN_NAME = 'docusaurus-plugin-new-post-toast';

// Custom event types
declare global {
  interface WindowEventMap {
    'new-posts-available': CustomEvent<{
      posts: BlogPostMetadata[];
      options: NewPostToastGlobalData['options'];
    }>;
  }
}

// Get plugin data from Docusaurus global data
function getPluginData(): NewPostToastGlobalData | null {
  if (typeof window === 'undefined') return null;

  try {
    // Access Docusaurus global data
    const globalData = (
      window as unknown as {
        __DOCUSAURUS__?: {
          globalData?: Record<string, Record<string, NewPostToastGlobalData>>;
        };
      }
    ).__DOCUSAURUS__?.globalData;

    if (!globalData) return null;

    // The data is stored under the plugin name with 'default' as the plugin ID
    const pluginData = globalData[PLUGIN_NAME]?.default;
    return pluginData || null;
  } catch {
    return null;
  }
}

// Initialize toast display
function initializeToasts(location: { pathname: string }): void {
  const pluginData = getPluginData();
  if (!pluginData) return;

  const { posts, options } = pluginData;

  // Check if we should show on this path
  if (shouldExcludePath(location.pathname, options)) return;

  // Get new posts
  const lastVisit = getLastVisit(options.storage.key);
  const newPosts = getNewPosts({
    posts,
    lastVisit,
    options,
  });

  // Show toasts for new posts
  if (newPosts.length > 0) {
    const maxToasts = options.toast.maxToasts;
    const postsToShow = newPosts.slice(0, maxToasts);

    // Dispatch custom event for toast component to handle
    window.dispatchEvent(
      new CustomEvent('new-posts-available', {
        detail: { posts: postsToShow, options },
      })
    );
  }

  // Update last visit (do this after showing toasts)
  updateLastVisit(options.storage.key);
}

// Export dismissPost for use by toast component
export { addDismissedPost as dismissPost };

// Track if we've already initialized for this location
let lastInitializedPath: string | null = null;

// Client module lifecycle - using default export function pattern
export default (function clientModule() {
  if (typeof window === 'undefined') {
    return null;
  }

  return {
    onRouteDidUpdate({ location }: { location: { pathname: string } }) {
      // Prevent double-initialization on the same path
      if (lastInitializedPath === location.pathname) return;
      lastInitializedPath = location.pathname;

      // Get plugin data to check delay option
      const pluginData = getPluginData();
      const delay = pluginData?.options.behavior.delay ?? 1000;

      // Delay slightly to let the page render
      setTimeout(() => {
        initializeToasts(location);
      }, delay);
    },
  };
})();
