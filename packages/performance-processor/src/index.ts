/**
 * @packageDocumentation
 * CS2 process and performance telemetry (OS/GPU metrics, PresentMon present chain).
 */

export {
  PerformanceProcessorService,
  type PerformanceProcessorServiceOptions,
  type Cs2PerformanceApi,
} from "./infrastructure/PerformanceProcessorService";

export type {
  PresentMonBootstrapOptions,
  PresentMonBootstrapProgressEvent,
  PresentMonBootstrapPort,
} from "./application/ports/PresentMonBootstrapPort";

export type { PowerShellCommandPort } from "./application/ports/PowerShellCommandPort";

export type { SubscribeCs2ProcessTrackingOptions } from "./application/useCases/subscribeCs2ProcessTracking";

export type * from "./domain";

/** Shared Windows `tasklist` helper (used by CS2 and Steam process adapters in gsi-cli). */
export {
  queryWindowsTasklist,
  type TasklistProcessStatus,
} from "./infrastructure/adapters/process/windowsTasklist";
