/**
 * Port for persisting GSI data streams to a storage medium (usually disk).
 */
export interface RecorderPort {
  /** Opens a new recording session at the specified path/name. */
  open: (filename: string) => Promise<void>;
  
  /** Closes the current recording session and performs cleanup. */
  close: () => Promise<void>;
  
  /** Appends a single tick/snapshot to the current recording. */
  writeTick: (data: string) => Promise<void>;
  
  /** Attaches an unsubscribe function to be called when recording stops. */
  setUnsubscribe: (unsub: () => void) => void;
  
  /** Checks if a recording session is currently active. */
  isRecording: () => boolean;
}
