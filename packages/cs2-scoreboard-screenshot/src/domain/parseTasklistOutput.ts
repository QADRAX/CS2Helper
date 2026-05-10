import type { TasklistProcessStatus } from "./tasklistProcessStatus";

/**
 * Parses the CSV output of `tasklist /FO CSV /NH` filtered by image name.
 *
 * Expected formats:
 * - Match: `"<image>","12345","Console","1","123,456 K"`
 * - No match: `INFO: No tasks are running which match the specified criteria.`
 */
export function parseTasklistOutput(
  stdout: string,
  expectedImageName: string
): TasklistProcessStatus {
  const trimmed = stdout.trim();
  if (trimmed.length === 0) {
    return { running: false };
  }

  const firstLine = trimmed.split(/\r?\n/, 1)[0];
  if (!firstLine) {
    return { running: false };
  }

  const lead = firstLine.trim();
  if (!lead.startsWith('"')) {
    return { running: false };
  }

  const columns = parseTasklistCsvRow(firstLine);
  const imageName = columns[0]?.toLowerCase();
  if (imageName !== expectedImageName.toLowerCase()) {
    return { running: false };
  }

  const pidValue = columns[1];
  const pid = pidValue ? Number.parseInt(pidValue, 10) : Number.NaN;
  return Number.isFinite(pid) ? { running: true, pid } : { running: true };
}

/**
 * Minimal CSV row parser tailored to `tasklist`'s output: comma-separated
 * double-quoted fields, no embedded newlines, no escaped quotes in practice.
 */
export function parseTasklistCsvRow(row: string): string[] {
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
}
