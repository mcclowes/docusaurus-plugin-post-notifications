import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import type { BlogPostMetadata, NewPostToastGlobalData } from '../../types';
import {
  addDismissedPost,
  getDismissedPosts,
  getLastVisit,
  pruneDismissedPosts,
  updateLastVisit,
} from '../../client/storage';
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

const EXIT_ANIMATION_MS = 300;

function Toast({ post, options, storageKey, onDismiss, index }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      addDismissedPost(post.id, storageKey);
      onDismiss(post.id);
    }, EXIT_ANIMATION_MS);
  }, [post.id, storageKey, onDismiss]);

  useEffect(() => {
    if (!options.duration || options.duration <= 0) return undefined;
    const timer = setTimeout(handleDismiss, options.duration);
    return () => clearTimeout(timer);
  }, [options.duration, handleDismiss]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDismiss]);

  return (
    <div
      className={`${styles.toast} ${isExiting ? styles.exiting : ''}`}
      style={{ '--index': index } as React.CSSProperties}
      role="status"
      aria-live="polite"
    >
      <button
        className={styles.closeButton}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div className={styles.content}>
        <span className={styles.badge}>New post</span>

        {options.showImage && post.image && (
          <img src={post.image} alt={post.title} className={styles.image} loading="lazy" />
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

const positionClasses: Record<string, string> = {
  'bottom-right': styles.bottomRight,
  'bottom-left': styles.bottomLeft,
  'top-right': styles.topRight,
  'top-left': styles.topLeft,
  'bottom-center': styles.bottomCenter,
  'top-center': styles.topCenter,
};

export default function NewPostToastContainer() {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<BlogPostMetadata[]>([]);
  const initializedRef = useRef(false);

  const pluginData = usePluginData(PLUGIN_NAME) as NewPostToastGlobalData | undefined;
  const options = pluginData?.options;
  const posts = pluginData?.posts;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prune stale dismissed ids against current manifest whenever posts change.
  useEffect(() => {
    if (!mounted || !options || !posts) return;
    pruneDismissedPosts(
      posts.map(p => p.id),
      options.storage.key
    );
  }, [mounted, options, posts]);

  const newPosts = useMemo(() => {
    if (!mounted || !options || !posts || posts.length === 0) return [];
    if (shouldExcludePath(window.location.pathname, options)) return [];

    return getNewPosts({
      posts,
      lastVisit: getLastVisit(options.storage.key),
      options,
      dismissedPosts: getDismissedPosts(options.storage.key),
    });
  }, [mounted, options, posts]);

  useEffect(() => {
    if (!mounted || !options || initializedRef.current) return;

    const timer = setTimeout(() => {
      initializedRef.current = true;
      setToasts(newPosts.slice(0, options.toast.maxToasts));
    }, options.behavior.delay);

    return () => clearTimeout(timer);
  }, [mounted, options, newPosts]);

  const handleDismiss = useCallback(
    (postId: string) => {
      setToasts(prev => {
        const next = prev.filter(p => p.id !== postId);
        // Once the user has actually interacted, record this visit so stale
        // posts aren't re-shown next time.
        if (next.length === 0 && options) {
          updateLastVisit(options.storage.key);
        }
        return next;
      });
    },
    [options]
  );

  if (!mounted || toasts.length === 0 || !options) return null;

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
