import type { BlogPostMetadata, ResolvedNewPostToastOptions } from '../types';
import { getDismissedPosts } from './storage.js';

const MS_PER_DAY = 86_400_000;

export interface GetNewPostsOptions {
  posts: BlogPostMetadata[];
  lastVisit: string | null;
  options: {
    behavior: ResolvedNewPostToastOptions['behavior'];
    storage: ResolvedNewPostToastOptions['storage'];
  };
  dismissedPosts?: string[];
}

export function getNewPosts({
  posts,
  lastVisit,
  options,
  dismissedPosts,
}: GetNewPostsOptions): BlogPostMetadata[] {
  if (!lastVisit && !options.behavior.showOnFirstVisit) {
    return [];
  }

  const lastVisitMs = lastVisit ? Date.parse(lastVisit) : 0;
  const cutoffMs = Date.now() - options.behavior.maxAgeDays * MS_PER_DAY;
  const dismissed = new Set(dismissedPosts ?? getDismissedPosts(options.storage.key));

  return posts.filter(post => {
    const postMs = Date.parse(post.date);
    if (Number.isNaN(postMs)) return false;

    const isNewerThanLastVisit = postMs > lastVisitMs;
    const isWithinMaxAge = postMs > cutoffMs;
    const isNotDismissed = !options.storage.trackDismissed || !dismissed.has(post.id);

    return isNewerThanLastVisit && isWithinMaxAge && isNotDismissed;
  });
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  const withSlash = prefix.endsWith('/') ? prefix : prefix + '/';
  return pathname.startsWith(withSlash);
}

export function shouldExcludePath(
  pathname: string,
  options: {
    behavior: ResolvedNewPostToastOptions['behavior'];
    blog: ResolvedNewPostToastOptions['blog'];
  }
): boolean {
  if (options.behavior.excludePaths.some(p => pathMatchesPrefix(pathname, p))) {
    return true;
  }

  if (options.behavior.onlyOnBlogPages && !pathMatchesPrefix(pathname, options.blog.path)) {
    return true;
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
