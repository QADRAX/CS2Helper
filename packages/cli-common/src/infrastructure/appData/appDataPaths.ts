import path from "path";

const APP_VENDOR = "CS2Helper";
const GSI_CLI_APP_NAME = "gsi-cli";

/** Returns the OS app-data root used by CS2Helper CLI tools. */
export function getAppDataRoot(): string {
  return process.env.APPDATA || process.cwd();
}

/** Returns the app-data folder for one CS2Helper CLI app. */
export function getCliAppDataDir(appName: string): string {
  return path.join(getAppDataRoot(), APP_VENDOR, appName);
}

/** Returns the existing raw GSI records directory written by `gsi-cli`. */
export function getGsiCliRecordingsDir(): string {
  return path.join(getCliAppDataDir(GSI_CLI_APP_NAME), "recordings");
}

/** Scoreboard screenshot output folder for a host CLI app (e.g. `gsi-cli`). */
export function getScoreboardSnapshotsDir(hostAppName: string): string {
  return path.join(getCliAppDataDir(hostAppName), "scoreboard-snapshots");
}

/** Builds a timestamped raw GSI recording file path in the shared records directory. */
export function buildGsiCliRecordingFilePath(startedAt: Date = new Date()): string {
  const iso = startedAt.toISOString().replace(/[:.]/g, "-");
  return path.join(getGsiCliRecordingsDir(), `gsi-${iso}.ndjson`);
}
