import fs from "fs/promises";
import type { RecorderPort } from "../../../application/cli/ports/RecorderPort";

export class FileRecorderAdapter implements RecorderPort {
  private fileHandle: any = null;
  private cleanup: (() => void) | null = null;

  async start(path: string): Promise<void> {
    if (this.fileHandle) {
      await this.stop();
    }
    this.fileHandle = await fs.open(path, "a");
  }

  async stop(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
  }

  async write(data: string): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.write(data + "\n");
    }
  }

  setCleanup(fn: () => void): void {
    this.cleanup = fn;
  }

  isRecording(): boolean {
    return this.fileHandle !== null;
  }
}
