/**
 * Logical payload of a CS2 Game State Integration cfg file.
 * Serialization to Valve's KeyValues/VDF format is the adapter's concern.
 */
export interface GsiCfgPayload {
  /** Identifier used as the cfg filename (gamestate_integration_<name>.cfg). */
  name: string;

  /** Optional display name written as the top-level VDF key. Defaults to `name`. */
  displayName?: string;

  /** Endpoint where CS2 should POST GSI ticks. */
  endpointUrl: string;

  /** Optional bearer-style token; when set, the `auth { token "..." }` block is emitted. */
  authToken?: string;

  /** Network timeouts and throttling tuning (seconds). */
  timeout?: number;
  buffer?: number;
  throttle?: number;
  heartbeat?: number;

  /** Map of GSI data sections to enable (key → "1"). */
  data?: Record<string, boolean>;
}

/**
 * Result of inspecting an installed GSI cfg file on disk.
 */
export interface InstalledGsiCfg {
  /** Absolute path of the cfg file. */
  filePath: string;

  /** Parsed payload, when the file exists and could be deserialized. */
  payload?: GsiCfgPayload;
}

/**
 * Application-layer abstraction for managing a GSI cfg file inside CS2's
 * `cfg` directory. The directory itself is supplied by the caller (typically
 * derived from `Cs2InstallLocatorPort` output) so this port stays focused on
 * file artefact concerns.
 */
export interface GsiConfigFilePort {
  /** Whether `gamestate_integration_<name>.cfg` exists in `cfgDir`. */
  isInstalled: (cfgDir: string, name: string) => Promise<boolean>;

  /** Reads the cfg file metadata. Returns null when missing. */
  read: (cfgDir: string, name: string) => Promise<InstalledGsiCfg | null>;

  /** Creates or overwrites the cfg file with the given payload. */
  write: (cfgDir: string, payload: GsiCfgPayload) => Promise<InstalledGsiCfg>;

  /** Removes the cfg file. No-op when the file is missing. */
  remove: (cfgDir: string, name: string) => Promise<void>;
}
