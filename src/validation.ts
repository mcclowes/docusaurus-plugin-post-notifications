import type { NewPostToastOptions } from './types.js';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const VALID_POSITIONS = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
  'bottom-center',
  'top-center',
] as const;

/**
 * Custom error class for plugin validation errors
 * Provides detailed error messages for debugging
 */
export class PluginValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = formatValidationErrors(errors);
    super(message);
    this.name = 'PluginValidationError';
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PluginValidationError);
    }
  }
}

/**
 * Validates plugin options
 *
 * @param options - The options to validate
 * @param opts - Validation behavior options
 * @param opts.throwOnError - If true, throws an error on validation failure (default: false)
 * @returns Validation result with errors and warnings
 */
export function validateOptions(
  options: NewPostToastOptions,
  opts: { throwOnError?: boolean } = {}
): ValidationResult {
  const { throwOnError = false } = opts;
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate toast options
  if (options.toast) {
    // Validate position
    if (options.toast.position !== undefined) {
      if (!VALID_POSITIONS.includes(options.toast.position as (typeof VALID_POSITIONS)[number])) {
        errors.push({
          field: 'toast.position',
          message: `Invalid position "${options.toast.position}". Must be one of: ${VALID_POSITIONS.join(', ')}`,
          value: options.toast.position,
        });
      }
    }

    // Validate duration
    if (options.toast.duration !== undefined) {
      if (typeof options.toast.duration !== 'number') {
        errors.push({
          field: 'toast.duration',
          message: `Duration must be a number, got ${typeof options.toast.duration}`,
          value: options.toast.duration,
        });
      } else if (options.toast.duration < 0) {
        errors.push({
          field: 'toast.duration',
          message: 'Duration cannot be negative',
          value: options.toast.duration,
        });
      }
    }

    // Validate maxToasts
    if (options.toast.maxToasts !== undefined) {
      if (typeof options.toast.maxToasts !== 'number') {
        errors.push({
          field: 'toast.maxToasts',
          message: `maxToasts must be a number, got ${typeof options.toast.maxToasts}`,
          value: options.toast.maxToasts,
        });
      } else if (options.toast.maxToasts < 1) {
        errors.push({
          field: 'toast.maxToasts',
          message: 'maxToasts must be at least 1',
          value: options.toast.maxToasts,
        });
      } else if (options.toast.maxToasts > 10) {
        warnings.push({
          field: 'toast.maxToasts',
          message: 'maxToasts greater than 10 may cause performance issues',
          value: options.toast.maxToasts,
        });
      }
    }
  }

  // Validate behavior options
  if (options.behavior) {
    // Validate maxAgeDays
    if (options.behavior.maxAgeDays !== undefined) {
      if (typeof options.behavior.maxAgeDays !== 'number') {
        errors.push({
          field: 'behavior.maxAgeDays',
          message: `maxAgeDays must be a number, got ${typeof options.behavior.maxAgeDays}`,
          value: options.behavior.maxAgeDays,
        });
      } else if (options.behavior.maxAgeDays < 1) {
        errors.push({
          field: 'behavior.maxAgeDays',
          message: 'maxAgeDays must be at least 1',
          value: options.behavior.maxAgeDays,
        });
      }
    }

    // Validate delay
    if (options.behavior.delay !== undefined) {
      if (typeof options.behavior.delay !== 'number') {
        errors.push({
          field: 'behavior.delay',
          message: `delay must be a number, got ${typeof options.behavior.delay}`,
          value: options.behavior.delay,
        });
      } else if (options.behavior.delay < 0) {
        errors.push({
          field: 'behavior.delay',
          message: 'delay cannot be negative',
          value: options.behavior.delay,
        });
      }
    }

    // Validate excludePaths
    if (options.behavior.excludePaths !== undefined) {
      if (!Array.isArray(options.behavior.excludePaths)) {
        errors.push({
          field: 'behavior.excludePaths',
          message: `excludePaths must be an array, got ${typeof options.behavior.excludePaths}`,
          value: options.behavior.excludePaths,
        });
      } else {
        options.behavior.excludePaths.forEach((path, index) => {
          if (typeof path !== 'string') {
            errors.push({
              field: `behavior.excludePaths[${index}]`,
              message: `Path must be a string, got ${typeof path}`,
              value: path,
            });
          } else if (!path.startsWith('/')) {
            warnings.push({
              field: `behavior.excludePaths[${index}]`,
              message: `Path "${path}" should start with /`,
              value: path,
            });
          }
        });
      }
    }
  }

  // Validate storage options
  if (options.storage) {
    // Validate key
    if (options.storage.key !== undefined) {
      if (typeof options.storage.key !== 'string') {
        errors.push({
          field: 'storage.key',
          message: `storage key must be a string, got ${typeof options.storage.key}`,
          value: options.storage.key,
        });
      } else if (options.storage.key.trim() === '') {
        errors.push({
          field: 'storage.key',
          message: 'storage key cannot be empty',
          value: options.storage.key,
        });
      }
    }
  }

  // Validate blog options
  if (options.blog) {
    // Validate path
    if (options.blog.path !== undefined) {
      if (typeof options.blog.path !== 'string') {
        errors.push({
          field: 'blog.path',
          message: `blog path must be a string, got ${typeof options.blog.path}`,
          value: options.blog.path,
        });
      } else if (!options.blog.path.startsWith('/')) {
        warnings.push({
          field: 'blog.path',
          message: `blog path "${options.blog.path}" should start with /`,
          value: options.blog.path,
        });
      }
    }

    // Validate pluginId
    if (options.blog.pluginId !== undefined) {
      if (typeof options.blog.pluginId !== 'string') {
        errors.push({
          field: 'blog.pluginId',
          message: `blog pluginId must be a string, got ${typeof options.blog.pluginId}`,
          value: options.blog.pluginId,
        });
      }
    }
  }

  if (throwOnError && errors.length > 0) {
    throw new PluginValidationError(errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Formats validation errors into a readable string
 *
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No validation errors';
  }

  const header = `[new-post-toast] Plugin options validation failed with ${errors.length} error${errors.length > 1 ? 's' : ''}:`;
  const errorList = errors
    .map((err, index) => {
      let msg = `  ${index + 1}. [${err.field}] ${err.message}`;
      if (err.value !== undefined) {
        const valueStr =
          typeof err.value === 'object' ? JSON.stringify(err.value) : String(err.value);
        const truncated = valueStr.length > 50 ? valueStr.substring(0, 50) + '...' : valueStr;
        msg += ` (got: ${truncated})`;
      }
      return msg;
    })
    .join('\n');

  return `${header}\n${errorList}`;
}

/**
 * Logs validation warnings to console
 *
 * @param warnings - Array of validation warnings
 */
export function logValidationWarnings(warnings: ValidationError[]): void {
  if (warnings.length === 0) return;

  console.warn(
    `[new-post-toast] Plugin options have ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`
  );
  warnings.forEach(warn => {
    console.warn(`  - [${warn.field}] ${warn.message}`);
  });
}
