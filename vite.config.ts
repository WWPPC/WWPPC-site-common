import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), dts()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                common: resolve(__dirname, 'src/common/common.ts'),
                containers: resolve(__dirname, 'src/containers/containers.ts'),
                inputs: resolve(__dirname, 'src/inputs/inputs.ts'),
                text: resolve(__dirname, 'src/text/text.ts'),
                modal: resolve(__dirname, 'src/modal/modal.ts'),
                panels: resolve(__dirname, 'src/panels/panels.ts'),
                userAgent: resolve(__dirname, 'src/scripts/userAgent.ts'),
                recaptcha: resolve(__dirname, 'src/scripts/recaptcha.ts'),
                katexify: resolve(__dirname, 'src/scripts/katexify.ts'),
                title: resolve(__dirname, 'src/scripts/title.ts'),
                serverConnection: resolve(__dirname, 'src/scripts/ServerConnection.ts'),
                connectionEnforcer: resolve(__dirname, 'src/scripts/ConnectionEnforcer.ts'),
                accountManager: resolve(__dirname, 'src/scripts/AccountManager.ts')
            },
            name: 'WWPPCSiteCommon',
            formats: ['es']
        },
        target: 'es2021',
        rollupOptions: {
            external: ['vue', 'vue-router', 'pinia', 'katex', 'recaptcha-v3', '/icon.svg', '/logo.svg'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
})