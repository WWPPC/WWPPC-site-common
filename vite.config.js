import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: {
                common: resolve(__dirname, 'src/common/common.ts'),
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
            fileName: 'index'
        },
        rollupOptions: {
            external: ['vue', 'vue-router'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
});
