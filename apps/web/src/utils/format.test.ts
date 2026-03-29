import { formatDate, formatRelativeTime, formatNumber, truncateText } from './format';

describe('format utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return relative time string', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBeTruthy();
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1234567)).toContain(',');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('truncateText', () => {
    it('should return original text if shorter than max length', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate text and add ellipsis', () => {
      const result = truncateText('Hello World', 5);
      expect(result.length).toBeLessThanOrEqual(8);
      expect(result).toContain('...');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });
});
