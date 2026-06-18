import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
};

// Detect browser
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera")) return "Opera";
  return "Unknown";
};

export const useAnalytics = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  // Track page view
  const trackPageView = useCallback(async () => {
    const currentPath = location.pathname;
    
    // Avoid duplicate tracking
    if (currentPath === lastTrackedPath.current) return;
    lastTrackedPath.current = currentPath;

    try {
      await supabase.from("page_views").insert({
        page_path: currentPath,
        page_title: document.title,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
        device_type: getDeviceType(),
        browser: getBrowser(),
      });
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }, [location.pathname]);

  // Track user interaction
  const trackInteraction = useCallback(async (
    interactionType: string,
    elementName?: string,
    elementId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await supabase.from("user_interactions").insert({
        interaction_type: interactionType,
        element_name: elementName || null,
        element_id: elementId || null,
        page_path: location.pathname,
        session_id: getSessionId(),
        metadata: metadata || null,
      });
    } catch (error) {
      console.error("Failed to track interaction:", error);
    }
  }, [location.pathname]);

  // Track page views on route change
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  return { trackInteraction, trackPageView };
};

// Export utility function for tracking outside of hooks
export const trackEvent = async (
  interactionType: string,
  elementName?: string,
  metadata?: Record<string, any>
) => {
  try {
    await supabase.from("user_interactions").insert({
      interaction_type: interactionType,
      element_name: elementName || null,
      page_path: window.location.pathname,
      session_id: getSessionId(),
      metadata: metadata || null,
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};
