import { appendFile } from "node:fs/promises";
import type { TickFrame } from "../../domain";
import type { TickRecordingPort } from "../../application/ports/TickRecordingPort";

/** One JSON object per line. */
export class JsonlTickRecordingAdapter implements TickRecordingPort {
  constructor(private readonly filePath: string) {}

  async appendFrame(frame: TickFrame): Promise<void> {
    await appendFile(this.filePath, `${JSON.stringify(frame)}\n`, "utf8");
  }
}
