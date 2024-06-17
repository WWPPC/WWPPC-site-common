import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                modal: resolve(__dirname, 'src/modal/modal.ts'),
                multipane: resolve(__dirname, 'src/multipane/Multipane'),
                panels: resolve(__dirname, 'src/panels/PanelManager.ts'),
                uiDefaults: resolve(__dirname, 'src/ui-defaults/UIDefaults.ts'),
                uiContainers: resolve(__dirname, 'src/ui-defaults/UIContainers.ts'),
                textTransitions: resolve(__dirname, 'src/ui-defaults/TextTransitions.ts'),
                katexify: resolve(__dirname, 'src/scripts/katexify.ts'),
                recaptcha: resolve(__dirname, 'src/scripts/recaptcha.ts'),
                title: resolve(__dirname, 'src/scripts/title.ts'),
                userAgent: resolve(__dirname, 'src/scripts/userAgent.ts'),
            },
            name: 'WWPPCSiteCommon',
            formats: ['es']
        },
        rollupOptions: {
            external: ['vue', 'vue-router', 'pinia', 'katex', '/icon.svg', '/logo.svg'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        },
        emptyOutDir: false
    }
})