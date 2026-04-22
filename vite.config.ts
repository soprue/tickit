import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { transformSync } from 'esbuild';
import generateIconTypesPlugin from './scripts/vite-plugin-generate-icon-types';

export default defineConfig({
  // OXC는 유지합니다.
  oxc: true,
  plugins: [
    // 1. SVGR: SVG를 JSX 코드로 변환
    svgr({
      include: '**/*.svg?react',
    }),
    // 2. SVG JSX Fix: SVGR이 만든 JSX 코드를 OXC가 파싱하기 전에 표준 JS로 먼저 변환
    {
      name: 'svg-jsx-fix',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('.svg?react')) {
          // JSX 문법만 esbuild로 빠르게 제거해서 OXC에게 넘겨줍니다.
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
    // 3. React: 메인 코드들은 OXC가 빠르게 처리
    react(),
    // 4. 아이콘 타입 자동 생성 플러그인
    generateIconTypesPlugin(),
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
