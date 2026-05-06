import fs from "fs";
import type { RecorderPort } from "../../../application/cli/ports/RecorderPort";

/**
 * Adapter that records GSI ticks to a local JSON file.
 * Formats the output as a JSON array of objects.
 */
export class FileRecorderAdapter implements RecorderPort {
  private stream: fs.WriteStream | null = null;
  private unsubscribe: (() => void) | null = null;
  private isFirstTick = true;

  async open(path: string): Promise<void> {
    if (this.stream) {
      await this.close();
    }
    
    this.isFirstTick = true;
    this.stream = fs.createWriteStream(path, { flags: 'w', encoding: 'utf-8' });
    
    return new Promise((resolve, reject) => {
      this.stream?.on('open', () => {
        // Start the JSON array
        this.stream?.write("[\n");
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
        // Close the JSON array
        streamToClose.write("\n]");
        streamToClose.end(() => {
          resolve();
        });
      });
    }
  }

  async writeTick(data: string): Promise<void> {
    if (this.stream) {
      const prefix = this.isFirstTick ? "" : ",\n";
      this.isFirstTick = false;
      
      // Indent data slightly for readability
      const indentedData = data.split('\n').map(line => "  " + line).join('\n');
      this.stream.write(prefix + indentedData);
    }
  }

  setUnsubscribe(fn: () => void): void {
    this.unsubscribe = fn;
  }

  isRecording(): boolean {
    return this.stream !== null;
  }
}
