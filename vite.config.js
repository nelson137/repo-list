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
    test: {
        globals: true,
        coverage: {
            reporter: ['text', 'html'],
        },
    }
});
