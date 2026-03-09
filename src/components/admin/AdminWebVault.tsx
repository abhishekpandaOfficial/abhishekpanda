import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, Globe, Workflow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import webVaultHtml from "@/assets/admin/webvault.html?raw";

const STORAGE_BUCKETS = ["blog-assets", "business-docs", "ebooks", "products"];
const EDGE_FUNCTIONS = [
  "abhibot-chat",
  "admin-setup",
  "admin-webauthn",
  "contact-notification",
  "cron-executor",
  "location-confirmation",
  "mapbox-token",
  "new-device-alert",
  "ops-openapi",
  "refresh-ai-news",
  "send-magic-link",
  "security-alert",
];

const WebVaultUnavailable = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-muted-foreground">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />
      <div>
        <p className="font-semibold text-foreground">WebVault could not be initialized.</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  </div>
);

export default function AdminWebVault() {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const initialThemeRef = useRef(theme);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  const hydratedHtml = useMemo(() => {
    if (!supabaseUrl || !supabasePublishableKey) return null;

    const bridge = {
      url: supabaseUrl,
      key: supabasePublishableKey,
      name: "Abhishek Panda",
      theme: initialThemeRef.current,
      storageBuckets: STORAGE_BUCKETS,
      edgeFunctions: EDGE_FUNCTIONS,
      s3Buckets: [],
    };

    const bridgeScript = `
<script>
window.__WEBVAULT_BRIDGE__=${JSON.stringify(bridge).replace(/</g, "\\u003c")};
(function () {
  const applyTheme = function(nextTheme) {
    const theme = nextTheme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body && document.body.setAttribute('data-theme', theme);
  };
  window.__applyWebVaultTheme__ = applyTheme;
  window.addEventListener('message', function(event) {
    const data = event.data || {};
    if (data.type === 'parent-theme' && (data.theme === 'light' || data.theme === 'dark')) {
      applyTheme(data.theme);
    }
  });
  applyTheme(window.__WEBVAULT_BRIDGE__?.theme || 'light');
})();
</script>`;

    const themeStyle = `
<style>
html, body { font-family: Inter, system-ui, sans-serif !important; }
.setup-sub, .nav-section-label, .logo-sub, .sidebar-footer, .search-wrap input, .stat-label, .stat-sub, .section-label, .rurl, .tdr-label, .tdr-count, .page-header p, .nav-badge {
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
}
[data-theme="light"] {
  color-scheme: light;
  --bg: #f6f8fc;
  --surface: #ffffff;
  --surface-2: #f7f9fc;
  --surface-3: #eef2f8;
  --border: #dbe3f0;
  --border-2: #c9d5e6;
  --accent: #2563eb;
  --accent-light: #3b82f6;
  --accent-glow: rgba(37, 99, 235, 0.08);
  --personal: #0891b2;
  --company: #d97706;
  --text: #0f172a;
  --text-2: #475569;
  --text-3: #64748b;
  --success: #059669;
  --warning: #d97706;
  --danger: #dc2626;
}
[data-theme="light"] body {
  background: var(--bg);
  color: var(--text);
}
[data-theme="light"] .sidebar,
[data-theme="light"] .topbar,
[data-theme="light"] .db-card,
[data-theme="light"] .site-card,
[data-theme="light"] .site-row,
[data-theme="light"] .modal,
[data-theme="light"] .detail-panel,
[data-theme="light"] .confirm-box,
[data-theme="light"] .stg-card {
  box-shadow: none;
}
[data-theme="light"] .search-wrap svg,
[data-theme="light"] .vbtn,
[data-theme="light"] .cab,
[data-theme="light"] .rab,
[data-theme="light"] .modal-x {
  color: var(--text-2);
}
[data-theme="light"] .vbtn.active,
[data-theme="light"] .cab:hover,
[data-theme="light"] .rab:hover,
[data-theme="light"] .modal-x:hover {
  color: var(--text);
}
[data-theme="light"] .setup-screen { background: var(--bg); }
[data-theme="light"] .btn-add { box-shadow: none; }
[data-theme="light"] .nav-item.active { box-shadow: inset 0 0 0 1px rgba(37,99,235,0.08); }
</style>`;

    return webVaultHtml.replace("<head>", `<head>\n${bridgeScript}\n${themeStyle}`);
  }, [supabasePublishableKey, supabaseUrl]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "parent-theme", theme }, "*");
  }, [theme]);

  if (!supabaseUrl || !supabasePublishableKey) {
    return <WebVaultUnavailable message="Supabase environment variables are missing in this app build." />;
  }

  return (
    <div className="space-y-4">
      <div className="admin-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">WebVault</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1">
            <Workflow className="h-3.5 w-3.5" />
            Theme synced
          </span>
        </div>
      </div>

      <div className="-m-1 overflow-hidden md:-m-2">
        <div className="h-[calc(100vh-8.75rem)] overflow-hidden rounded-2xl border border-border/40 bg-card/30 lg:h-[calc(100vh-7.5rem)]">
          <iframe
            ref={iframeRef}
            title="WebVault Admin"
            srcDoc={hydratedHtml || undefined}
            className="h-full w-full border-0"
            onLoad={() => iframeRef.current?.contentWindow?.postMessage({ type: "parent-theme", theme }, "*")}
          />
        </div>
      </div>
    </div>
  );
}
