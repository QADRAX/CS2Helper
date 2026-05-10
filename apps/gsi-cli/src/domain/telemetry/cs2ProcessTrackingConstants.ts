/** Default poll interval (ms) for CS2 process + telemetry tracking subscriptions. */
export const DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS = 1000;

/**
 * Minimum time between listener updates driven by present-chain frames (ms).
 * OS/GPU samples still follow {@link DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS}.
 */
export const DEFAULT_PRESENT_TELEMETRY_THROTTLE_MS = 200;
