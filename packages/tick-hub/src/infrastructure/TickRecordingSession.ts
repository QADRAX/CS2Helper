import type { TickRecordingPort } from "../application/ports/TickRecordingPort";
import type { TickRecordingSessionPort } from "../application/ports/TickRecordingSessionPort";

export class TickRecordingSession implements TickRecordingSessionPort {
  private active: TickRecordingPort | null = null;

  setSink(sink: TickRecordingPort | null): void {
    this.active = sink;
  }

  getSink(): TickRecordingPort | null {
    return this.active;
  }
}
