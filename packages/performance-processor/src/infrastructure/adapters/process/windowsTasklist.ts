import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface TasklistProcessStatus {
  running: boolean;
  pid?: number;
}

/**
 * Queries Windows `tasklist` for a given image name and returns whether a
 * matching process is running. On non-Windows platforms it transparently
 * reports `running: false` so callers get a predictable answer.
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

/**
 * Parses the CSV output of `tasklist /FO CSV /NH` filtered by image name.
 *
 * Expected formats:
 * - Match: `"<image>","12345","Console","1","123,456 K"`
 * - No match: `INFO: No tasks are running which match the specified criteria.`
 */
const parseTasklistOutput = (
  stdout: string,
  expectedImageName: string
): TasklistProcessStatus => {
  const trimmed = stdout.trim();
  if (trimmed.length === 0) {
    return { running: false };
  }

  const firstLine = trimmed.split(/\r?\n/, 1)[0];
  if (!firstLine) {
    return { running: false };
  }

  const lead = firstLine.trim();
  // Filter miss: localized INFO lines (e.g. Spanish INFORMACIÓN:) are not CSV rows.
  if (!lead.startsWith('"')) {
    return { running: false };
  }

  const columns = parseCsvRow(firstLine);
  const imageName = columns[0]?.toLowerCase();
  if (imageName !== expectedImageName.toLowerCase()) {
    return { running: false };
  }

  const pidValue = columns[1];
  const pid = pidValue ? Number.parseInt(pidValue, 10) : Number.NaN;
  return Number.isFinite(pid) ? { running: true, pid } : { running: true };
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
