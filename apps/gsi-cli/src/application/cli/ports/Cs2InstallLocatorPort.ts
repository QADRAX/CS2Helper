/**
 * Resolved location of a CS2 install on disk, including the Steam library
 * that hosts it and (optionally) the path to `steam.exe` for launching.
 */
export interface Cs2InstallLocation {
  /** Absolute path to the CS2 install root (.../steamapps/common/Counter-Strike Global Offensive). */
  installPath: string;

  /** Absolute path to the cfg directory where the GSI cfg should be dropped. */
  cfgPath: string;

  /** Absolute path to the Steam library that contains AppID 730. */
  steamLibraryPath: string;

  /** Absolute path to `steam.exe`, when discoverable. */
  steamExePath?: string;
}

/**
 * Application-layer abstraction for discovering and validating the CS2
 * installation. Implementations encapsulate Steam-specific lookups
 * (registry, libraryfolders.vdf, etc.).
 */
export interface Cs2InstallLocatorPort {
  /**
   * Auto-detects the CS2 install via the Steam registry entry and the
   * `libraryfolders.vdf` manifest. Returns null when CS2 cannot be located.
   */
  detect: () => Promise<Cs2InstallLocation | null>;

  /**
   * Validates a manually provided CS2 install path by checking that the
   * expected `game/csgo/cfg` subfolder exists. Best-effort fills in the
   * remaining fields from the same Steam discovery, falling back to derived
   * defaults when needed.
   */
  validate: (installPath: string) => Promise<Cs2InstallLocation | null>;
}
