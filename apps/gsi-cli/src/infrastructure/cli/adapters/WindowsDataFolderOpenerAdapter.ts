import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import type { DataFolderOpenerPort } from "../../../application/cli/ports/DataFolderOpenerPort";
import { getAppDataDir } from "./appDataPaths";

const execFileAsync = promisify(execFile);

export class WindowsDataFolderOpenerAdapter implements DataFolderOpenerPort {
  async openFolder(): Promise<void> {
    const folder = getAppDataDir();
    await fs.mkdir(folder, { recursive: true });

    if (process.platform !== "win32") {
      throw new Error("Open data folder is currently implemented for Windows only.");
    }

    await execFileAsync("cmd", ["/c", "start", "", folder], { windowsHide: true });
  }
}
