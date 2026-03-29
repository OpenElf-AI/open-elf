const PREFIX = 'open-elf';

export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(`${PREFIX}-${key}`);
      return item ? JSON.parse(item) : (defaultValue ?? null);
    } catch {
      return defaultValue ?? null;
    }
  },

  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(`${PREFIX}-${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(`${PREFIX}-${key}`);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};
