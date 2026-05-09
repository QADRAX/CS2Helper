import type {
  SteamInstallLocation,
  SteamInstallLocatorPort,
} from "../../application/ports/SteamInstallLocatorPort";
import {
  readWindowsSteamRootFromRegistry,
  resolveSteamExePath,
} from "./steam/windowsSteamRegistry";

/**
 * Windows adapter that detects the Steam client via registry keys written by
 * the official installer, then verifies that `steam.exe` exists on disk.
 *
 * On non-Windows platforms both `isInstalled` and `detect` resolve to
 * negative results without throwing.
 */
export class SteamRegistrySteamInstallAdapter implements SteamInstallLocatorPort {
  async isInstalled(): Promise<boolean> {
    return (await this.detect()) !== null;
  }

  async detect(): Promise<SteamInstallLocation | null> {
    if (process.platform !== "win32") {
      return null;
    }

    const steamRootPath = await readWindowsSteamRootFromRegistry();
    if (!steamRootPath) {
      return null;
    }

    const steamExePath = await resolveSteamExePath(steamRootPath);
    if (!steamExePath) {
      return null;
    }

    return { steamRootPath, steamExePath };
  }
}
