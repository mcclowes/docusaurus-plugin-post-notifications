import pluginModule from '../src/index.ts';

const pluginNewPostToast = pluginModule.default || pluginModule;

describe('pluginNewPostToast', () => {
  const context = { siteDir: '/tmp' };

  it('returns a plugin with the expected name', () => {
    const plugin = pluginNewPostToast(context, {});
    expect(plugin.name).toBe('docusaurus-plugin-new-post-toast');
  });

  it('skips client modules when disabled', () => {
    const plugin = pluginNewPostToast(context, { enabled: false });
    expect(plugin.getClientModules()).toEqual([]);
  });

  it('provides client modules when enabled', () => {
    const plugin = pluginNewPostToast(context, { enabled: true });
    expect(plugin.getClientModules()[0]).toContain('client/index.js');
  });

  it('resolves theme path', () => {
    const plugin = pluginNewPostToast(context, {});
    expect(plugin.getThemePath()).toContain('theme');
  });

  it('handles contentLoaded with missing blog content gracefully', async () => {
    const plugin = pluginNewPostToast(context, {});
    const createData = jest.fn(() => Promise.resolve('/generated/data.json'));
    const setGlobalData = jest.fn();

    // Simulate contentLoaded with no blog content
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await plugin.contentLoaded({
      allContent: {},
      actions: { createData, setGlobalData },
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Blog plugin content not found')
    );
    expect(createData).not.toHaveBeenCalled();
    expect(setGlobalData).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('extracts blog posts and sets global data', async () => {
    const plugin = pluginNewPostToast(context, {});
    const createData = jest.fn(() => Promise.resolve('/generated/posts-manifest.json'));
    const setGlobalData = jest.fn();

    const mockBlogContent = {
      'docusaurus-plugin-content-blog': {
        default: {
          blogPosts: [
            {
              id: 'post-1',
              metadata: {
                title: 'Test Post 1',
                description: 'A test post',
                permalink: '/blog/post-1',
                date: '2025-01-15T00:00:00.000Z',
                tags: [{ label: 'test' }],
                frontMatter: { image: '/img/test.png' },
              },
            },
            {
              id: 'post-2',
              metadata: {
                title: 'Test Post 2',
                description: 'Another test post',
                permalink: '/blog/post-2',
                date: '2025-01-10T00:00:00.000Z',
                tags: [],
              },
            },
          ],
        },
      },
    };

    await plugin.contentLoaded({
      allContent: mockBlogContent,
      actions: { createData, setGlobalData },
    });

    expect(createData).toHaveBeenCalledWith(
      'posts-manifest.json',
      expect.stringContaining('post-1')
    );

    expect(setGlobalData).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: expect.arrayContaining([
          expect.objectContaining({
            id: 'post-1',
            title: 'Test Post 1',
            permalink: '/blog/post-1',
          }),
        ]),
        options: expect.objectContaining({
          toast: expect.any(Object),
          behavior: expect.any(Object),
          storage: expect.any(Object),
          blog: expect.any(Object),
        }),
      })
    );
  });

  it('sorts posts by date descending', async () => {
    const plugin = pluginNewPostToast(context, {});
    const createData = jest.fn(() => Promise.resolve('/generated/posts-manifest.json'));
    const setGlobalData = jest.fn();

    const mockBlogContent = {
      'docusaurus-plugin-content-blog': {
        default: {
          blogPosts: [
            {
              id: 'older-post',
              metadata: {
                title: 'Older Post',
                permalink: '/blog/older-post',
                date: '2025-01-01T00:00:00.000Z',
              },
            },
            {
              id: 'newer-post',
              metadata: {
                title: 'Newer Post',
                permalink: '/blog/newer-post',
                date: '2025-01-15T00:00:00.000Z',
              },
            },
          ],
        },
      },
    };

    await plugin.contentLoaded({
      allContent: mockBlogContent,
      actions: { createData, setGlobalData },
    });

    const globalDataCall = setGlobalData.mock.calls[0][0];
    expect(globalDataCall.posts[0].id).toBe('newer-post');
    expect(globalDataCall.posts[1].id).toBe('older-post');
  });
});
