import {
  validateOptions,
  PluginValidationError,
  formatValidationErrors,
} from '../src/validation.ts';

describe('validateOptions', () => {
  it('returns valid for empty options', () => {
    const result = validateOptions({});
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for correct options', () => {
    const result = validateOptions({
      toast: {
        position: 'bottom-right',
        duration: 5000,
        maxToasts: 3,
      },
      behavior: {
        maxAgeDays: 30,
        delay: 1000,
        excludePaths: ['/search', '/404'],
      },
      storage: {
        key: 'my-storage-key',
      },
      blog: {
        path: '/blog',
        pluginId: 'default',
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  describe('toast options validation', () => {
    it('rejects invalid position', () => {
      const result = validateOptions({
        toast: { position: 'invalid-position' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('toast.position');
    });

    it('rejects negative duration', () => {
      const result = validateOptions({
        toast: { duration: -100 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('toast.duration');
    });

    it('accepts zero duration (no auto-dismiss)', () => {
      const result = validateOptions({
        toast: { duration: 0 },
      });

      expect(result.valid).toBe(true);
    });

    it('rejects maxToasts less than 1', () => {
      const result = validateOptions({
        toast: { maxToasts: 0 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('toast.maxToasts');
    });

    it('warns for maxToasts greater than 10', () => {
      const result = validateOptions({
        toast: { maxToasts: 15 },
      });

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('toast.maxToasts');
    });
  });

  describe('behavior options validation', () => {
    it('rejects maxAgeDays less than 1', () => {
      const result = validateOptions({
        behavior: { maxAgeDays: 0 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('behavior.maxAgeDays');
    });

    it('rejects negative delay', () => {
      const result = validateOptions({
        behavior: { delay: -500 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('behavior.delay');
    });

    it('rejects non-array excludePaths', () => {
      const result = validateOptions({
        behavior: { excludePaths: '/search' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('behavior.excludePaths');
    });

    it('rejects non-string items in excludePaths', () => {
      const result = validateOptions({
        behavior: { excludePaths: ['/search', 123, '/404'] },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('behavior.excludePaths[1]');
    });

    it('warns for paths not starting with /', () => {
      const result = validateOptions({
        behavior: { excludePaths: ['search'] },
      });

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('behavior.excludePaths[0]');
    });
  });

  describe('storage options validation', () => {
    it('rejects non-string key', () => {
      const result = validateOptions({
        storage: { key: 123 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('storage.key');
    });

    it('rejects empty string key', () => {
      const result = validateOptions({
        storage: { key: '   ' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('storage.key');
    });
  });

  describe('blog options validation', () => {
    it('warns for path not starting with /', () => {
      const result = validateOptions({
        blog: { path: 'blog' },
      });

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('blog.path');
    });

    it('rejects non-string pluginId', () => {
      const result = validateOptions({
        blog: { pluginId: 123 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('blog.pluginId');
    });
  });

  describe('throwOnError option', () => {
    it('throws PluginValidationError when throwOnError is true', () => {
      expect(() => {
        validateOptions({ toast: { position: 'invalid' } }, { throwOnError: true });
      }).toThrow(PluginValidationError);
    });

    it('does not throw when throwOnError is false', () => {
      expect(() => {
        validateOptions({ toast: { position: 'invalid' } }, { throwOnError: false });
      }).not.toThrow();
    });
  });
});

describe('PluginValidationError', () => {
  it('contains errors array', () => {
    const errors = [{ field: 'test', message: 'test error' }];
    const error = new PluginValidationError(errors);

    expect(error.errors).toEqual(errors);
    expect(error.name).toBe('PluginValidationError');
  });

  it('has formatted message', () => {
    const errors = [{ field: 'test', message: 'test error' }];
    const error = new PluginValidationError(errors);

    expect(error.message).toContain('test error');
    expect(error.message).toContain('[test]');
  });
});

describe('formatValidationErrors', () => {
  it('returns "No validation errors" for empty array', () => {
    expect(formatValidationErrors([])).toBe('No validation errors');
  });

  it('formats single error', () => {
    const result = formatValidationErrors([
      { field: 'toast.position', message: 'Invalid position' },
    ]);

    expect(result).toContain('1 error');
    expect(result).toContain('[toast.position]');
    expect(result).toContain('Invalid position');
  });

  it('formats multiple errors', () => {
    const result = formatValidationErrors([
      { field: 'toast.position', message: 'Invalid position' },
      { field: 'toast.duration', message: 'Must be positive' },
    ]);

    expect(result).toContain('2 errors');
    expect(result).toContain('[toast.position]');
    expect(result).toContain('[toast.duration]');
  });

  it('includes truncated value when present', () => {
    const result = formatValidationErrors([{ field: 'test', message: 'Error', value: 'short' }]);

    expect(result).toContain('(got: short)');
  });

  it('truncates long values', () => {
    const longValue = 'a'.repeat(100);
    const result = formatValidationErrors([{ field: 'test', message: 'Error', value: longValue }]);

    expect(result).toContain('...');
    expect(result.length).toBeLessThan(longValue.length + 100);
  });
});
