# Design: docusaurus-plugin-new-post-toast

A Docusaurus plugin that shows a toast notification for new blog posts based on the user's last visit timestamp stored in localStorage.

## Executive Summary

**This approach is simpler and requires no backend.** It works entirely client-side by:

1. Storing the user's last visit timestamp in localStorage
2. Comparing it against blog post dates at build time
3. Showing a toast for posts published since the last visit

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           BUILD TIME                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────┐         ┌─────────────────────────────────────┐ │
│  │  Blog Plugin        │         │  New Post Toast Plugin              │ │
│  │  (Docusaurus)       │────────▶│                                     │ │
│  │                     │         │  1. Hook into allContent            │ │
│  │  - Parses blog/     │         │  2. Extract post metadata           │ │
│  │  - Generates routes │         │  3. Generate posts-manifest.json    │ │
│  │                     │         │  4. Set global data                 │ │
│  └─────────────────────┘         └─────────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                         ┌────────────────────────────┐
                         │  posts-manifest.json       │
                         │                            │
                         │  [                         │
                         │    {                       │
                         │      "title": "...",       │
                         │      "date": "2025-01-15", │
                         │      "permalink": "/...",  │
                         │      "description": "..."  │
                         │    }                       │
                         │  ]                         │
                         └────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME (Browser)                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────┐         ┌─────────────────────────────────────┐ │
│  │  Client Module      │         │  Toast Component                    │ │
│  │                     │         │                                     │ │
│  │  1. Read lastVisit  │         │  - Animated slide-in                │ │
│  │     from localStorage│────────▶│  - Post title + description        │ │
│  │  2. Compare with    │         │  - "Read now" CTA                   │ │
│  │     manifest dates  │         │  - Dismiss button                   │ │
│  │  3. Find new posts  │         │  - Auto-dismiss timer               │ │
│  │  4. Update lastVisit│         │                                     │ │
│  └─────────────────────┘         └─────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  localStorage                                                        │ │
│  │                                                                       │ │
│  │  {                                                                    │ │
│  │    "docusaurus-new-post-toast:lastVisit": "2025-01-10T12:00:00Z",   │ │
│  │    "docusaurus-new-post-toast:dismissed": ["post-slug-1"]            │ │
│  │  }                                                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Plugin Options

```typescript
interface NewPostToastOptions {
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
```

**Default Configuration:**

```javascript
{
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
}
```

---

## Component Design

### 1. Plugin Core (`src/plugin.ts`)

```typescript
import type { LoadContext, Plugin, AllContent } from '@docusaurus/types';
import type { NewPostToastOptions, BlogPostMetadata } from './types';

export default function pluginNewPostToast(
  context: LoadContext,
  options: NewPostToastOptions
): Plugin<BlogPostMetadata[]> {
  const opts = resolveOptions(options);

  return {
    name: 'docusaurus-plugin-new-post-toast',

    // Extract blog posts from the blog plugin's content
    async contentLoaded({ allContent, actions }) {
      const { setGlobalData, createData } = actions;

      // Get blog posts from @docusaurus/plugin-content-blog
      const blogPluginId = opts.blog?.pluginId ?? 'default';
      const blogContent = allContent['docusaurus-plugin-content-blog']?.[blogPluginId];

      if (!blogContent) {
        console.warn('[new-post-toast] Blog plugin content not found');
        return;
      }

      const posts: BlogPostMetadata[] = blogContent.blogPosts.map(post => ({
        id: post.id,
        title: post.metadata.title,
        description: post.metadata.description,
        permalink: post.metadata.permalink,
        date: post.metadata.date, // ISO string
        image: post.metadata.frontMatter?.image,
        tags: post.metadata.tags?.map(t => t.label),
      }));

      // Sort by date descending (newest first)
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Create static data file
      await createData('posts-manifest.json', JSON.stringify(posts));

      // Set global data for client access
      setGlobalData({
        posts,
        options: {
          toast: opts.toast,
          behavior: opts.behavior,
          storage: opts.storage,
          blog: opts.blog,
        },
      });
    },

    // Provide client module
    getClientModules() {
      if (!opts.enabled) return [];
      return [require.resolve('./client/index.js')];
    },

    // Provide theme components
    getThemePath() {
      return require.resolve('./theme');
    },
  };
}
```

### 2. Client Module (`src/client/index.ts`)

```typescript
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { usePluginData } from '@docusaurus/useGlobalData';

interface StorageData {
  lastVisit: string; // ISO timestamp
  dismissedPosts: string[]; // Array of post IDs
}

const STORAGE_KEY = 'docusaurus-new-post-toast';

// Get data from localStorage
function getStorageData(): StorageData | null {
  if (!ExecutionEnvironment.canUseDOM) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save data to localStorage
function setStorageData(data: Partial<StorageData>): void {
  if (!ExecutionEnvironment.canUseDOM) return;

  try {
    const existing = getStorageData() || { lastVisit: '', dismissedPosts: [] };
    const merged = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

// Find posts newer than last visit
function getNewPosts(
  posts: BlogPostMetadata[],
  lastVisit: string | null,
  options: PluginOptions
): BlogPostMetadata[] {
  // First visit - don't show anything unless configured to
  if (!lastVisit && !options.behavior?.showOnFirstVisit) {
    return [];
  }

  const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date(0);
  const maxAge = options.behavior?.maxAgeDays ?? 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  // Get dismissed posts
  const storage = getStorageData();
  const dismissedPosts = new Set(storage?.dismissedPosts ?? []);

  return posts.filter(post => {
    const postDate = new Date(post.date);

    // Post must be:
    // 1. Newer than last visit
    // 2. Within maxAgeDays
    // 3. Not already dismissed
    return postDate > lastVisitDate && postDate > cutoffDate && !dismissedPosts.has(post.id);
  });
}

// Mark post as dismissed
export function dismissPost(postId: string): void {
  const storage = getStorageData();
  const dismissed = new Set(storage?.dismissedPosts ?? []);
  dismissed.add(postId);
  setStorageData({ dismissedPosts: Array.from(dismissed) });
}

// Update last visit timestamp
export function updateLastVisit(): void {
  setStorageData({ lastVisit: new Date().toISOString() });
}

// Client module lifecycle
export default (function () {
  if (!ExecutionEnvironment.canUseDOM) return null;

  return {
    onRouteDidUpdate({ location }) {
      // Delay slightly to let the page render
      setTimeout(() => {
        initializeToasts(location);
      }, 100);
    },
  };
})();

// Initialize toast display
function initializeToasts(location: Location): void {
  const pluginData = window.__DOCUSAURUS_PLUGIN_DATA__?.['docusaurus-plugin-new-post-toast'];
  if (!pluginData) return;

  const { posts, options } = pluginData;

  // Check if we should show on this path
  if (shouldExcludePath(location.pathname, options)) return;

  // Get new posts
  const storage = getStorageData();
  const newPosts = getNewPosts(posts, storage?.lastVisit ?? null, options);

  // Show toasts for new posts
  if (newPosts.length > 0) {
    const maxToasts = options.toast?.maxToasts ?? 3;
    const postsToShow = newPosts.slice(0, maxToasts);

    // Dispatch custom event for toast component to handle
    window.dispatchEvent(
      new CustomEvent('new-posts-available', {
        detail: { posts: postsToShow, options },
      })
    );
  }

  // Update last visit (do this after showing toasts)
  updateLastVisit();
}
```

### 3. Toast Component (`src/theme/NewPostToast/index.tsx`)

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface ToastProps {
  post: BlogPostMetadata;
  options: ToastOptions;
  onDismiss: (postId: string) => void;
  index: number;
}

function Toast({ post, options, onDismiss, index }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    if (options.duration && options.duration > 0) {
      const timer = setTimeout(
        () => {
          handleDismiss();
        },
        options.duration + index * 200
      ); // Stagger dismissals

      return () => clearTimeout(timer);
    }
  }, [options.duration, index]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(post.id);
    }, 300); // Match CSS animation duration
  }, [post.id, onDismiss]);

  const handleClick = () => {
    // Don't dismiss when clicking to read - let them come back
    // Just navigate to the post
  };

  return (
    <div
      className={`${styles.toast} ${isExiting ? styles.exiting : ''}`}
      style={{ '--index': index } as React.CSSProperties}
      role="alert"
      aria-live="polite"
    >
      <button
        className={styles.closeButton}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>

      <div className={styles.content}>
        <span className={styles.badge}>New Post</span>

        <h4 className={styles.title}>
          <Link to={post.permalink} onClick={handleClick}>
            {post.title}
          </Link>
        </h4>

        {options.showDescription && post.description && (
          <p className={styles.description}>{post.description}</p>
        )}

        {options.showDate && (
          <time className={styles.date} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        )}

        <Link to={post.permalink} className={styles.readLink} onClick={handleClick}>
          Read now →
        </Link>
      </div>
    </div>
  );
}

// Toast Container - manages multiple toasts
export default function NewPostToastContainer() {
  const [toasts, setToasts] = useState<BlogPostMetadata[]>([]);
  const [options, setOptions] = useState<ToastOptions | null>(null);

  // Listen for new posts event from client module
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { posts, options } = event.detail;
      setToasts(posts);
      setOptions(options.toast);
    };

    window.addEventListener('new-posts-available', handler as EventListener);
    return () => {
      window.removeEventListener('new-posts-available', handler as EventListener);
    };
  }, []);

  const handleDismiss = useCallback((postId: string) => {
    // Update localStorage
    dismissPost(postId);

    // Remove from state
    setToasts(prev => prev.filter(p => p.id !== postId));
  }, []);

  if (toasts.length === 0 || !options) return null;

  const positionClass = styles[options.position ?? 'bottomRight'];

  return (
    <div className={`${styles.container} ${positionClass}`}>
      {toasts.map((post, index) => (
        <Toast
          key={post.id}
          post={post}
          options={options}
          onDismiss={handleDismiss}
          index={index}
        />
      ))}
    </div>
  );
}
```

### 4. Toast Styles (`src/theme/NewPostToast/styles.module.css`)

```css
/* Container positioning */
.container {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  pointer-events: none;
}

.bottomRight {
  bottom: 20px;
  right: 20px;
}

.bottomLeft {
  bottom: 20px;
  left: 20px;
}

.topRight {
  top: 20px;
  right: 20px;
}

.topLeft {
  top: 20px;
  left: 20px;
}

.bottomCenter {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.topCenter {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* Toast card */
.toast {
  background: var(--ifm-background-surface-color);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
  animation-delay: calc(var(--index) * 100ms);
  animation-fill-mode: both;
}

.toast.exiting {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Close button */
.closeButton {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: var(--ifm-color-emphasis-600);
  padding: 4px 8px;
  border-radius: 4px;
}

.closeButton:hover {
  background: var(--ifm-color-emphasis-100);
}

/* Content */
.content {
  position: relative;
}

.badge {
  display: inline-block;
  background: var(--ifm-color-primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.title {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.3;
}

.title a {
  color: var(--ifm-heading-color);
  text-decoration: none;
}

.title a:hover {
  color: var(--ifm-color-primary);
}

.description {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--ifm-color-emphasis-700);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  display: block;
  font-size: 12px;
  color: var(--ifm-color-emphasis-500);
  margin-bottom: 12px;
}

.readLink {
  font-size: 14px;
  font-weight: 500;
}

/* Dark mode */
[data-theme='dark'] .toast {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .container {
    left: 10px;
    right: 10px;
    max-width: none;
  }

  .bottomCenter,
  .topCenter {
    transform: none;
  }
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Visits Site                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Client Module: onRouteDidUpdate()                                       │
│                                                                          │
│  1. Read localStorage['docusaurus-new-post-toast']                       │
│     └─▶ { lastVisit: "2025-01-10T...", dismissedPosts: [...] }          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Compare with Global Data (posts-manifest.json)                          │
│                                                                          │
│  Posts:                         Filter Criteria:                         │
│  ┌────────────────────────┐     ┌────────────────────────────────────┐  │
│  │ Post A: 2025-01-15     │     │ date > lastVisit (2025-01-10)      │  │
│  │ Post B: 2025-01-12     │ ──▶ │ date > cutoff (maxAgeDays: 30)     │  │
│  │ Post C: 2025-01-05     │     │ id NOT IN dismissedPosts           │  │
│  │ Post D: 2024-12-01     │     └────────────────────────────────────┘  │
│  └────────────────────────┘                                              │
│                                                                          │
│  Result: [Post A, Post B] are new                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Dispatch Event: 'new-posts-available'                                   │
│  Update localStorage: lastVisit = now                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Toast Component Renders                                                 │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                       │
│  │  New Post           │  │  New Post           │                       │
│  │  ─────────────────  │  │  ─────────────────  │                       │
│  │  Post A Title    ×  │  │  Post B Title    ×  │                       │
│  │  Description...     │  │  Description...     │                       │
│  │  Jan 15, 2025       │  │  Jan 12, 2025       │                       │
│  │  Read now →         │  │  Read now →         │                       │
│  └─────────────────────┘  └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## localStorage Schema

```typescript
interface StorageSchema {
  // Last time the user visited (ISO 8601 timestamp)
  lastVisit: string;

  // Post IDs the user has dismissed
  dismissedPosts: string[];

  // Optional: track which posts have been shown (even if not dismissed)
  shownPosts?: string[];

  // Schema version for future migrations
  version?: number;
}

// Example stored value:
{
  "lastVisit": "2025-01-14T15:30:00.000Z",
  "dismissedPosts": ["2025-01-10-post-slug", "2024-12-25-holiday-post"],
  "version": 1
}
```

---

## Edge Cases & Handling

| Scenario                     | Handling                                                           |
| ---------------------------- | ------------------------------------------------------------------ |
| **First-ever visit**         | Don't show toasts by default (configurable via `showOnFirstVisit`) |
| **localStorage unavailable** | Gracefully degrade - no toasts shown, no errors                    |
| **Many new posts**           | Limit to `maxToasts` (default: 3), show newest first               |
| **Very old posts**           | Filter by `maxAgeDays` (default: 30 days)                          |
| **User dismisses toast**     | Store in `dismissedPosts`, don't show again                        |
| **User clicks "Read now"**   | Navigate to post, keep toast tracking intact                       |
| **Multiple tabs open**       | Each tab updates independently (eventual consistency)              |
| **SSR/SSG**                  | Client module guards with `ExecutionEnvironment.canUseDOM`         |
| **Blog plugin missing**      | Log warning, plugin becomes no-op                                  |

---

## File Structure

```
docusaurus-plugin-new-post-toast/
├── src/
│   ├── index.ts                    # Main export
│   ├── plugin.ts                   # Plugin implementation
│   ├── types.ts                    # TypeScript interfaces
│   ├── options.ts                  # Option validation & defaults
│   ├── client/
│   │   ├── index.ts                # Client module (lifecycle hooks)
│   │   ├── storage.ts              # localStorage utilities
│   │   └── comparison.ts           # Post date comparison logic
│   └── theme/
│       └── NewPostToast/
│           ├── index.tsx           # Toast container component
│           └── styles.module.css   # Toast styles
├── package.json
├── tsconfig.json
└── README.md
```

---

## Configuration Examples

### Basic Usage

```javascript
// docusaurus.config.js
module.exports = {
  plugins: ['docusaurus-plugin-new-post-toast'],
};
```

### Customized

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        toast: {
          position: 'bottom-left',
          duration: 10000, // 10 seconds
          maxToasts: 2,
          showDescription: true,
          showDate: true,
        },
        behavior: {
          showOnFirstVisit: false,
          maxAgeDays: 14, // Only posts from last 2 weeks
          delay: 2000, // Wait 2 seconds before showing
          excludePaths: ['/search', '/404'],
        },
      },
    ],
  ],
};
```

### Multiple Blog Instances

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        blog: {
          pluginId: 'engineering-blog',
          path: '/engineering',
        },
      },
    ],
  ],
};
```

---

## Comparison with Push Notifications

| Feature                       | New Post Toast          | Push Notifications      |
| ----------------------------- | ----------------------- | ----------------------- |
| **Backend required**          | No                      | Yes                     |
| **Works offline**             | No (needs site visit)   | Yes                     |
| **User permission**           | Not required            | Required                |
| **Browser support**           | All modern browsers     | Limited (no iOS Safari) |
| **Implementation complexity** | Low                     | High                    |
| **User reach**                | Only returning visitors | Any subscribed user     |
| **Notification timing**       | On next visit           | Immediately             |
| **HTTPS required**            | No                      | Yes                     |

---

## Accessibility Considerations

1. **ARIA attributes:** Toast has `role="alert"` and `aria-live="polite"`
2. **Focus management:** Close button is keyboard-accessible
3. **Reduced motion:** Respect `prefers-reduced-motion` for animations
4. **Screen readers:** Announce new posts appropriately
5. **Color contrast:** Ensure sufficient contrast in both themes

```css
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none;
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('getNewPosts', () => {
  it('returns posts newer than lastVisit', () => {
    const posts = [
      { id: '1', date: '2025-01-15' },
      { id: '2', date: '2025-01-10' },
      { id: '3', date: '2025-01-05' },
    ];
    const lastVisit = '2025-01-08';

    const result = getNewPosts(posts, lastVisit, defaultOptions);

    expect(result).toHaveLength(2);
    expect(result.map(p => p.id)).toEqual(['1', '2']);
  });

  it('excludes dismissed posts', () => {
    // ...
  });

  it('returns empty for first visit when showOnFirstVisit is false', () => {
    // ...
  });
});
```

### Integration Tests

- Toast renders correctly with post data
- Dismiss button removes toast and updates localStorage
- Multiple toasts stack correctly
- Auto-dismiss works after duration

---

## Implementation Phases

### Phase 1: Core Functionality

- [ ] Plugin setup with blog content extraction
- [ ] localStorage read/write utilities
- [ ] Basic toast component
- [ ] New post detection logic

### Phase 2: Polish

- [ ] Animations and transitions
- [ ] Position variants
- [ ] Dark mode support
- [ ] Mobile responsive design

### Phase 3: Customization

- [ ] Custom toast component support
- [ ] Swizzleable theme components
- [ ] Event hooks for analytics

### Phase 4: Edge Cases

- [ ] Multiple blog instance support
- [ ] Storage migration utilities
- [ ] Comprehensive error handling

---

## Conclusion

This localStorage-based approach is **significantly simpler** than push notifications while still providing value to returning visitors. Key benefits:

- **Zero backend infrastructure** - purely client-side
- **No user permission required** - works automatically
- **Universal browser support** - works everywhere
- **Easy to implement** - standard Docusaurus plugin patterns
- **Privacy-friendly** - data stays in user's browser

The trade-off is that users must visit the site to see notifications, but for most documentation/blog sites, this is acceptable behavior.
