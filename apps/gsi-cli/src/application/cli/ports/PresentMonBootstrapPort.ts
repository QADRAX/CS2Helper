/** Progress events for UI loaders (startup bootstrap only). */
export type PresentMonBootstrapProgressEvent =
  | { kind: "started" }
  | { kind: "checking_release" }
  | { kind: "downloading" }
  | { kind: "verifying_binary" }
  | { kind: "using_local_binary" }
  | { kind: "skipped_non_windows" }
  | { kind: "skipped_env_override" };

export interface PresentMonBootstrapOptions {
  /** If true, queries GitHub even when the last check was recent (still shares one in-flight download). */
  forceRemoteCheck?: boolean;
  onProgress?: (event: PresentMonBootstrapProgressEvent) => void;
}

/**
 * Ensures a managed PresentMon binary is available for Windows telemetry (download/update from official releases).
 * Infrastructure implements GitHub fetch, AppData layout, and env overrides.
 */
export interface PresentMonBootstrapPort {
  ensureReady(options?: PresentMonBootstrapOptions): Promise<void>;
}
