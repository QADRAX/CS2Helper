import type { TickFrame, TickHub } from "../domain";
import type { MasterClockPort } from "../application/ports/MasterClockPort";
import type { TickSourcePort } from "../application/ports/TickSourcePort";
import type { TickSourcesPort } from "../application/ports/TickSourcesPort";
import { subscribeTickFrames, startTickRecording, stopTickRecording } from "../application/useCases";
import type { SubscribeTickFramesOptions } from "../application/useCases/subscribeTickFrames";
import { JsonlTickRecordingAdapter } from "./adapters/JsonlTickRecordingAdapter";
import { FixedTickSources } from "./FixedTickSources";
import { TickRecordingSession } from "./TickRecordingSession";

export interface TickHubOptions {
  subscribeFrames?: SubscribeTickFramesOptions;
}

function asSourcesPort(sources: readonly TickSourcePort[] | TickSourcesPort): TickSourcesPort {
  if (Array.isArray(sources)) {
    return new FixedTickSources(sources);
  }
  return sources as TickSourcesPort;
}

/**
 * Implements {@link TickHub}: wires master clock, sources, and internal recording (JSONL by path).
 */
export class TickHubService implements TickHub {
  private readonly recordingSession = new TickRecordingSession();
  private readonly sourcesPort: TickSourcesPort;

  constructor(
    private readonly master: MasterClockPort,
    sources: readonly TickSourcePort[] | TickSourcesPort,
    private readonly options: TickHubOptions = {}
  ) {
    this.sourcesPort = asSourcesPort(sources);
  }

  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void {
    return subscribeTickFrames(
      [this.master, this.sourcesPort, this.recordingSession],
      listener,
      this.options.subscribeFrames
    );
  }

  startRecording(filePath: string): void {
    startTickRecording([this.recordingSession], new JsonlTickRecordingAdapter(filePath));
  }

  async stopRecording(): Promise<void> {
    await stopTickRecording([this.recordingSession]);
  }
}
