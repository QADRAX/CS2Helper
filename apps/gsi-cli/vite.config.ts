import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  resolve: {
    dedupe: ['react', 'ink'],
  },
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        'react',
        'ink',
        'ink-text-input',
        'fs/promises',
        'path',
        '@cs2helper/cs2-scoreboard-screenshot',
        'koffi',
        'pngjs',
      ],
    },
    outDir: 'dist',
    target: 'node22',
  },
});
