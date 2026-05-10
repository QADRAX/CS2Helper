import type { GsiGatewayOptions } from "@cs2helper/gsi-gateway";
import type { Cs2ClientListenerStartResult } from "../../domain";

/**
 * Imperative lifecycle surface implemented by {@link Cs2ClientListenerService} for use cases.
 */
export interface Cs2ClientListenerControlPort {
  isRunning(): boolean;
  enterRunningMode(gatewayOptions?: GsiGatewayOptions): Promise<Cs2ClientListenerStartResult>;
  exitRunningMode(): Promise<void>;
}
