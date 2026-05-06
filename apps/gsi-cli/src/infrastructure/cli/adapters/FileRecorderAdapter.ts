import fs from "fs";
import type { RecorderPort } from "../../../application/cli/ports/RecorderPort";

export class FileRecorderAdapter implements RecorderPort {
  private stream: fs.WriteStream | null = null;
  private cleanup: (() => void) | null = null;
  private isFirstTick = true;

  async start(path: string): Promise<void> {
    if (this.stream) {
      await this.stop();
    }
    
    this.isFirstTick = true;
    this.stream = fs.createWriteStream(path, { flags: 'w', encoding: 'utf-8' }); // 'w' to overwrite/start fresh
    
    return new Promise((resolve, reject) => {
      this.stream?.on('open', () => {
        // Start the JSON array
        this.stream?.write("[\n");
        resolve();
      });
      this.stream?.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    
    if (this.stream) {
      const streamToClose = this.stream;
      this.stream = null;
      
      await new Promise<void>((resolve) => {
        // Close the JSON array
        streamToClose.write("\n]");
        streamToClose.end(() => {
          resolve();
        });
      });
    }
  }

  async write(data: string): Promise<void> {
    if (this.stream) {
      const prefix = this.isFirstTick ? "" : ",\n";
      this.isFirstTick = false;
      
      // Indent data slightly for readability
      const indentedData = data.split('\n').map(line => "  " + line).join('\n');
      this.stream.write(prefix + indentedData);
    }
  }

  setCleanup(fn: () => void): void {
    this.cleanup = fn;
  }

  isRecording(): boolean {
    return this.stream !== null;
  }
}
