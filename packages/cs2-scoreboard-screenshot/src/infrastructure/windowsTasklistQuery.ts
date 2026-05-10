import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { parseTasklistOutput } from "../domain/parseTasklistOutput";
import type { TasklistProcessStatus } from "../domain/tasklistProcessStatus";

const execFileAsync = promisify(execFile);

export type { TasklistProcessStatus };

/**
 * Queries Windows `tasklist` for a given image name. Parsing is delegated to
 * {@link parseTasklistOutput} in domain.
 */
export const queryWindowsTasklist = async (
  imageName: string
): Promise<TasklistProcessStatus> => {
  if (process.platform !== "win32") {
    return { running: false };
  }

  try {
    const { stdout } = await execFileAsync(
      "tasklist",
      ["/FI", `IMAGENAME eq ${imageName}`, "/FO", "CSV", "/NH"],
      { windowsHide: true, timeout: 15_000 }
    );
    return parseTasklistOutput(stdout, imageName);
  } catch {
    return { running: false };
  }
};
