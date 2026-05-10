import type { UseCase } from "@cs2helper/shared";
import type { Cs2ProcessTrackingPollOptions, Cs2ProcessTrackingSnapshot } from "../../domain/telemetry";
import type {
  Cs2ProcessPort,
  GpuProcessMetricsPort,
  OsProcessMetricsPort,
  PresentChainMetricsPort,
} from "../ports";
import { createCs2ProcessTrackingSession } from "./cs2ProcessTrackingSession";

export interface Cs2ProcessTrackingAlignmentSubscription {
  unsubscribe: () => void;
  alignToExternalTick: () => Promise<void>;
}

/**
 * Same polling behavior as `subscribeCs2ProcessTracking`, plus `alignToExternalTick` for a master
 * clock (e.g. GSI) to push the latest PresentMon frame and optionally OS/GPU (throttled by
 * `externalAlignSystemSampleMinMs`).
 *
 * Ports tuple order: `[cs2Process, osMetrics, gpuMetrics, presentChain]`.
 */
export const subscribeCs2ProcessTrackingForAlignment: UseCase<
  [Cs2ProcessPort, OsProcessMetricsPort, GpuProcessMetricsPort, PresentChainMetricsPort],
  [
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: Cs2ProcessTrackingPollOptions,
  ],
  Cs2ProcessTrackingAlignmentSubscription
> = (ports, listener, options) => {
  const session = createCs2ProcessTrackingSession(ports, listener, options);
  session.startPollLoop();
  return {
    unsubscribe: session.dispose,
    alignToExternalTick: session.alignToExternalTick,
  };
};
