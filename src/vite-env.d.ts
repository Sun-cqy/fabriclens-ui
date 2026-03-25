/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_DEFAULT_LOCALE: string
    readonly VITE_IMAGE_CDN_URL: string
    readonly VITE_USE_MOCK_DATA: string
    // 更多环境变量...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 