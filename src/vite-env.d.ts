/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_API_BASE: string
  readonly VITE_DEFAULT_GYM_ID: string
  readonly VITE_DEFAULT_GYM_NAME: string
  readonly VITE_DEFAULT_BRANCH_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
