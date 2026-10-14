import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const themePath = fileURLToPath(new URL('../dist/theme', import.meta.url));

for (const [format, load] of [
  ['ESM', () => import('docusaurus-plugin-new-post-toast')],
  ['CommonJS', () => require('docusaurus-plugin-new-post-toast')],
]) {
  test(`${format} package loads with a usable theme and diagnostic helper`, async () => {
    const entry = await load();
    assert.equal(typeof entry.default, 'function');
    assert.equal('validateOptions' in entry, false);
    assert.equal(entry.validatePluginConfig({}).valid, true);
    assert.equal(entry.validatePluginConfig({ toast: { position: 'invalid' } }).valid, false);

    const plugin = entry.default({}, {});
    assert.equal(plugin.name, 'docusaurus-plugin-new-post-toast');
    assert.equal(plugin.getThemePath(), themePath);
    assert.ok(existsSync(plugin.getThemePath()));

    const manifests = [];
    const globalData = [];
    await plugin.allContentLoaded({
      allContent: { 'docusaurus-plugin-content-blog': { default: { blogPosts: [] } } },
      actions: {
        createData: async (name, data) => manifests.push([name, data]),
        setGlobalData: data => globalData.push(data),
      },
    });
    assert.deepEqual(manifests, [['posts-manifest.json', '[]']]);
    assert.equal(globalData[0].options.blog.pluginId, 'default');
  });
}
