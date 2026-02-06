import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const trigger = useCallback((type: HapticType = 'medium') => {
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [30, 50, 30],
      warning: [50, 30, 50],
      error: [100, 50, 100, 50, 100],
      selection: 15,
    };

    vibrate(patterns[type]);
  }, [vibrate]);

  const triggerSuccess = useCallback(() => {
    trigger('success');
  }, [trigger]);

  const triggerError = useCallback(() => {
    trigger('error');
  }, [trigger]);

  const triggerWarning = useCallback(() => {
    trigger('warning');
  }, [trigger]);

  const triggerSelection = useCallback(() => {
    trigger('selection');
  }, [trigger]);

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return {
    trigger,
    triggerSuccess,
    triggerError,
    triggerWarning,
    triggerSelection,
    vibrate,
    isSupported,
  };
};
