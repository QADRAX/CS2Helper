import type {
  SteamProcessPort,
  SteamProcessStatus,
} from "../../application/ports/SteamProcessPort";
import { queryWindowsTasklist } from "./process/windowsTasklist";

const STEAM_IMAGE_NAME = "steam.exe";

/**
 * Windows adapter that queries the running Steam client process via
 * `tasklist`.
 *
 * Mirrors the lightweight, dependency-free approach used for CS2 and falls
 * back to `running: false` on non-Windows platforms.
 */
export class TasklistSteamProcessAdapter implements SteamProcessPort {
  async isRunning(): Promise<boolean> {
    const { running } = await this.getStatus();
    return running;
  }

  async getStatus(): Promise<SteamProcessStatus> {
    return queryWindowsTasklist(STEAM_IMAGE_NAME);
  }
}
