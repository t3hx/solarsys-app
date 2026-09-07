/// <reference types="vite/client" />

/** Version de package.json, injectee au build (vite.config.ts) */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_EXPOSE_DEBUG_API?: string
}
