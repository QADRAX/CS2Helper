/**
 * Resolved Steam client install on disk (registry root + verified `steam.exe`).
 */
export interface SteamInstallLocation {
  /** Directory where Steam is installed (e.g. `C:\Program Files (x86)\Steam`). */
  steamRootPath: string;

  /** Absolute path to `steam.exe`. */
  steamExePath: string;
}

/**
 * Application-layer abstraction for detecting whether the Steam client is
 * installed and where. Implementations are OS-specific (Windows registry, etc.).
 */
export interface SteamInstallLocatorPort {
  /** True when Steam appears installed and `steam.exe` exists at the resolved path. */
  isInstalled: () => Promise<boolean>;

  /** Returns install paths or null when Steam cannot be located or verified. */
  detect: () => Promise<SteamInstallLocation | null>;
}
