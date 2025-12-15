import pluginStarterModule from '../src/index.ts';

const pluginStarter = pluginStarterModule.default || pluginStarterModule;

describe('pluginStarter', () => {
  const context = { siteDir: '/tmp' };

  it('returns a plugin with the expected name', () => {
    const plugin = pluginStarter(context, {});
    expect(plugin.name).toBe('docusaurus-plugin-starter');
  });

  it('skips work when disabled', async () => {
    const plugin = pluginStarter(context, { enabled: false });
    expect(await plugin.loadContent()).toBeUndefined();
    expect(plugin.getClientModules()).toEqual([]);
  });

  it('loads starter content using defaults', async () => {
    const plugin = pluginStarter(context, {});
    const content = await plugin.loadContent();

    expect(content).toEqual({
      greeting: 'Hello from plugin-starter!',
      routePath: '/starter',
    });
  });

  it('wires contentLoaded helpers', async () => {
    const plugin = pluginStarter(context, { greetingMessage: 'Hi' });
    const content = await plugin.loadContent();
    const createData = jest.fn(() => Promise.resolve('/generated/data.json'));
    const addRoute = jest.fn();
    const setGlobalData = jest.fn();

    await plugin.contentLoaded({
      content,
      actions: { createData, addRoute, setGlobalData },
    });

    expect(createData).toHaveBeenCalledWith('starter-data.json', expect.stringContaining('"Hi"'));
    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/starter',
        exact: true,
      })
    );
    expect(setGlobalData).toHaveBeenCalledWith(content);
  });

  it('resolves client module and theme paths', () => {
    const plugin = pluginStarter(context, {});
    expect(plugin.getClientModules()[0]).toContain('client/index.js');
    expect(plugin.getThemePath()).toContain('theme');
  });
});
