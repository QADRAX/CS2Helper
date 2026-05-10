import type { GsiGatewayOptions } from "@cs2helper/gsi-gateway";
import type { Cs2ClientListenerControlPort } from "../application/ports/Cs2ClientListenerControlPort";
import type { Cs2ClientListenerStartResult } from "../domain/cs2ClientListenerStartResult";
import type { Cs2ClientListenerEngine } from "./Cs2ClientListenerEngine";

/**
 * Application-port adapter for lifecycle use cases ({@link startCs2ClientListener} /
 * {@link stopCs2ClientListener}). Keeps {@link Cs2ClientListenerControlPort} separate from the public SDK.
 */
export class Cs2ClientListenerControlAdapter implements Cs2ClientListenerControlPort {
  constructor(private readonly engine: Cs2ClientListenerEngine) {}

  isRunning(): boolean {
    return this.engine.isRunning();
  }

  enterRunningMode(gatewayOptions?: GsiGatewayOptions): Promise<Cs2ClientListenerStartResult> {
    return this.engine.enterRunningMode(gatewayOptions);
  }

  exitRunningMode(): Promise<void> {
    return this.engine.exitRunningMode();
  }
}
