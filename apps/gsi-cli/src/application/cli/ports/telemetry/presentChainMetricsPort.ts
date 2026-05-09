import type {
  PresentChainSession,
  PresentChainSessionOptions,
} from "../../../../domain/telemetry/presentChain";

export type {
  PresentChainSession,
  PresentChainSessionOptions,
  PresentFrameSample,
} from "../../../../domain/telemetry/presentChain";

/**
 * Session-based observation of present/frame timing for one process (ETW / PresentMon).
 */
export interface PresentChainMetricsPort {
  /**
   * Starts observing the presentation chain for `options.pid`. The returned
   * `stop` ends the session and releases subprocess/ETW resources.
   */
  startSession: (options: PresentChainSessionOptions) => Promise<PresentChainSession>;
}
