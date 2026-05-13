export interface ChildExitLogPort {
  logDedicatedExited(code: number | null, signal: NodeJS.Signals | null): void;
}
