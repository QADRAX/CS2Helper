import fs from "fs/promises";
import path from "path";
import type { ClockPort } from "../../application/ports/clockPort";
import type { SnapshotSinkPort } from "../../application/ports/snapshotSinkPort";

export class ClockNowMsAdapter implements ClockPort {
  nowMs(): number {
    return Date.now();
  }
}

export class FsScoreboardSnapshotSinkAdapter implements SnapshotSinkPort {
  constructor(private readonly directoryAbsolute: string) {}

  async writeSnapshot(filename: string, pngBytes: Uint8Array): Promise<{ absolutePath: string }> {
    await fs.mkdir(this.directoryAbsolute, { recursive: true });
    const absolutePath = path.join(this.directoryAbsolute, filename);
    await fs.writeFile(absolutePath, pngBytes);
    return { absolutePath };
  }
}
