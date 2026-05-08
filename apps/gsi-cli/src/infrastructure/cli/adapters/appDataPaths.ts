import {
  buildGsiCliRecordingFilePath,
  getCliAppDataDir,
  getGsiCliRecordingsDir,
} from "@cs2helper/cli-common";

export function getAppDataDir(): string {
  return getCliAppDataDir("gsi-cli");
}

export function getRecordingsDir(): string {
  return getGsiCliRecordingsDir();
}

export function buildRecordingFilePath(startedAt: Date = new Date()): string {
  return buildGsiCliRecordingFilePath(startedAt);
}
