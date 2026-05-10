import type {
  Cs2ClientListenerStartResult,
  GsiGatewayDiagnostics,
  GsiGatewayOptions,
  PresentMonBootstrapOptions,
  TickFrame,
} from "@cs2helper/cs2-client-listener";
import type { Cs2ProcessStatusProbePort } from "./Cs2ProcessStatusProbePort";

/**
 * Application port for gsi-cli composition: maps to {@link Cs2ClientListenerService} without exposing the SDK in use cases.
 *
 * Ports tuple order is documented on each use case.
 */
export interface Cs2ClientListenerCliPort extends Cs2ProcessStatusProbePort {
  start(gatewayOptions?: GsiGatewayOptions): Promise<Cs2ClientListenerStartResult>;
  stop(): Promise<void>;
  isRunning(): boolean;
  getGatewayDiagnostics(): Readonly<GsiGatewayDiagnostics>;
  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void;
  startRecording(filePath: string): void;
  stopRecording(): Promise<void>;
  ensurePresentMonBootstrap(options?: PresentMonBootstrapOptions): Promise<void>;
}
