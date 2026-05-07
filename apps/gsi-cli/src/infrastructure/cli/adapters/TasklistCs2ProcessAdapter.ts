import { execFile } from "child_process";
import { promisify } from "util";
import type {
  Cs2ProcessPort,
  Cs2ProcessStatus,
} from "../../../application/cli/ports/Cs2ProcessPort";

const execFileAsync = promisify(execFile);

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
    if (process.platform !== "win32") {
      return { running: false };
    }

    try {
      const { stdout } = await execFileAsync("tasklist", [
        "/FI",
        `IMAGENAME eq ${CS2_IMAGE_NAME}`,
        "/FO",
        "CSV",
        "/NH",
      ]);

      return parseTasklistOutput(stdout);
    } catch {
      return { running: false };
    }
  }
}

/**
 * Parses the CSV output of `tasklist /FO CSV /NH` filtered by image name.
 *
 * Expected formats:
 * - Match: `"cs2.exe","12345","Console","1","123,456 K"`
 * - No match: `INFO: No tasks are running which match the specified criteria.`
 */
const parseTasklistOutput = (stdout: string): Cs2ProcessStatus => {
  const trimmed = stdout.trim();
  if (trimmed.length === 0 || trimmed.toUpperCase().startsWith("INFO:")) {
    return { running: false };
  }

  const firstLine = trimmed.split(/\r?\n/, 1)[0];
  if (!firstLine) {
    return { running: false };
  }

  const columns = parseCsvRow(firstLine);
  const imageName = columns[0]?.toLowerCase();
  if (imageName !== CS2_IMAGE_NAME) {
    return { running: false };
  }

  const pidValue = columns[1];
  const pid = pidValue ? Number.parseInt(pidValue, 10) : Number.NaN;
  return Number.isFinite(pid)
    ? { running: true, pid }
    : { running: true };
};

/**
 * Minimal CSV row parser tailored to `tasklist`'s output: comma-separated
 * double-quoted fields, no embedded newlines, no escaped quotes in practice.
 */
const parseCsvRow = (row: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
};
