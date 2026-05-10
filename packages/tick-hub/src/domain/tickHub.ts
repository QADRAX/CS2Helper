import type { TickFrame } from "./tickFrame";

/**
 * Public contract for the tick hub package (implemented by {@link TickHubService}).
 * Consumers use domain options and paths — not application-layer ports.
 */
export interface TickHub {
  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void;
  /** Writes one JSON line per {@link TickFrame} to the given file (append). */
  startRecording(filePath: string): void;
  stopRecording(): Promise<void>;
}
