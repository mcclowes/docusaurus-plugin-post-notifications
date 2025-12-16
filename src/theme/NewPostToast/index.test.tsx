import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Docusaurus hooks
jest.mock('@docusaurus/useGlobalData', () => ({
  usePluginData: jest.fn(),
}));

jest.mock('@docusaurus/Link', () => {
  return function MockLink({ children, to, ...props }: { children: React.ReactNode; to: string }) {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  };
});

// Mock the storage and comparison utilities
jest.mock('../../client/storage', () => ({
  addDismissedPost: jest.fn(),
  getLastVisit: jest.fn(() => '2025-01-01T00:00:00.000Z'),
  updateLastVisit: jest.fn(),
  getDismissedPosts: jest.fn(() => []),
}));

jest.mock('../../client/comparison', () => ({
  getNewPosts: jest.fn(() => []),
  shouldExcludePath: jest.fn(() => false),
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
}));

import NewPostToastContainer from './index';
import { usePluginData } from '@docusaurus/useGlobalData';
import { getNewPosts, shouldExcludePath } from '../../client/comparison';
import { addDismissedPost } from '../../client/storage';

const mockUsePluginData = usePluginData as jest.Mock;
const mockGetNewPosts = getNewPosts as jest.Mock;
const mockShouldExcludePath = shouldExcludePath as jest.Mock;
const mockAddDismissedPost = addDismissedPost as jest.Mock;

describe('NewPostToastContainer', () => {
  const mockPluginData = {
    posts: [
      {
        id: 'post-1',
        title: 'Test Post 1',
        description: 'Test description',
        permalink: '/blog/post-1',
        date: '2025-01-15T00:00:00.000Z',
      },
      {
        id: 'post-2',
        title: 'Test Post 2',
        description: 'Another description',
        permalink: '/blog/post-2',
        date: '2025-01-10T00:00:00.000Z',
      },
    ],
    options: {
      toast: {
        position: 'bottom-right',
        duration: 0, // Disable auto-dismiss for tests
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
        delay: 0, // No delay for tests
      },
      storage: {
        key: 'test-storage-key',
        trackDismissed: true,
      },
      blog: {
        pluginId: 'default',
        path: '/blog',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePluginData.mockReturnValue(mockPluginData);
    mockGetNewPosts.mockReturnValue(mockPluginData.posts);
    mockShouldExcludePath.mockReturnValue(false);
  });

  it('renders nothing when no new posts', () => {
    mockGetNewPosts.mockReturnValue([]);
    const { container } = render(<NewPostToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when plugin data is not available', () => {
    mockUsePluginData.mockReturnValue(undefined);
    const { container } = render(<NewPostToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toast notifications for new posts', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('shows post description when showDescription is true', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('hides post description when showDescription is false', async () => {
    mockUsePluginData.mockReturnValue({
      ...mockPluginData,
      options: {
        ...mockPluginData.options,
        toast: {
          ...mockPluginData.options.toast,
          showDescription: false,
        },
      },
    });

    render(<NewPostToastContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('dismisses toast when close button is clicked', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByLabelText('Dismiss notification');
    fireEvent.click(closeButtons[0]);

    // Wait for animation
    await waitFor(
      () => {
        expect(mockAddDismissedPost).toHaveBeenCalledWith('post-1', 'test-storage-key');
      },
      { timeout: 500 }
    );
  });

  it('renders with correct position class', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const container = alerts[0].parentElement;
      expect(container).toHaveClass('bottomRight');
    });
  });

  it('limits toasts to maxToasts setting', async () => {
    const manyPosts = [
      ...mockPluginData.posts,
      {
        id: 'post-3',
        title: 'Test Post 3',
        permalink: '/blog/post-3',
        date: '2025-01-05T00:00:00.000Z',
      },
      {
        id: 'post-4',
        title: 'Test Post 4',
        permalink: '/blog/post-4',
        date: '2025-01-01T00:00:00.000Z',
      },
    ];

    mockGetNewPosts.mockReturnValue(manyPosts);

    render(<NewPostToastContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    // Should only show 3 toasts (maxToasts setting)
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
  });

  it('renders "Read now" link with correct href', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      const readLinks = screen.getAllByText('Read now →');
      expect(readLinks[0]).toHaveAttribute('href', '/blog/post-1');
    });
  });

  it('renders "New Post" badge', async () => {
    render(<NewPostToastContainer />);

    await waitFor(() => {
      const badges = screen.getAllByText('New Post');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
