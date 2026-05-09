import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface RegistryProbe {
  hive: "HKCU" | "HKLM";
  key: string;
  value: string;
}

/** Same probe order as Valve’s Windows installer: HKCU path, then 64-bit and 32-bit HKLM. */
const REGISTRY_PROBES: readonly RegistryProbe[] = [
  { hive: "HKCU", key: "SOFTWARE\\Valve\\Steam", value: "SteamPath" },
  { hive: "HKLM", key: "SOFTWARE\\WOW6432Node\\Valve\\Steam", value: "InstallPath" },
  { hive: "HKLM", key: "SOFTWARE\\Valve\\Steam", value: "InstallPath" },
];

/**
 * Reads the Steam client install directory from the Windows registry.
 * Returns null when not on Windows or when no known value is present.
 */
export const readWindowsSteamRootFromRegistry = async (): Promise<string | null> => {
  if (process.platform !== "win32") {
    return null;
  }
  for (const probe of REGISTRY_PROBES) {
    const value = await readRegistryString(probe);
    if (value) {
      return path.normalize(value);
    }
  }
  return null;
};

/**
 * Returns the absolute path to `steam.exe` under the given Steam root when
 * the file exists; otherwise undefined.
 */
export const resolveSteamExePath = async (
  steamRootPath: string
): Promise<string | undefined> => {
  const candidate = path.join(steamRootPath, "steam.exe");
  return (await pathExists(candidate)) ? candidate : undefined;
};

export const pathExists = async (target: string): Promise<boolean> => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const readRegistryString = async (probe: RegistryProbe): Promise<string | null> => {
  try {
    const { stdout } = await execFileAsync("reg", [
      "query",
      `${probe.hive}\\${probe.key}`,
      "/v",
      probe.value,
    ]);
    return parseRegQueryOutput(stdout, probe.value);
  } catch {
    return null;
  }
};

/**
 * Parses the output of `reg query <key> /v <name>`.
 */
const parseRegQueryOutput = (stdout: string, valueName: string): string | null => {
  const lines = stdout.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(valueName)) {
      continue;
    }
    const match = /^\S+\s+REG_(?:SZ|EXPAND_SZ)\s+(.+)$/.exec(trimmed);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
};
