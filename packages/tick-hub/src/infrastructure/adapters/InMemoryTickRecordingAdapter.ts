import type { TickFrame } from "../../domain";
import type { TickRecordingPort } from "../../application/ports/TickRecordingPort";

export class InMemoryTickRecordingAdapter implements TickRecordingPort {
  readonly frames: TickFrame[] = [];

  async appendFrame(frame: TickFrame): Promise<void> {
    this.frames.push(frame);
  }
}
