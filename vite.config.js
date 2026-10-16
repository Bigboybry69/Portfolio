import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: './', build: { rollupOptions: { input: { home: resolve(import.meta.dirname, 'index.html'), projects: resolve(import.meta.dirname, 'projects.html'), story: resolve(import.meta.dirname, 'my-story.html'), scan: resolve(import.meta.dirname, 'building-site-scan.html'), traffic: resolve(import.meta.dirname, 'construction-traffic.html') } } } });
