import type { ChildExitLogPort } from "../../application/ports/ChildExitLogPort";

export class ConsoleChildExitLog implements ChildExitLogPort {
  logDedicatedExited(code: number | null, signal: NodeJS.Signals | null): void {
    console.error(`cs2 process exited: code=${code} signal=${signal ?? "none"}`);
  }
}
