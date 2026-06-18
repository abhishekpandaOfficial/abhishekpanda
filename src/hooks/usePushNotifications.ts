import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
    
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      // Check current permission state
      const isEnabled = Notification.permission === 'granted';
      setState(prev => ({ ...prev, isEnabled }));
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      const isEnabled = permission === 'granted';
      
      setState(prev => ({ 
        ...prev, 
        isEnabled, 
        isLoading: false,
        error: permission === 'denied' ? 'Notification permission denied' : null
      }));

      return isEnabled;
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to request permission' 
      }));
      return false;
    }
  }, [state.isSupported]);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !state.isEnabled) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState(prev => ({ ...prev, isLoading: false }));
        return true;
      }

      // Create new subscription
      // Note: In production, you'd need a VAPID key from your server
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey would be set here with VAPID public key
      });

      // Save subscription to backend
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Store subscription endpoint for later use
        localStorage.setItem('push_subscription', JSON.stringify(subscription));
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (err) {
      console.error('Push subscription error:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to subscribe to push notifications' 
      }));
      return false;
    }
  }, [state.isSupported, state.isEnabled]);

  const unsubscribeFromPush = useCallback(async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem('push_subscription');
      }

      setState(prev => ({ ...prev, isEnabled: false }));
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!state.isEnabled) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const options: NotificationOptions & { actions?: any[]; data?: any } = {
        body: 'This is a test notification from the Admin Command Center.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
        requireInteraction: true,
        data: {
          type: 'test',
          timestamp: Date.now()
        }
      };

      await registration.showNotification('Security Alert Test', options);
    } catch (err) {
      console.error('Test notification error:', err);
    }
  }, [state.isEnabled]);

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  };
};

// Helper function to show security alert notifications
export const showSecurityNotification = async (alert: {
  title: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  data?: Record<string, any>;
}): Promise<void> => {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const options: NotificationOptions & { data?: any } = {
      body: alert.message,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `security-alert-${Date.now()}`,
      requireInteraction: alert.type === 'error',
      data: {
        type: alert.type,
        ...alert.data,
        timestamp: Date.now()
      }
    };

    await registration.showNotification(alert.title, options);
  } catch (err) {
    console.error('Security notification error:', err);
  }
};