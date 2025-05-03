import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'public/manifest.json',
                    dest: '.',
                }
            ],
        }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './testSetup.ts'
    },
    build: {
        outDir: 'build',
        rollupOptions: {
            input: {
                main: './index.html',
            },
        },
    },
});
