export interface RecorderPort {
  start: (filename: string) => Promise<void>;
  stop: () => Promise<void>;
  write: (data: string) => Promise<void>;
  setCleanup: (cleanup: () => void) => void;
  isRecording: () => boolean;
}
