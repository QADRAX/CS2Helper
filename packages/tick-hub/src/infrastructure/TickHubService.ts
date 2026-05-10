import { withPorts, withPortsAsync } from "@cs2helper/shared";
import type { TickFrame } from "../domain";
import type { MasterClockPort } from "../application/ports/MasterClockPort";
import type { TickRecordingPort } from "../application/ports/TickRecordingPort";
import type { TickSourcePort } from "../application/ports/TickSourcePort";
import type { TickSourcesPort } from "../application/ports/TickSourcesPort";
import { subscribeTickFrames, startTickRecording, stopTickRecording } from "../application/useCases";
import type { SubscribeTickFramesOptions } from "../application/useCases/subscribeTickFrames";
import { TickRecordingSession } from "./TickRecordingSession";
import { toTickSourcesPort } from "./toTickSourcesPort";

export interface TickHubOptions {
  subscribeFrames?: SubscribeTickFramesOptions;
}

/**
 * Composition root: master clock + any number of {@link TickSourcePort}s + optional JSONL/memory recording.
 * CS2-specific adapters (GSI gateway, PresentMon, …) live outside this package.
 */
export class TickHubService {
  private readonly recordingSession = new TickRecordingSession();
  private readonly sourcesPort: TickSourcesPort;

  readonly startTickRecording: (sink: TickRecordingPort) => void;
  readonly stopTickRecording: () => Promise<void>;

  constructor(
    private readonly master: MasterClockPort,
    sources: readonly TickSourcePort[] | TickSourcesPort,
    private readonly options: TickHubOptions = {}
  ) {
    this.sourcesPort = toTickSourcesPort(sources);
    this.startTickRecording = withPorts(startTickRecording, [this.recordingSession]);
    this.stopTickRecording = withPortsAsync(stopTickRecording, [this.recordingSession]);
  }

  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void {
    return subscribeTickFrames(
      [this.master, this.sourcesPort, this.recordingSession],
      listener,
      this.options.subscribeFrames
    );
  }
}
