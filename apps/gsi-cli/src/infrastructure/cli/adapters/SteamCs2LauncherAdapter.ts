import { spawn } from "child_process";
import type {
  Cs2LauncherPort,
  Cs2LaunchOptions,
} from "../../../application/cli/ports/Cs2LauncherPort";

const CS2_APP_ID = "730";

/**
 * Adapter that launches CS2 through Steam.
 *
 * Strategy:
 * - When a `steam.exe` path is known, use `steam.exe -applaunch 730 [args]`
 *   so Steam attaches the requested launch arguments to the game.
 * - Otherwise, dispatch the `steam://run/730` URL via `cmd /c start`. If
 *   args are present they are appended through the URL syntax
 *   (`steam://run/730//<urlencoded args>/`).
 *
 * The spawned process is detached and its stdio is ignored so the CLI does
 * not stay tethered to Steam after firing the launch.
 */
export class SteamCs2LauncherAdapter implements Cs2LauncherPort {
  constructor(private readonly steamExePath?: string) {}

  async launch(options?: Cs2LaunchOptions): Promise<void> {
    const args = options?.args ?? [];

    if (this.steamExePath) {
      this.spawnDetached(this.steamExePath, ["-applaunch", CS2_APP_ID, ...args]);
      return;
    }

    const url = buildSteamRunUrl(args);
    // The empty "" argument is the window title for `start`; without it the
    // first quoted token would be interpreted as the title, swallowing the URL.
    this.spawnDetached("cmd", ["/c", "start", "", url]);
  }

  private spawnDetached(command: string, commandArgs: readonly string[]): void {
    const child = spawn(command, commandArgs, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  }
}

const buildSteamRunUrl = (args: readonly string[]): string => {
  if (args.length === 0) {
    return `steam://run/${CS2_APP_ID}`;
  }
  const encoded = args.map((arg) => encodeURIComponent(arg)).join("%20");
  return `steam://run/${CS2_APP_ID}//${encoded}/`;
};
