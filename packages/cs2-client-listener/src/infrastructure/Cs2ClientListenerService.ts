import type { GsiGatewayOptions } from "@cs2helper/gsi-gateway";
import type { PresentMonBootstrapOptions } from "@cs2helper/performance-processor";
import type { PowerShellCommandPort } from "@cs2helper/shared";
import { withPortsAsync } from "@cs2helper/shared";
import type { TickFrame } from "@cs2helper/tick-hub";
import { startCs2ClientListener } from "../application/useCases/startCs2ClientListener";
import { stopCs2ClientListener } from "../application/useCases/stopCs2ClientListener";
import type { Cs2ClientListenerStartResult } from "../domain/cs2ClientListenerStartResult";
import type { Cs2ClientListenerSdk } from "../domain/cs2ClientListenerSdk";
import { Cs2ClientListenerControlAdapter } from "./Cs2ClientListenerControlAdapter";
import { Cs2ClientListenerEngine, type Cs2ClientListenerOptions } from "./Cs2ClientListenerEngine";

export type { Cs2ClientListenerOptions };

/**
 * Public SDK: composes {@link Cs2ClientListenerEngine} and wires lifecycle via
 * {@link Cs2ClientListenerControlAdapter} + use cases (no mixed port surface on this class).
 */
export class Cs2ClientListenerService implements Cs2ClientListenerSdk {
  private readonly engine: Cs2ClientListenerEngine;
  private readonly control: Cs2ClientListenerControlAdapter;

  readonly start: (gatewayOptions?: GsiGatewayOptions) => Promise<Cs2ClientListenerStartResult>;
  readonly stop: () => Promise<void>;

  constructor(powershell: PowerShellCommandPort, options: Cs2ClientListenerOptions = {}) {
    this.engine = new Cs2ClientListenerEngine(powershell, options);
    this.control = new Cs2ClientListenerControlAdapter(this.engine);
    this.start = withPortsAsync(startCs2ClientListener, [this.control]);
    this.stop = withPortsAsync(stopCs2ClientListener, [this.control]);
  }

  startRecording(filePath: string): void {
    this.engine.startRecording(filePath);
  }

  stopRecording(): Promise<void> {
    return this.engine.stopRecording();
  }

  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void {
    return this.engine.subscribeTickFrames(listener);
  }

  isRunning(): boolean {
    return this.engine.isRunning();
  }

  getGatewayDiagnostics() {
    return this.engine.getGatewayDiagnostics();
  }

  ensurePresentMonBootstrap(options?: PresentMonBootstrapOptions): Promise<void> {
    return this.engine.ensurePresentMonBootstrap(options);
  }
}
