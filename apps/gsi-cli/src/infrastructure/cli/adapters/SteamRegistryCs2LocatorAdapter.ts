import fs from "fs/promises";
import path from "path";
import { parse as parseVdf } from "@node-steam/vdf";
import type {
  Cs2InstallLocation,
  Cs2InstallLocatorPort,
} from "../../../application/cli/ports/Cs2InstallLocatorPort";
import {
  pathExists,
  readWindowsSteamRootFromRegistry,
  resolveSteamExePath,
} from "./steam/windowsSteamRegistry";

const CS2_APP_ID = "730";
const CS2_COMMON_FOLDER = "Counter-Strike Global Offensive";
const CS2_CFG_RELATIVE = path.join("game", "csgo", "cfg");

interface LibraryFolderEntry {
  path?: string;
  apps?: Record<string, unknown>;
}

interface LibraryFoldersFile {
  libraryfolders?: Record<string, LibraryFolderEntry>;
}

/**
 * Windows adapter that locates the CS2 install by reading the Steam
 * registry entry, parsing `libraryfolders.vdf`, and verifying that the
 * expected `game/csgo/cfg` folder exists for AppID 730.
 *
 * Falls back gracefully (returns null) on non-Windows platforms or when
 * any step of the chain cannot be completed.
 */
export class SteamRegistryCs2LocatorAdapter implements Cs2InstallLocatorPort {
  async detect(): Promise<Cs2InstallLocation | null> {
    if (process.platform !== "win32") {
      return null;
    }

    const steamPath = await readWindowsSteamRootFromRegistry();
    if (!steamPath) {
      return null;
    }

    const steamExePath = await resolveSteamExePath(steamPath);
    const libraries = await readLibraryFolders(steamPath);

    for (const libraryPath of libraries.matchingApp730) {
      const installPath = path.join(libraryPath, "steamapps", "common", CS2_COMMON_FOLDER);
      const cfgPath = path.join(installPath, CS2_CFG_RELATIVE);
      if (await pathExists(cfgPath)) {
        return {
          installPath,
          cfgPath,
          steamLibraryPath: libraryPath,
          steamExePath,
        };
      }
    }

    // Fallback: scan every known library for the canonical folder, even if
    // the manifest didn't list AppID 730 (covers stale libraryfolders.vdf).
    for (const libraryPath of libraries.all) {
      const installPath = path.join(libraryPath, "steamapps", "common", CS2_COMMON_FOLDER);
      const cfgPath = path.join(installPath, CS2_CFG_RELATIVE);
      if (await pathExists(cfgPath)) {
        return {
          installPath,
          cfgPath,
          steamLibraryPath: libraryPath,
          steamExePath,
        };
      }
    }

    return null;
  }

  async validate(installPath: string): Promise<Cs2InstallLocation | null> {
    const cfgPath = path.join(installPath, CS2_CFG_RELATIVE);
    if (!(await pathExists(cfgPath))) {
      return null;
    }

    const steamPath =
      process.platform === "win32"
        ? await readWindowsSteamRootFromRegistry()
        : undefined;
    const steamExePath = steamPath ? await resolveSteamExePath(steamPath) : undefined;
    const steamLibraryPath = inferLibraryRoot(installPath);

    return {
      installPath,
      cfgPath,
      steamLibraryPath,
      steamExePath,
    };
  }
}

interface DiscoveredLibraries {
  all: string[];
  matchingApp730: string[];
}

const readLibraryFolders = async (steamPath: string): Promise<DiscoveredLibraries> => {
  const manifestPath = path.join(steamPath, "steamapps", "libraryfolders.vdf");
  let manifestText: string;
  try {
    manifestText = await fs.readFile(manifestPath, "utf-8");
  } catch {
    return { all: [steamPath], matchingApp730: [] };
  }

  let parsed: LibraryFoldersFile;
  try {
    parsed = parseVdf(manifestText) as LibraryFoldersFile;
  } catch {
    return { all: [steamPath], matchingApp730: [] };
  }

  const libraries = parsed.libraryfolders ?? {};
  const all: string[] = [];
  const matchingApp730: string[] = [];

  for (const entry of Object.values(libraries)) {
    if (!entry || typeof entry.path !== "string") {
      continue;
    }
    const libraryPath = path.normalize(entry.path);
    all.push(libraryPath);
    if (entry.apps && Object.prototype.hasOwnProperty.call(entry.apps, CS2_APP_ID)) {
      matchingApp730.push(libraryPath);
    }
  }

  if (all.length === 0) {
    all.push(steamPath);
  }

  return { all, matchingApp730 };
};

/**
 * Walks back from a CS2 install path to derive the Steam library root,
 * i.e. the parent of `steamapps/common`. Returns the original path when
 * the expected layout is not present.
 */
const inferLibraryRoot = (installPath: string): string => {
  const normalized = path.normalize(installPath);
  const segments = normalized.split(path.sep);
  const commonIdx = segments.lastIndexOf("common");
  if (commonIdx >= 2 && segments[commonIdx - 1]?.toLowerCase() === "steamapps") {
    return segments.slice(0, commonIdx - 1).join(path.sep);
  }
  return normalized;
};
