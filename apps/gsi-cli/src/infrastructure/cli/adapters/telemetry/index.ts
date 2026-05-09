/**
 * Windows-only process / GPU / present-chain telemetry adapters for `gsi-cli`.
 * Observation via ETW or PresentMon-style tooling is the same class of legitimate
 * monitoring as third-party FPS overlays; it does not read game memory.
 */
export * from "./WindowsCimOsProcessMetricsAdapter";
export * from "./WindowsCounterGpuProcessMetricsAdapter";
export * from "./PresentMonPresentChainMetricsAdapter";
