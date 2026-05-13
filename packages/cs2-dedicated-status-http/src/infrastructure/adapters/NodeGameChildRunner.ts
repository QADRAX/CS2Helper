import { spawn, type ChildProcess } from "node:child_process";
import type { GameChildRunnerPort } from "../../application/ports/GameChildRunnerPort";

export class NodeGameChildRunner implements GameChildRunnerPort {
  private child: ChildProcess | null = null;
  private childExited = true;
  private stoppingForUpdate = false;

  constructor(private readonly env: NodeJS.ProcessEnv) {}

  spawn(
    scriptPath: string,
    onUnexpectedExit: (code: number | null, signal: NodeJS.Signals | null) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.childExited = false;
      const proc = spawn(scriptPath, [], {
        stdio: "inherit",
        env: this.env,
      });
      this.child = proc;

      proc.once("spawn", () => {
        resolve();
      });
      proc.once("error", (err) => {
        this.child = null;
        this.childExited = true;
        reject(err);
      });
      proc.once("exit", (code, signal) => {
        this.childExited = true;
        if (this.stoppingForUpdate) {
          return;
        }
        onUnexpectedExit(code, signal);
      });
    });
  }

  isAlive(): boolean {
    return this.child !== null && !this.childExited && this.child.exitCode === null;
  }

  getPid(): number | null {
    return this.child?.pid ?? null;
  }

  signalShutdownKill(): void {
    if (this.child && !this.childExited) {
      this.child.kill("SIGTERM");
    }
  }

  stopForUpdate(killAfterMs: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.child || this.childExited) {
        resolve();
        return;
      }
      this.stoppingForUpdate = true;
      const proc = this.child;
      const done = (): void => {
        this.child = null;
        this.childExited = true;
        this.stoppingForUpdate = false;
        resolve();
      };
      proc.once("exit", done);
      proc.kill("SIGTERM");
      setTimeout(() => {
        try {
          proc.kill("SIGKILL");
        } catch {
          /* ignore */
        }
      }, killAfterMs);
    });
  }
}
