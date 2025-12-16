import { getNewPosts, shouldExcludePath, formatDate } from '../src/client/comparison.ts';

// Mock the storage module
jest.mock('../src/client/storage.ts', () => ({
  getDismissedPosts: jest.fn(() => []),
}));

import { getDismissedPosts } from '../src/client/storage.ts';

describe('getNewPosts', () => {
  const defaultOptions = {
    behavior: {
      showOnFirstVisit: false,
      maxAgeDays: 30,
      excludePaths: [],
      onlyOnBlogPages: false,
      delay: 1000,
    },
    storage: {
      key: 'test-storage-key',
      trackDismissed: true,
    },
  };

  // Use dates relative to a fixed "now" for testing
  const mockNow = new Date('2025-01-20T12:00:00.000Z');

  const posts = [
    { id: 'post-1', title: 'Post 1', permalink: '/blog/post-1', date: '2025-01-15T00:00:00.000Z' },
    { id: 'post-2', title: 'Post 2', permalink: '/blog/post-2', date: '2025-01-10T00:00:00.000Z' },
    { id: 'post-3', title: 'Post 3', permalink: '/blog/post-3', date: '2025-01-05T00:00:00.000Z' },
  ];

  beforeEach(() => {
    getDismissedPosts.mockReturnValue([]);
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns posts newer than lastVisit', () => {
    const lastVisit = '2025-01-08T00:00:00.000Z';
    const result = getNewPosts({ posts, lastVisit, options: defaultOptions });

    expect(result).toHaveLength(2);
    expect(result.map(p => p.id)).toEqual(['post-1', 'post-2']);
  });

  it('returns empty array for first visit when showOnFirstVisit is false', () => {
    const result = getNewPosts({ posts, lastVisit: null, options: defaultOptions });
    expect(result).toEqual([]);
  });

  it('returns posts for first visit when showOnFirstVisit is true', () => {
    const options = {
      ...defaultOptions,
      behavior: { ...defaultOptions.behavior, showOnFirstVisit: true },
    };
    const result = getNewPosts({ posts, lastVisit: null, options });

    expect(result.length).toBeGreaterThan(0);
  });

  it('excludes dismissed posts', () => {
    getDismissedPosts.mockReturnValue(['post-1']);
    const lastVisit = '2025-01-08T00:00:00.000Z';
    const result = getNewPosts({ posts, lastVisit, options: defaultOptions });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('post-2');
  });

  it('respects maxAgeDays filter', () => {
    const options = {
      ...defaultOptions,
      behavior: { ...defaultOptions.behavior, maxAgeDays: 10 },
    };

    const lastVisit = '2025-01-01T00:00:00.000Z';
    const result = getNewPosts({ posts, lastVisit, options });

    // With mockNow at Jan 20 and maxAgeDays=10, cutoff is Jan 10 (midnight)
    // Posts must be strictly newer than cutoff, so:
    // - post-1 (Jan 15) passes
    // - post-2 (Jan 10 at midnight) equals cutoff, so fails (not strictly >)
    // - post-3 (Jan 5) fails
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('post-1');
  });

  it('ignores dismissed posts when trackDismissed is false', () => {
    getDismissedPosts.mockReturnValue(['post-1']);
    const options = {
      ...defaultOptions,
      storage: { ...defaultOptions.storage, trackDismissed: false },
    };
    const lastVisit = '2025-01-08T00:00:00.000Z';
    const result = getNewPosts({ posts, lastVisit, options });

    // Should include post-1 since trackDismissed is false
    expect(result).toHaveLength(2);
    expect(result.map(p => p.id)).toEqual(['post-1', 'post-2']);
  });
});

describe('shouldExcludePath', () => {
  const defaultOptions = {
    behavior: {
      excludePaths: [],
      onlyOnBlogPages: false,
    },
    blog: {
      path: '/blog',
    },
  };

  it('returns false for paths not in excludePaths', () => {
    expect(shouldExcludePath('/blog/post', defaultOptions)).toBe(false);
  });

  it('returns true for paths in excludePaths', () => {
    const options = {
      ...defaultOptions,
      behavior: { ...defaultOptions.behavior, excludePaths: ['/search', '/404'] },
    };

    expect(shouldExcludePath('/search', options)).toBe(true);
    expect(shouldExcludePath('/404', options)).toBe(true);
    expect(shouldExcludePath('/blog/post', options)).toBe(false);
  });

  it('excludes non-blog pages when onlyOnBlogPages is true', () => {
    const options = {
      ...defaultOptions,
      behavior: { ...defaultOptions.behavior, onlyOnBlogPages: true },
    };

    expect(shouldExcludePath('/docs/intro', options)).toBe(true);
    expect(shouldExcludePath('/', options)).toBe(true);
    expect(shouldExcludePath('/blog/post', options)).toBe(false);
    expect(shouldExcludePath('/blog', options)).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2025-01-15T00:00:00.000Z');
    // The exact format depends on locale, but it should contain the year and month
    expect(result).toContain('2025');
    expect(result).toMatch(/Jan|January/);
  });
});
