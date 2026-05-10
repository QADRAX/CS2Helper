/**
 * Windows-only: frame pacing derived from the **graphics presentation chain**
 * (e.g. DXGI/D3D **Present** timing via ETW), correlating with perceived FPS — not
 * the same as `net_graph` server tick or in-game diagnostic HUD.
 *
 * **Implementation note:** A practical approach in Node without native ETW bindings
 * is spawning **PresentMon** (or equivalent) as a child process and parsing its
 * output filtered by PID. A future **FFI** layer (`koffi` + ETW APIs) could replace
 * that for lower overhead. ETW may require appropriate permissions on locked-down
 * systems.
 */
export interface PresentFrameSample {
  /**
   * Time basis for the sample: adapter may use QPC-derived milliseconds, Unix ms,
   * or another comparable clock depending on the backend (PresentMon/ETW).
   */
  timestampQpcOrUnix?: number;
  /** Time since previous present in milliseconds, when known. */
  frametimeMs?: number;
  /** Smoothed FPS estimate when the backend provides it. */
  fpsSmoothed?: number;
}

export interface PresentChainSessionOptions {
  pid: number;
  onFrame?: (sample: PresentFrameSample) => void;
}

export interface PresentChainSession {
  stop: () => Promise<void>;
}
