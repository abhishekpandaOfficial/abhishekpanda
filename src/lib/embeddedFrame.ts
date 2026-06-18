import { applyEmbeddedThemeBridge, type ReaderTheme } from "@/lib/readerActions";

export const syncThemeToEmbeddedFrame = (
  iframe: HTMLIFrameElement | null,
  theme: ReaderTheme,
  messageType = "parent-theme",
) => {
  if (!iframe) return;

  iframe.contentWindow?.postMessage({ type: messageType, theme }, window.location.origin);

  const doc = iframe.contentDocument;
  if (doc) {
    applyEmbeddedThemeBridge(doc, theme);
  }
};

export const measureEmbeddedFrameHeight = (iframe: HTMLIFrameElement | null) => {
  const doc = iframe?.contentDocument;
  if (!doc) return 0;

  const body = doc.body;
  const root = doc.documentElement;
  return Math.max(
    body ? body.scrollHeight : 0,
    body ? body.offsetHeight : 0,
    root ? root.scrollHeight : 0,
    root ? root.offsetHeight : 0,
  );
};
