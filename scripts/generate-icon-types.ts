import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.resolve(__dirname, '../src/assets/icons');
const OUTPUT_FILE = path.resolve(__dirname, '../src/types/icon-types.ts');

function generateIconTypes() {
  if (!fs.existsSync(ICONS_DIR)) return;
  
  const iconTypes = fs
    .readdirSync(ICONS_DIR)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.replace('.svg', ''));

  const typeFile = `export type IconType =\n  | ${iconTypes.map((name) => `'${name}'`).join('\n  | ')};\n`;

  // 디렉토리가 없으면 생성
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, typeFile);
  console.log('✅ Icon types generated successfully!');
}

generateIconTypes();
