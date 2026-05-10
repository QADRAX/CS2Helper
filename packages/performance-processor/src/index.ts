/**
 * @packageDocumentation
 * CS2 process and performance telemetry (OS/GPU metrics, PresentMon present chain).
 */

export {
  PerformanceProcessorService,
  type PerformanceProcessorServiceOptions,
  type Cs2PerformanceApi,
} from "./infrastructure/PerformanceProcessorService";

export type { Cs2ProcessTrackingAlignmentSubscription } from "./application/useCases/subscribeCs2ProcessTrackingForAlignment";
export { subscribeCs2ProcessTrackingForAlignment } from "./application/useCases/subscribeCs2ProcessTrackingForAlignment";

export type {
  PresentMonBootstrapOptions,
  PresentMonBootstrapProgressEvent,
  PresentMonBootstrapPort,
} from "./application/ports/PresentMonBootstrapPort";

export type { PowerShellCommandPort } from "@cs2helper/shared";

export type * from "./domain";

/** Shared Windows `tasklist` helper (used by CS2 and Steam process adapters in gsi-cli). */
export {
  queryWindowsTasklist,
  type TasklistProcessStatus,
} from "./infrastructure/adapters/process/windowsTasklist";
