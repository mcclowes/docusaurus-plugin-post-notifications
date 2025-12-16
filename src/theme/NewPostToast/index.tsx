import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import type { BlogPostMetadata, NewPostToastGlobalData } from '../../types';
import { addDismissedPost, getLastVisit, updateLastVisit } from '../../client/storage';
import { getNewPosts, shouldExcludePath, formatDate } from '../../client/comparison';
import styles from './styles.module.css';

const PLUGIN_NAME = 'docusaurus-plugin-new-post-toast';

interface ToastOptions {
  position: string;
  duration: number;
  maxToasts: number;
  showDescription: boolean;
  showDate: boolean;
  showImage: boolean;
}

interface ToastProps {
  post: BlogPostMetadata;
  options: ToastOptions;
  storageKey: string;
  onDismiss: (postId: string) => void;
  index: number;
}

function Toast({ post, options, storageKey, onDismiss, index }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      addDismissedPost(post.id, storageKey);
      onDismiss(post.id);
    }, 300); // Match CSS animation duration
  }, [post.id, storageKey, onDismiss]);

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
    return undefined;
  }, [options.duration, index, handleDismiss]);

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
        type="button"
      >
        ×
      </button>

      <div className={styles.content}>
        <span className={styles.badge}>New Post</span>

        {options.showImage && post.image && (
          <img src={post.image} alt="" className={styles.image} />
        )}

        <h4 className={styles.title}>
          <Link to={post.permalink}>{post.title}</Link>
        </h4>

        {options.showDescription && post.description && (
          <p className={styles.description}>{post.description}</p>
        )}

        {options.showDate && (
          <time className={styles.date} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        )}

        <Link to={post.permalink} className={styles.readLink}>
          Read now →
        </Link>
      </div>
    </div>
  );
}

// Position class mapping
const positionClasses: Record<string, string> = {
  'bottom-right': styles.bottomRight,
  'bottom-left': styles.bottomLeft,
  'top-right': styles.topRight,
  'top-left': styles.topLeft,
  'bottom-center': styles.bottomCenter,
  'top-center': styles.topCenter,
};

/**
 * NewPostToastContainer - Main container component for toast notifications
 *
 * Uses usePluginData hook to access global plugin data and determines
 * which new posts to show based on the user's last visit.
 */
export default function NewPostToastContainer() {
  const [toasts, setToasts] = useState<BlogPostMetadata[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Get plugin data using the proper Docusaurus hook
  const pluginData = usePluginData(PLUGIN_NAME) as NewPostToastGlobalData | undefined;

  const options = pluginData?.options;

  // Calculate new posts based on last visit
  const newPosts = useMemo(() => {
    const posts = pluginData?.posts || [];
    if (!options || posts.length === 0) return [];

    // Check if we should show on this path
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (shouldExcludePath(pathname, options)) return [];
    }

    const lastVisit = getLastVisit(options.storage.key);
    return getNewPosts({
      posts,
      lastVisit,
      options,
    });
  }, [pluginData?.posts, options]);

  // Initialize toasts after delay
  useEffect(() => {
    if (!options || initialized) return;

    const delay = options.behavior.delay;
    const timer = setTimeout(() => {
      const maxToasts = options.toast.maxToasts;
      const postsToShow = newPosts.slice(0, maxToasts);
      setToasts(postsToShow);
      setInitialized(true);

      // Update last visit timestamp
      updateLastVisit(options.storage.key);
    }, delay);

    return () => clearTimeout(timer);
  }, [options, newPosts, initialized]);

  // Also listen for custom events (for backward compatibility with client module)
  useEffect(() => {
    const handler = (
      event: CustomEvent<{ posts: BlogPostMetadata[]; options: NewPostToastGlobalData['options'] }>
    ) => {
      const { posts: eventPosts } = event.detail;
      setToasts(eventPosts);
    };

    window.addEventListener('new-posts-available', handler);
    return () => {
      window.removeEventListener('new-posts-available', handler);
    };
  }, []);

  const handleDismiss = useCallback((postId: string) => {
    setToasts(prev => prev.filter(p => p.id !== postId));
  }, []);

  if (toasts.length === 0 || !options) return null;

  const positionClass = positionClasses[options.toast.position] || styles.bottomRight;

  return (
    <div className={`${styles.container} ${positionClass}`}>
      {toasts.map((post, index) => (
        <Toast
          key={post.id}
          post={post}
          options={options.toast}
          storageKey={options.storage.key}
          onDismiss={handleDismiss}
          index={index}
        />
      ))}
    </div>
  );
}
