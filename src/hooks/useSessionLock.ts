import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionLockOptions {
  inactivityTimeout?: number; // milliseconds
  enabled?: boolean;
  lockOnLoad?: boolean; // Lock immediately on page load/refresh
  gracePeriod?: number; // Grace period after unlock before inactivity timer starts (ms)
  onLock?: (reason: 'inactivity' | 'tab_hidden' | 'manual' | 'page_refresh') => void;
  onUnlock?: () => void;
}

export const useSessionLock = ({
  inactivityTimeout = 60000, // 60 seconds default
  enabled = true,
  lockOnLoad = false,
  gracePeriod = 30000, // 30 seconds grace period after login/unlock
  onLock,
  onUnlock,
}: UseSessionLockOptions = {}) => {
  const [isLocked, setIsLocked] = useState(lockOnLoad && enabled);
  const [lockReason, setLockReason] = useState<'inactivity' | 'tab_hidden' | 'manual' | 'page_refresh' | null>(
    lockOnLoad && enabled ? 'page_refresh' : null
  );
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gracePeriodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasHiddenRef = useRef(false);
  const hasTriggeredInitialLock = useRef(false);

  const lock = useCallback((reason: 'inactivity' | 'tab_hidden' | 'manual' | 'page_refresh' = 'manual') => {
    if (!enabled) return;
    setIsLocked(true);
    setLockReason(reason);
    setIsInGracePeriod(false);
    onLock?.(reason);
  }, [enabled, onLock]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setLockReason(null);
    setLastActivity(Date.now());
    setIsInGracePeriod(true);
    
    // Start grace period - don't lock for inactivity during this time
    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
    }
    gracePeriodTimerRef.current = setTimeout(() => {
      setIsInGracePeriod(false);
    }, gracePeriod);
    
    onUnlock?.();
  }, [gracePeriod, onUnlock]);

  // Lock on page load/refresh
  useEffect(() => {
    if (enabled && lockOnLoad && !hasTriggeredInitialLock.current) {
      hasTriggeredInitialLock.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        lock('page_refresh');
      }, 100);
    }
  }, [enabled, lockOnLoad, lock]);

  const resetInactivityTimer = useCallback(() => {
    if (!enabled || isInGracePeriod) return;
    
    setLastActivity(Date.now());
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (!isLocked) {
      inactivityTimerRef.current = setTimeout(() => {
        lock('inactivity');
      }, inactivityTimeout);
    }
  }, [enabled, inactivityTimeout, isLocked, isInGracePeriod, lock]);

  // Handle visibility change (tab switch)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
      } else if (wasHiddenRef.current && !isInGracePeriod) {
        // Tab became visible again after being hidden (only lock if not in grace period)
        lock('tab_hidden');
        wasHiddenRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, isInGracePeriod, lock]);

  // Handle user activity for inactivity detection
  useEffect(() => {
    if (!enabled) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!isLocked && !isInGracePeriod) {
        resetInactivityTimer();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer only if not in grace period
    if (!isInGracePeriod) {
      resetInactivityTimer();
    }

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [enabled, isLocked, isInGracePeriod, resetInactivityTimer]);

  // Reset timer when unlocked (after grace period ends)
  useEffect(() => {
    if (!isLocked && enabled && !isInGracePeriod) {
      resetInactivityTimer();
    }
  }, [isLocked, enabled, isInGracePeriod, resetInactivityTimer]);

  // Cleanup grace period timer on unmount
  useEffect(() => {
    return () => {
      if (gracePeriodTimerRef.current) {
        clearTimeout(gracePeriodTimerRef.current);
      }
    };
  }, []);

  return {
    isLocked,
    lockReason,
    lock,
    unlock,
    lastActivity,
    resetInactivityTimer,
    isInGracePeriod,
  };
};
