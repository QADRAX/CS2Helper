import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import * as readline from "node:readline";
import type {
  PresentChainMetricsPort,
  PresentChainSession,
  PresentChainSessionOptions,
} from "../../../application/ports";
import { appendPresentMonFpsSmoothing } from "../../../domain/telemetry/presentMonFpsSmooth";
import {
  parsePresentMonHeader,
  presentMonDataLineToSample,
  splitPresentMonCsvLine,
} from "../../../domain/telemetry/presentMonCsvParse";
import { getManagedPresentMonExecutablePath } from "../../presentMon/presentMonPaths";
import { assertPositiveIntegerPid, requireWin32 } from "../../../domain/platform/requireWin32";

const FPS_SMOOTH_WINDOW = 32;

/**
 * Spawns [PresentMon](https://github.com/GameTechDev/PresentMon) with `--output_stdout`
 * and parses CSV rows into {@link PresentFrameSample}.
 *
 * Resolution order: `CS2HELPER_PRESENTMON_PATH` / `PRESENTMON_PATH`, then a managed copy under
 * `%APPDATA%\\CS2Helper\\gsi-cli\\presentmon\\PresentMon.exe` (installed at app startup),
 * then `PresentMon.exe` on `PATH`.
 *
 * May require elevation or ETW permissions on some systems.
 */
export class PresentMonPresentChainMetricsAdapter implements PresentChainMetricsPort {
  async startSession(options: PresentChainSessionOptions): Promise<PresentChainSession> {
    requireWin32("PresentMonPresentChainMetricsAdapter");
    assertPositiveIntegerPid(options.pid);

    const exe = resolvePresentMonExecutable();
    const args = [
      "--process_id",
      String(options.pid),
      "--output_stdout",
      "--stop_existing_session",
      "--no_console_stats",
      "--qpc_time_ms",
    ];

    const child = spawn(exe, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (!child.stdout) {
      throw new Error("PresentMonPresentChainMetricsAdapter: failed to open stdout pipe");
    }

    const rl = readline.createInterface({ input: child.stdout });
    let layout: ReturnType<typeof parsePresentMonHeader> | null = null;
    const frametimesMs: number[] = [];

    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;
      if (layout === null) {
        const parsed = parsePresentMonHeader(trimmed);
        if (parsed) {
          layout = parsed;
        }
        return;
      }
      const cells = splitPresentMonCsvLine(trimmed);
      if (cells.length < 2) return;
      const raw = presentMonDataLineToSample(
        { msBetweenPresents: layout.msBetweenPresents, cpuStartQpcMs: layout.cpuStartQpcMs },
        cells
      );
      if (raw && options.onFrame) {
        options.onFrame(appendPresentMonFpsSmoothing(raw, frametimesMs, FPS_SMOOTH_WINDOW));
      }
    });

    await new Promise<void>((resolve, reject) => {
      const fail = (err: Error) => reject(err);
      const onSpawnError = (err: NodeJS.ErrnoException) => {
        if (err.code === "ENOENT") {
          fail(
            new Error(
              `PresentMon executable not found (${exe}). Install PresentMon or set CS2HELPER_PRESENTMON_PATH.`
            )
          );
        } else {
          fail(err);
        }
      };
      child.once("error", onSpawnError);
      child.once("spawn", () => {
        child.removeListener("error", onSpawnError);
        resolve();
      });
    });

    return {
      stop: async () => {
        rl.close();
        await stopPresentMonChild(child);
      },
    };
  }
}

function resolvePresentMonExecutable(): string {
  const fromEnv = process.env.CS2HELPER_PRESENTMON_PATH ?? process.env.PRESENTMON_PATH;
  if (fromEnv?.trim()) {
    return fromEnv.trim();
  }
  const managed = getManagedPresentMonExecutablePath();
  if (fs.existsSync(managed)) {
    return managed;
  }
  return "PresentMon.exe";
}

async function stopPresentMonChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  child.kill();
  await new Promise<void>((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, 4000);
    child.once("close", done);
  });
}
