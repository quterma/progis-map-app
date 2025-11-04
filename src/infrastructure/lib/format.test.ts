import { describe, it, expect, vi, afterEach } from 'vitest';
import { titleCase, handleMapError } from './format';

describe('format utilities', () => {
  describe('titleCase', () => {
    it('should convert lowercase to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      expect(titleCase('')).toBe('');
    });

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });

    it('should handle mixed case', () => {
      expect(titleCase('hELLo WoRLd')).toBe('Hello World');
    });

    it('should handle special characters', () => {
      // Функция заменяет _ и - на пробелы
      expect(titleCase('hello-world_test')).toBe('Hello World Test');
    });
  });

  describe('handleMapError', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    afterEach(() => {
      consoleSpy.mockClear();
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      handleMapError(error, 'test context');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Leaflet: failed to test context',
        { error: 'Test error', context: 'test context' },
      );
    });

    it('should not log when silent is true', () => {
      const error = new Error('Test error');
      handleMapError(error, 'test context', true);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle string errors', () => {
      handleMapError('String error', 'test context');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Leaflet: failed to test context',
        { error: 'String error', context: 'test context' },
      );
    });

    it('should handle null/undefined errors', () => {
      handleMapError(null, 'test context');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Leaflet: failed to test context',
        { error: 'null', context: 'test context' },
      );
    });
  });
});
