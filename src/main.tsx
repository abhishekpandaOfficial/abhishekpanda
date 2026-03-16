import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

// Bump this when a deployed service worker or hashed asset set needs a one-time cache reset.
const swResetKey = "ap-sw-reset-2026-03-16-asset-mime-fix-v1";

const resetLegacyServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    if (localStorage.getItem(swResetKey) === "done") return;

    const registrations = await navigator.serviceWorker.getRegistrations();

    if (registrations.length === 0) {
      localStorage.setItem(swResetKey, "done");
      return;
    }

    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    localStorage.setItem(swResetKey, "done");
    window.location.reload();
  } catch {
    try {
      localStorage.setItem(swResetKey, "done");
    } catch {
      return;
    }
  }
};

void resetLegacyServiceWorkers();

const shouldIgnorePromiseError = (reason: unknown) => {
  const msg = typeof reason === "string" ? reason : (reason as any)?.message;
  if (!msg) return false;
  return (
    msg.includes(
      "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received",
    ) || msg.includes("message channel closed before a response was received")
  );
};

window.addEventListener("unhandledrejection", (event) => {
  if (shouldIgnorePromiseError(event.reason)) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
