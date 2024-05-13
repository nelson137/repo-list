import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            $test: path.resolve('./src/test'),
            $components: path.resolve('./src/lib/ui/components'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: ['assets/_scss'],
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
    },
});
