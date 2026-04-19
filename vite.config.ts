import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'src/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
          },
        },
      },
      preload: {
        input: 'preload.cjs',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/features/reminder/presentation/components'), // tsconfig 기준에 맞춰 필요시 조정
      '@core': path.resolve(__dirname, './src/core'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@scripts': path.resolve(__dirname, './src/scripts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
