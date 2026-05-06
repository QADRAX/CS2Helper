import fs from "fs/promises";

export interface Recorder {
  start: (path: string) => Promise<void>;
  stop: () => Promise<void>;
  write: (data: string) => Promise<void>;
  isRecording: () => boolean;
}

export function createFileRecorder(): Recorder {
  let fileHandle: any = null;
  let currentPath: string | null = null;

  return {
    async start(path: string) {
      if (fileHandle) {
        await this.stop();
      }
      fileHandle = await fs.open(path, "a");
      currentPath = path;
    },
    async stop() {
      if (fileHandle) {
        await fileHandle.close();
        fileHandle = null;
        currentPath = null;
      }
    },
    async write(data: string) {
      if (fileHandle) {
        await fileHandle.write(data + "\n");
      }
    },
    isRecording() {
      return fileHandle !== null;
    }
  };
}
