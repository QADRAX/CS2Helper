import fs from "fs";
import path from "path";
import type { RecorderPort } from "../../application/ports/RecorderPort";

/** Adapter that records raw GSI ticks as newline-delimited JSON. */
export class FileRecorderAdapter implements RecorderPort {
  private stream: fs.WriteStream | null = null;
  private unsubscribe: (() => void) | null = null;

  async open(path: string): Promise<void> {
    if (this.stream) {
      await this.close();
    }

    await fs.promises.mkdir(pathModuleDirname(path), { recursive: true });
    this.stream = fs.createWriteStream(path, { flags: 'w', encoding: 'utf-8' });
    
    return new Promise((resolve, reject) => {
      this.stream?.on('open', () => {
        resolve();
      });
      this.stream?.on('error', reject);
    });
  }

  async close(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    if (this.stream) {
      const streamToClose = this.stream;
      this.stream = null;

      await new Promise<void>((resolve) => {
        streamToClose.end(() => {
          resolve();
        });
      });
    }
  }

  async writeTick(data: string): Promise<void> {
    if (this.stream) {
      this.stream.write(`${data}\n`);
    }
  }

  setUnsubscribe(fn: () => void): void {
    this.unsubscribe = fn;
  }

  isRecording(): boolean {
    return this.stream !== null;
  }
}

function pathModuleDirname(filePath: string): string {
  return path.dirname(filePath);
}
