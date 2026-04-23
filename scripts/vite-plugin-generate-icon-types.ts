import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function generateIconTypesPlugin(): Plugin {
  return {
    name: 'vite-plugin-generate-icon-types',
    apply: 'serve' as const, // dev 모드에서만 실행
    configureServer() {
      const iconsDir = path.resolve(__dirname, '../src/assets/icons');

      runGenerateScript();

      let debounceTimer: NodeJS.Timeout | null = null;

      fs.watch(iconsDir, (_, filename) => {
        if (!filename || !filename.endsWith('.svg')) return;

        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          console.log(`🔄 Icons changed: ${filename}`);
          runGenerateScript();
        }, 300); 
      });
    },
  };
}

function runGenerateScript() {
  const scriptPath = path.resolve(__dirname, './generate-icon-types.ts');

  // npx ts-node 대신 직접 node로 실행하거나 프로젝트 환경에 맞게 조정
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['ts-node', '--esm', scriptPath]; // ESM 환경 대응

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    console.error('❌ Failed to run generate-icon-types script:', err);
  });
}
