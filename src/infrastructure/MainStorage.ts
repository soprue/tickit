import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.join(app.getPath('userData'), 'data');

/**
 * 메인 프로세스 전용 데이터 스토리지 클래스 (SRP: 파일 I/O 담당)
 */
export class MainStorage {
  constructor() {
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    return path.join(DATA_DIR, `${key}.json`);
  }

  /**
   * 데이터 읽기
   */
  async read(key: string): Promise<any | null> {
    const filePath = this.getFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      }
      return null;
    } catch (err) {
      console.error(`[Infrastructure] [MainStorage] Read failed (${key}):`, err);
      return null;
    }
  }

  /**
   * 데이터 쓰기
   */
  async write(key: string, data: any): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`[Infrastructure] [MainStorage] Write failed (${key}):`, err);
      throw err;
    }
  }

  /**
   * 파일 존재 여부 확인
   */
  exists(key: string): boolean {
    return fs.existsSync(this.getFilePath(key));
  }
}

export const mainStorage = new MainStorage();
