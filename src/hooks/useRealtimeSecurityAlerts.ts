import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { showSecurityNotification } from "@/hooks/usePushNotifications";

interface SecurityAlert {
  id: string;
  email: string;
  status: string;
  failure_reason: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  browser: string | null;
  device_type: string | null;
  created_at: string;
}

interface AlertNotification {
  id: string;
  type: "failed_login" | "suspicious_ip" | "blocked_account" | "new_location";
  title: string;
  message: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  data: SecurityAlert;
  read: boolean;
}

export const useRealtimeSecurityAlerts = () => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const getSeverity = (log: SecurityAlert): AlertNotification["severity"] => {
    if (log.failure_reason?.includes("locked")) return "critical";
    if (log.failure_reason?.includes("attempt 5")) return "critical";
    if (log.failure_reason?.includes("attempt 4")) return "high";
    if (log.failure_reason?.includes("attempt 3")) return "high";
    if (log.failure_reason?.includes("Face") || log.failure_reason?.includes("Fingerprint")) return "medium";
    return "low";
  };

  const getAlertType = (log: SecurityAlert): AlertNotification["type"] => {
    if (log.failure_reason?.includes("locked")) return "blocked_account";
    if (log.failure_reason?.includes("new location")) return "new_location";
    return "failed_login";
  };

  const createNotification = useCallback((log: SecurityAlert): AlertNotification => {
    const severity = getSeverity(log);
    const type = getAlertType(log);
    
    let title = "Failed Login Attempt";
    let message = `Failed attempt from ${log.city || "Unknown"}, ${log.country || "Unknown"}`;
    
    if (type === "blocked_account") {
      title = "Account Blocked";
      message = `Account ${log.email} has been locked due to multiple failures`;
    } else if (type === "new_location") {
      title = "New Location Login";
      message = `Login attempt from new location: ${log.city}, ${log.country}`;
    }

    return {
      id: log.id,
      type,
      title,
      message,
      timestamp: new Date(log.created_at),
      severity,
      data: log,
      read: false,
    };
  }, []);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  useEffect(() => {
    const count = alerts.filter(a => !a.read).length;
    setUnreadCount(count);
  }, [alerts]);

  useEffect(() => {
    // Subscribe to real-time changes on login_audit_logs
    const channel = supabase
      .channel("security-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "login_audit_logs",
          filter: "status=eq.failed",
        },
        (payload) => {
          const log = payload.new as SecurityAlert;
          const notification = createNotification(log);
          
          setAlerts(prev => [notification, ...prev].slice(0, 100)); // Keep last 100

          // Show toast notification
          const toastType = notification.severity === "critical" ? "error" : "warning";
          toast[toastType](notification.title, {
            description: notification.message,
            duration: notification.severity === "critical" ? 10000 : 5000,
          });

          // Send push notification for high/critical alerts
          if (notification.severity === "critical" || notification.severity === "high") {
            showSecurityNotification({
              title: notification.title,
              message: notification.message,
              type: notification.severity === "critical" ? "error" : "warning",
              data: { alertId: notification.id },
            });

            // Play sound for critical alerts
            try {
              const audio = new Audio("/notification.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          console.log("Connected to security alerts channel");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createNotification]);

  return {
    alerts,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAlerts,
  };
};
