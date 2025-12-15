import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

export type StarterRemarkPluginOptions = {
  /**
   * Matches text nodes that contain this marker. Defaults to 'TODO'.
   */
  marker?: string;
  /**
   * Replacement text for the marker. Defaults to turning `TODO` into `✅ TODO`.
   */
  replacement?: string;
};

/**
 * A tiny remark plugin provided as an example for the starter template.
 *
 * The plugin looks for text nodes that contain a configurable marker (default `TODO`)
 * and prefixes them with a replacement string. This is intentionally simple – swap
 * the implementation with whatever behaviour your plugin needs.
 */
export const starterRemarkPlugin: Plugin<[StarterRemarkPluginOptions?]> = (options = {}) => {
  const marker = options.marker ?? 'TODO';
  const replacement = options.replacement ?? '✅ TODO';

  return tree => {
    visit(tree, 'text', (node: any) => {
      if (typeof node.value !== 'string') return;
      if (!node.value.includes(marker)) return;

      node.value = node.value.replaceAll(marker, replacement);
    });
  };
};

/**
 * Convenience helper so the plugin can be configured succinctly from Docusaurus config.
 */
export function createStarterRemarkPlugin(options?: StarterRemarkPluginOptions) {
  return [starterRemarkPlugin, options ?? {}] as const;
}
