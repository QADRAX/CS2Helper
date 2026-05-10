import type { TickFrame } from "@cs2helper/tick-hub";
import type { Cs2ClientListenerStartResult } from "./cs2ClientListenerStartResult";

/**
 * Public SDK for the CS2 client listener package (implemented by {@link Cs2ClientListenerService}).
 * Lifecycle and recording are expressed with domain types — not application ports.
 */
export interface Cs2ClientListenerSdk {
  readonly start: () => Promise<Cs2ClientListenerStartResult>;
  readonly stop: () => Promise<void>;
  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void;
  /** JSONL recording; delegates to the inner {@link TickHub}. */
  startRecording(filePath: string): void;
  stopRecording(): Promise<void>;
}
