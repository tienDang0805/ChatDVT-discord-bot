import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The deployment installs only backend dependencies. Ship a standalone renderer.
  ssr: { noExternal: [/.*/] },
  build: {
    ssr: 'src/seo-entry.tsx',
    outDir: '../dist/seo',
    // Retain the SPA template when rebuilding only the renderer during development.
    emptyOutDir: false,
    rollupOptions: { output: { format: 'cjs', entryFileNames: 'renderer.cjs' } },
  },
});
