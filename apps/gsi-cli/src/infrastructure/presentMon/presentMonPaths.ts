import path from "path";
import { getAppDataDir } from "../adapters/appDataPaths";

export const PRESENTMON_SUBDIR = "presentmon";
export const PRESENTMON_EXE_NAME = "PresentMon.exe";
export const PRESENTMON_MANIFEST_NAME = "presentmon-manifest.json";

export function getPresentMonInstallDir(): string {
  return path.join(getAppDataDir(), PRESENTMON_SUBDIR);
}

export function getManagedPresentMonExecutablePath(): string {
  return path.join(getPresentMonInstallDir(), PRESENTMON_EXE_NAME);
}

export function getPresentMonManifestPath(): string {
  return path.join(getPresentMonInstallDir(), PRESENTMON_MANIFEST_NAME);
}
