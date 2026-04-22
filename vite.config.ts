import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { transformSync } from 'esbuild';
import generateIconTypesPlugin from './scripts/vite-plugin-generate-icon-types';

export default defineConfig({
  oxc: true,
  plugins: [
    // 1. SVGR: JSX 변환만 수행 (색상 치환 옵션 제거)
    svgr({
      include: '**/*.svg?react',
    }),
    // 2. SVG JSX Fix: OXC 파싱 오류 방지를 위한 esbuild 변환 (필수)
    {
      name: 'svg-jsx-fix',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('.svg?react')) {
          const result = transformSync(code, {
            loader: 'jsx',
            format: 'esm',
            target: 'esnext',
          });
          return {
            code: result.code,
            map: result.map,
          };
        }
      },
    },
    react(),
    generateIconTypesPlugin(),
    electron({
      main: {
        entry: 'src/main.ts',
        vite: { build: { outDir: 'dist-electron/main' } },
      },
      preload: {
        input: 'preload.cjs',
        vite: { build: { outDir: 'dist-electron/preload' } },
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/features/reminder/presentation/components'),
      '@core': path.resolve(__dirname, './src/core'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@scripts': path.resolve(__dirname, './src/scripts'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
