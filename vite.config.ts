import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const configuredBase = process.env.PUBLIC_BASE_PATH?.trim();
const base = configuredBase ? `/${configuredBase.replace(/^\/+|\/+$/g, '')}/` : '/';

export default defineConfig({
  base,
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/client/main.ts',
      output: {
        entryFileNames: 'assets/app-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
