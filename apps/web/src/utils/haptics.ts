type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const hapticFeedback = {
  trigger: (type: HapticFeedbackType = 'light'): void => {
    if (typeof navigator === 'undefined') return;
    
    try {
      if ('vibrate' in navigator) {
        const patterns: Record<HapticFeedbackType, number | number[]> = {
          light: 10,
          medium: 20,
          heavy: 40,
          success: [10, 50, 10],
          warning: [30, 50, 30, 50, 30],
          error: [50, 30, 50, 30, 50, 30, 50],
        };
        
        const pattern = patterns[type];
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.debug('Haptic feedback not supported');
    }
  },

  light: () => hapticFeedback.trigger('light'),
  medium: () => hapticFeedback.trigger('medium'),
  heavy: () => hapticFeedback.trigger('heavy'),
  success: () => hapticFeedback.trigger('success'),
  warning: () => hapticFeedback.trigger('warning'),
  error: () => hapticFeedback.trigger('error'),
};

export const useHapticFeedback = () => {
  return React.useMemo(() => hapticFeedback, []);
};

import React from 'react';
