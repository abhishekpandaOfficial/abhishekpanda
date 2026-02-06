import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSoundNotification } from "./useSoundNotification";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  reason: string;
  intent: string;
  created_at: string;
}

interface Notification {
  id: string;
  type: "contact_request";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: ContactRequest;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { playNotificationSound, soundEnabled, toggleSound, volume, setVolume } = useSoundNotification();

  useEffect(() => {
    // Subscribe to new contact requests
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_requests",
        },
        (payload) => {
          const newRequest = payload.new as ContactRequest;
          
          const notification: Notification = {
            id: newRequest.id,
            type: "contact_request",
            title: "New Contact Request",
            message: `${newRequest.name} wants to connect for ${newRequest.reason}`,
            timestamp: newRequest.created_at,
            read: false,
            data: newRequest,
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);

          // Play notification sound
          playNotificationSound();

          // Show toast notification
          toast.info(`New contact request from ${newRequest.name}`, {
            description: newRequest.reason,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = "/admin/contacts";
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playNotificationSound]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    soundEnabled,
    toggleSound,
    volume,
    setVolume,
  };
};
