import { once } from "node:events";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

import {
  handleScoreboardHotkey,
  type HandleHotkeyResult,
  type HandleScoreboardHotkeyPorts,
} from "../application/useCases/handleScoreboardHotkey";
import { DEFAULT_SCOREBOARD_HOTKEY_ID } from "../domain/defaultScoreboardHotKeyId";
import type { ScoreboardCapturePolicy } from "../domain/scoreboardCapturePolicy";
import { WM_QUIT } from "../domain/win32Messages";
import { getKoffi } from "./loadKoffiRuntime";

export interface ScoreboardScreenshotSdk {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ScoreboardScreenshotServiceOptions {
  policy: ScoreboardCapturePolicy;
  ports: HandleScoreboardHotkeyPorts;
  triggerVirtualKey: number;
  triggerModifiers?: number;
  hotKeyId?: number;
  onHotkeyResult?: (result: HandleHotkeyResult) => void;
}

function resolveHotkeyWorkerScriptPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "hotkeyWorker.js");
}

function postQuitToThread(threadId: number): void {
  const koffi = getKoffi();
  const user32 = koffi.load("user32.dll");
  const PostThreadMessageW = user32.func("__stdcall", "PostThreadMessageW", "bool", [
    "uint32",
    "uint32",
    "uintptr_t",
    "intptr_t",
  ]);
  PostThreadMessageW(threadId >>> 0, WM_QUIT, 0, 0);
}

/**
 * Registers a global hotkey via `RegisterHotKey`, then runs the capture pipeline when fired.
 * Windows-only; call {@link start} while the host process is active.
 */
export class ScoreboardScreenshotService implements ScoreboardScreenshotSdk {
  private worker: Worker | undefined;

  constructor(private readonly options: ScoreboardScreenshotServiceOptions) {}

  async start(): Promise<void> {
    if (process.platform !== "win32") {
      throw new Error("ScoreboardScreenshotService is only supported on Windows.");
    }
    if (this.worker) {
      return;
    }

    const workerPath = resolveHotkeyWorkerScriptPath();
    const workerData = {
      vk: this.options.triggerVirtualKey,
      modifiers: this.options.triggerModifiers ?? 0,
      hotKeyId: this.options.hotKeyId ?? DEFAULT_SCOREBOARD_HOTKEY_ID,
    };

    const worker = new Worker(workerPath, { workerData });

    try {
      await new Promise<void>((resolve, reject) => {
        const fail = (err: Error) => {
          worker.off("message", onBootstrap);
          worker.off("exit", onEarlyExit);
          worker.off("error", onFail);
          reject(err);
        };

        const onBootstrap = (msg: unknown) => {
          const m = msg as { type?: string; code?: string };
          if (m?.type === "ready") {
            worker.off("message", onBootstrap);
            worker.off("exit", onEarlyExit);
            worker.off("error", onFail);
            worker.on("message", (hotMsg: unknown) => {
              if ((hotMsg as { type?: string }).type === "hotkey") {
                void this.dispatchHotkey();
              }
            });
            resolve();
          } else if (m?.type === "error") {
            fail(new Error(m.code ?? "register_hotkey_failed"));
          }
        };

        const onEarlyExit = (code: number) => {
          fail(new Error(`hotkey worker exited before ready (code ${code})`));
        };

        const onFail = (err: Error) => {
          fail(err);
        };

        worker.on("message", onBootstrap);
        worker.once("exit", onEarlyExit);
        worker.once("error", onFail);
      });

      this.worker = worker;
    } catch (e) {
      await worker.terminate().catch(() => undefined);
      throw e;
    }
  }

  async stop(): Promise<void> {
    const worker = this.worker;
    if (!worker) {
      return;
    }

    this.worker = undefined;
    const tid = worker.threadId;
    if (tid === undefined || tid === 0) {
      await worker.terminate();
      return;
    }

    postQuitToThread(tid);
    await once(worker, "exit");
  }

  private async dispatchHotkey(): Promise<void> {
    const result = await handleScoreboardHotkey(this.options.ports, this.options.policy);
    this.options.onHotkeyResult?.(result);
  }
}
