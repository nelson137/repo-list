import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            '$test': fileURLToPath(new URL('./src/test', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: ['src/styles'],
            },
        },
    },
    server: {
        port: 5173,
    },
    preview: {
        port: 5173,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            reporter: ['text', 'html'],
        },
    }
});
