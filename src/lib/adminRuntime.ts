const BROWSER_ADMIN_WORKSPACE_KEY = "admin_browser_workspace_enabled";
const ADMIN_DEEP_LINK = "abhishekadmin://admin";
const DEFAULT_DESKTOP_DOWNLOAD_URL = "https://www.abhishekpanda.com/downloads/Abhishek-Admin.dmg";
const DEFAULT_DESKTOP_UPDATE_MANIFEST_URL = "https://www.abhishekpanda.com/downloads/latest.json";

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isDesktopAdminRuntime = () => {
  if (typeof window === "undefined") return false;
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
};

export const isBrowserLocalhostDevelopment = () => {
  if (typeof window === "undefined" || isDesktopAdminRuntime()) return false;
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
  return isLocalHost && import.meta.env.DEV;
};

export const isMacDesktopClient = () => {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform || "";
  const ua = navigator.userAgent || "";
  return /mac/i.test(platform) || /mac os x|macintosh/i.test(ua);
};

export const getAdminDesktopDeepLink = () => ADMIN_DEEP_LINK;

export const getAdminDesktopDownloadUrl = () => {
  const value = import.meta.env.VITE_ADMIN_DESKTOP_DOWNLOAD_URL as string | undefined;
  return value?.trim() || DEFAULT_DESKTOP_DOWNLOAD_URL;
};

export const getAdminDesktopUpdateManifestUrl = () => {
  const value = import.meta.env.VITE_ADMIN_DESKTOP_UPDATE_MANIFEST_URL as string | undefined;
  return value?.trim() || DEFAULT_DESKTOP_UPDATE_MANIFEST_URL;
};

export const hasBrowserAdminWorkspaceEnabled = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BROWSER_ADMIN_WORKSPACE_KEY) === "true";
};

export const enableBrowserAdminWorkspace = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BROWSER_ADMIN_WORKSPACE_KEY, "true");
};

export const clearBrowserAdminWorkspace = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BROWSER_ADMIN_WORKSPACE_KEY);
};
