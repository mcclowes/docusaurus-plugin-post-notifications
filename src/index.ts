export { default } from './plugin.js';
export type {
  NewPostToastOptions,
  ResolvedNewPostToastOptions,
  BlogPostMetadata,
  NewPostToastGlobalData,
  StorageData,
  ToastPosition,
} from './types.js';
export { resolveOptions, DEFAULT_OPTIONS } from './options.js';
export {
  validateOptions as validatePluginConfig,
  PluginValidationError,
  formatValidationErrors,
  logValidationWarnings,
  type ValidationError,
  type ValidationResult,
} from './validation.js';
