// Plugin options interface
export interface NewPostToastOptions {
  // Enable/disable the plugin
  enabled?: boolean;

  // Toast appearance
  toast?: {
    position?:
      | 'bottom-right'
      | 'bottom-left'
      | 'top-right'
      | 'top-left'
      | 'bottom-center'
      | 'top-center';
    duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
    maxToasts?: number; // Max toasts to show at once (default: 3)
    showDescription?: boolean; // Show post description in toast
    showDate?: boolean; // Show post date
    showImage?: boolean; // Show post thumbnail if available
  };

  // Behavior
  behavior?: {
    showOnFirstVisit?: boolean; // Show toast on first-ever visit (default: false)
    maxAgeDays?: number; // Only show posts from last N days (default: 30)
    excludePaths?: string[]; // Don't show toast on these paths
    onlyOnBlogPages?: boolean; // Only show on /blog/* pages
    delay?: number; // Delay before showing toast (ms, default: 1000)
  };

  // Storage
  storage?: {
    key?: string; // localStorage key prefix
    trackDismissed?: boolean; // Remember dismissed posts (default: true)
  };

  // Blog integration
  blog?: {
    pluginId?: string; // If using multiple blog instances
    path?: string; // Blog path (default: '/blog')
  };

  // Customization
  custom?: {
    toastComponent?: string; // Path to custom toast component
    formatDate?: (date: string) => string; // Date formatter
  };
}

// Resolved options with all defaults applied
export interface ResolvedNewPostToastOptions {
  enabled: boolean;
  toast: Required<NonNullable<NewPostToastOptions['toast']>>;
  behavior: Required<NonNullable<NewPostToastOptions['behavior']>>;
  storage: Required<NonNullable<NewPostToastOptions['storage']>>;
  blog: Required<NonNullable<NewPostToastOptions['blog']>>;
}

// Blog post metadata extracted from the blog plugin
export interface BlogPostMetadata {
  id: string;
  title: string;
  description?: string;
  permalink: string;
  date: string; // ISO string
  image?: string;
  tags?: string[];
}

// Plugin content returned by loadContent
export interface NewPostToastPluginContent {
  posts: BlogPostMetadata[];
}

// Global data set for client access
export interface NewPostToastGlobalData {
  posts: BlogPostMetadata[];
  options: {
    toast: ResolvedNewPostToastOptions['toast'];
    behavior: ResolvedNewPostToastOptions['behavior'];
    storage: ResolvedNewPostToastOptions['storage'];
    blog: ResolvedNewPostToastOptions['blog'];
  };
}

// localStorage schema
export interface StorageData {
  lastVisit: string; // ISO timestamp
  dismissedPosts: string[]; // Array of post IDs
  version?: number; // Schema version for future migrations
}

// Toast component props
export interface ToastProps {
  post: BlogPostMetadata;
  options: ResolvedNewPostToastOptions['toast'];
  onDismiss: (postId: string) => void;
  index: number;
}

// Toast container props
export interface ToastContainerProps {
  posts: BlogPostMetadata[];
  options: ResolvedNewPostToastOptions['toast'];
}
