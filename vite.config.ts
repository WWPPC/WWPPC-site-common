import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

import tsconfig from './tsconfig.app.json'

const entries: any = {}
for (const file of tsconfig.files) {
    const index = file.match(/.*\/(.*)/);
    if (index != null) entries[index[1]] = resolve(__dirname, file)
}

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
            entry: entries,
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