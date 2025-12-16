import type { NewPostToastOptions, ResolvedNewPostToastOptions } from './types';

// Default configuration
const DEFAULT_OPTIONS: ResolvedNewPostToastOptions = {
  enabled: true,
  toast: {
    position: 'bottom-right',
    duration: 8000,
    maxToasts: 3,
    showDescription: true,
    showDate: true,
    showImage: false,
  },
  behavior: {
    showOnFirstVisit: false,
    maxAgeDays: 30,
    excludePaths: [],
    onlyOnBlogPages: false,
    delay: 1000,
  },
  storage: {
    key: 'docusaurus-new-post-toast',
    trackDismissed: true,
  },
  blog: {
    pluginId: 'default',
    path: '/blog',
  },
};

export function resolveOptions(options: NewPostToastOptions = {}): ResolvedNewPostToastOptions {
  return {
    enabled: options.enabled ?? DEFAULT_OPTIONS.enabled,
    toast: {
      position: options.toast?.position ?? DEFAULT_OPTIONS.toast.position,
      duration: options.toast?.duration ?? DEFAULT_OPTIONS.toast.duration,
      maxToasts: options.toast?.maxToasts ?? DEFAULT_OPTIONS.toast.maxToasts,
      showDescription: options.toast?.showDescription ?? DEFAULT_OPTIONS.toast.showDescription,
      showDate: options.toast?.showDate ?? DEFAULT_OPTIONS.toast.showDate,
      showImage: options.toast?.showImage ?? DEFAULT_OPTIONS.toast.showImage,
    },
    behavior: {
      showOnFirstVisit:
        options.behavior?.showOnFirstVisit ?? DEFAULT_OPTIONS.behavior.showOnFirstVisit,
      maxAgeDays: options.behavior?.maxAgeDays ?? DEFAULT_OPTIONS.behavior.maxAgeDays,
      excludePaths: options.behavior?.excludePaths ?? DEFAULT_OPTIONS.behavior.excludePaths,
      onlyOnBlogPages:
        options.behavior?.onlyOnBlogPages ?? DEFAULT_OPTIONS.behavior.onlyOnBlogPages,
      delay: options.behavior?.delay ?? DEFAULT_OPTIONS.behavior.delay,
    },
    storage: {
      key: options.storage?.key ?? DEFAULT_OPTIONS.storage.key,
      trackDismissed: options.storage?.trackDismissed ?? DEFAULT_OPTIONS.storage.trackDismissed,
    },
    blog: {
      pluginId: options.blog?.pluginId ?? DEFAULT_OPTIONS.blog.pluginId,
      path: options.blog?.path ?? DEFAULT_OPTIONS.blog.path,
    },
  };
}

export { DEFAULT_OPTIONS };
