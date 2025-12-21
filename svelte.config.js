import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: '404.html', // kalau index.html nanti ketika refresh di route tertentu akan error 404 github makanya pakai defaultnya 404.html
            precompress: false,
            strict: false
        }),
        paths: {
            base: ''
        },
        version: {
            name: '1.1.1'
        }
    },
    extensions: ['.svelte', '.svx']
};

export default config;