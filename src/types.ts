export type ToastPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'bottom-center'
  | 'top-center';

export interface NewPostToastOptions {
  enabled?: boolean;

  toast?: {
    position?: ToastPosition;
    duration?: number;
    maxToasts?: number;
    showDescription?: boolean;
    showDate?: boolean;
    showImage?: boolean;
  };

  behavior?: {
    showOnFirstVisit?: boolean;
    maxAgeDays?: number;
    excludePaths?: string[];
    onlyOnBlogPages?: boolean;
    delay?: number;
  };

  storage?: {
    key?: string;
    trackDismissed?: boolean;
  };

  blog?: {
    pluginId?: string;
    path?: string;
  };
}

export interface ResolvedNewPostToastOptions {
  enabled: boolean;
  toast: Required<NonNullable<NewPostToastOptions['toast']>>;
  behavior: Required<NonNullable<NewPostToastOptions['behavior']>>;
  storage: Required<NonNullable<NewPostToastOptions['storage']>>;
  blog: Required<NonNullable<NewPostToastOptions['blog']>>;
}

export interface BlogPostMetadata {
  id: string;
  title: string;
  description?: string;
  permalink: string;
  date: string;
  image?: string;
  tags?: string[];
}

export interface NewPostToastGlobalData {
  posts: BlogPostMetadata[];
  options: {
    toast: ResolvedNewPostToastOptions['toast'];
    behavior: ResolvedNewPostToastOptions['behavior'];
    storage: ResolvedNewPostToastOptions['storage'];
    blog: ResolvedNewPostToastOptions['blog'];
  };
}

export interface StorageData {
  lastVisit: string;
  dismissedPosts: string[];
  version?: number;
}
