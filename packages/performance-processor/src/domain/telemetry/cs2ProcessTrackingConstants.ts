/** Default: how often the tracker wakes to check `cs2.exe` visibility (running / pid). */
export const DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS = 1000;

/**
 * Default: minimum ms between OS + GPU counter samples (PowerShell / CIM).
 * When unset in options, matches {@link DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS}.
 */
export const DEFAULT_SYSTEM_METRICS_INTERVAL_MS = DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS;

/**
 * Default: minimum ms between listener updates driven by present-chain frames (FPS path).
 * OS/GPU fields reflect the last completed system metrics sample (often slower than FPS).
 */
export const DEFAULT_PRESENT_NOTIFY_INTERVAL_MS = 200;
