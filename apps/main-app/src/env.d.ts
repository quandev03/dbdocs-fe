/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_DOMAIN: string;
  readonly VITE_API_URL: string;
  readonly VITE_AUTH_ENABLED: string;
  readonly VITE_GOOGLE_AUTH_URL: string;
  readonly VITE_GITHUB_AUTH_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 