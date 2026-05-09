import type { Cs2ProcessPort, Cs2ProcessStatus } from "../../application/ports";
import { queryWindowsTasklist } from "./process/windowsTasklist";

const CS2_IMAGE_NAME = "cs2.exe";

/**
 * Windows adapter that queries the running CS2 process via `tasklist`.
 *
 * The implementation shells out to the standard Windows utility instead of
 * pulling a native dependency, keeping the CLI lightweight. On non-Windows
 * platforms it transparently reports `running: false` so callers get a
 * predictable answer without crashing the process.
 */
export class TasklistCs2ProcessAdapter implements Cs2ProcessPort {
  async isRunning(): Promise<boolean> {
    const { running } = await this.getStatus();
    return running;
  }

  async getStatus(): Promise<Cs2ProcessStatus> {
    return queryWindowsTasklist(CS2_IMAGE_NAME);
  }
}
