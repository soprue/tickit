import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { transformSync } from 'esbuild';
import generateIconTypesPlugin from './scripts/vite-plugin-generate-icon-types';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isTest = mode === 'test';
  
  return {
    oxc: true,
    plugins: [
      tailwindcss(),
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
      !isTest && generateIconTypesPlugin(),
      !isTest && electron([
        {
          entry: 'src/main.ts',
          vite: { 
            define: {
              'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
            },
            build: { 
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: ['electron', 'node:path', 'node:fs', 'node:url', 'node:module', 'node:process']
              }
            } 
          },
        },
        {
          onstart: ({ reload }) => reload(),
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                input: {
                  preload: 'preload.cjs',
                },
                output: {
                  format: 'cjs',
                  entryFileNames: '[name].mjs',
                  chunkFileNames: '[name].mjs',
                  assetFileNames: '[name].[ext]',
                },
              },
            },
          },
        },
      ]),
    ].filter(Boolean),
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@features': path.resolve(__dirname, './src/features'),
        '@components': path.resolve(__dirname, './src/features/reminder/presentation/components'),
        '@core': path.resolve(__dirname, './src/core'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
