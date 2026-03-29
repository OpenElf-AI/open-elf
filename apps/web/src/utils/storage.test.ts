import { storage } from './storage';

describe('storage utility', () => {
  const TEST_KEY = 'test-key';
  const TEST_VALUE = { name: 'test', value: 123 };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('get', () => {
    it('should return null when key does not exist', () => {
      expect(storage.get('non-existent')).toBeNull();
    });

    it('should return default value when key does not exist', () => {
      expect(storage.get('non-existent', 'default')).toBe('default');
    });

    it('should return parsed value when key exists', () => {
      localStorage.setItem('open-elf-test-key', JSON.stringify(TEST_VALUE));
      expect(storage.get(TEST_KEY)).toEqual(TEST_VALUE);
    });

    it('should return default value when parsing fails', () => {
      localStorage.setItem('open-elf-test-key', 'invalid-json');
      expect(storage.get(TEST_KEY, 'fallback')).toBe('fallback');
    });
  });

  describe('set', () => {
    it('should store value in localStorage', () => {
      storage.set(TEST_KEY, TEST_VALUE);
      const stored = localStorage.getItem('open-elf-test-key');
      expect(JSON.parse(stored!)).toEqual(TEST_VALUE);
    });

    it('should handle storage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => storage.set(TEST_KEY, TEST_VALUE)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('remove', () => {
    it('should remove value from localStorage', () => {
      localStorage.setItem('open-elf-test-key', JSON.stringify(TEST_VALUE));
      storage.remove(TEST_KEY);
      expect(localStorage.getItem('open-elf-test-key')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all prefixed keys', () => {
      localStorage.setItem('open-elf-key1', 'value1');
      localStorage.setItem('open-elf-key2', 'value2');
      localStorage.setItem('other-key', 'value3');

      storage.clear();

      expect(localStorage.getItem('open-elf-key1')).toBeNull();
      expect(localStorage.getItem('open-elf-key2')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('value3');
    });
  });
});
