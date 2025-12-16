import type { BlogPostMetadata, ResolvedNewPostToastOptions } from '../types';
import { getDismissedPosts } from './storage';

export interface GetNewPostsOptions {
  posts: BlogPostMetadata[];
  lastVisit: string | null;
  options: {
    behavior: ResolvedNewPostToastOptions['behavior'];
    storage: ResolvedNewPostToastOptions['storage'];
  };
}

export function getNewPosts({ posts, lastVisit, options }: GetNewPostsOptions): BlogPostMetadata[] {
  // First visit - don't show anything unless configured to
  if (!lastVisit && !options.behavior.showOnFirstVisit) {
    return [];
  }

  const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date(0);
  const maxAge = options.behavior.maxAgeDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  // Get dismissed posts
  const dismissedPosts = new Set(getDismissedPosts(options.storage.key));

  return posts.filter(post => {
    const postDate = new Date(post.date);

    // Post must be:
    // 1. Newer than last visit
    // 2. Within maxAgeDays
    // 3. Not already dismissed (if tracking is enabled)
    const isNewerThanLastVisit = postDate > lastVisitDate;
    const isWithinMaxAge = postDate > cutoffDate;
    const isNotDismissed = !options.storage.trackDismissed || !dismissedPosts.has(post.id);

    return isNewerThanLastVisit && isWithinMaxAge && isNotDismissed;
  });
}

export function shouldExcludePath(
  pathname: string,
  options: {
    behavior: ResolvedNewPostToastOptions['behavior'];
    blog: ResolvedNewPostToastOptions['blog'];
  }
): boolean {
  // Check if current path is in excludePaths
  if (options.behavior.excludePaths.some(excludePath => pathname.startsWith(excludePath))) {
    return true;
  }

  // If onlyOnBlogPages is true, exclude non-blog pages
  if (options.behavior.onlyOnBlogPages) {
    const blogPath = options.blog.path;
    if (!pathname.startsWith(blogPath)) {
      return true;
    }
  }

  return false;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
