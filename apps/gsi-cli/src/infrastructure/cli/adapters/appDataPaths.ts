import path from "path";

const APP_VENDOR = "CS2Helper";
const APP_NAME = "gsi-cli";

function getAppDataRoot(): string {
  return process.env.APPDATA || process.cwd();
}

export function getAppDataDir(): string {
  return path.join(getAppDataRoot(), APP_VENDOR, APP_NAME);
}

export function getRecordingsDir(): string {
  return path.join(getAppDataDir(), "recordings");
}

export function buildRecordingFilePath(startedAt: Date = new Date()): string {
  const iso = startedAt.toISOString().replace(/[:.]/g, "-");
  return path.join(getRecordingsDir(), `gsi-${iso}.ndjson`);
}
