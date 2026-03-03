/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CMS_ORIGIN?: string;
  readonly VITE_CMS_API_BASE?: string;
  readonly VITE_CMS_ADMIN_URL?: string;
  readonly VITE_CMS_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
