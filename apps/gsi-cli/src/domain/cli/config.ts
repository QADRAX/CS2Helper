import type { AppLocale } from "./locale";
import { parseAppLocale } from "./locale";

/** Default auxiliary VK: `VK_X` (0x58); pair with TAB via keyboard macro (TAB + X). */
export const DEFAULT_SCOREBOARD_HOTKEY_VK = 0x58;

export interface CliConfig {
  port?: number;
  gsiThrottleSec?: number;
  gsiHeartbeatSec?: number;
  autoRecordClientTicksOnStart?: boolean;
  locale?: AppLocale;
  /** Windows: capture CS2 client PNG when auxiliary hotkey fires while match + foreground gates pass. */
  scoreboardSnapshotEnabled?: boolean;
  /** Virtual-key code for `RegisterHotKey` (default 88 / 0x58 = X, with TAB from macro). */
  scoreboardHotkeyVirtualKey?: number;
  /** When true, require GSI `map.phase === "live"` in addition to `currentMatch`. */
  scoreboardRequireLivePhase?: boolean;
}

export const DEFAULT_CLI_CONFIG: Required<CliConfig> = {
  port: 3000,
  gsiThrottleSec: 0.1,
  gsiHeartbeatSec: 1,
  autoRecordClientTicksOnStart: false,
  locale: "en",
  scoreboardSnapshotEnabled: false,
  scoreboardHotkeyVirtualKey: DEFAULT_SCOREBOARD_HOTKEY_VK,
  scoreboardRequireLivePhase: false,
};

export function normalizeCliConfig(value: unknown): CliConfig {
  const raw = asRecord(value);
  const normalized: CliConfig = {
    port: asPositiveInt(raw.port, DEFAULT_CLI_CONFIG.port),
    gsiThrottleSec: asPositiveNumber(raw.gsiThrottleSec, DEFAULT_CLI_CONFIG.gsiThrottleSec),
    gsiHeartbeatSec: asPositiveNumber(raw.gsiHeartbeatSec, DEFAULT_CLI_CONFIG.gsiHeartbeatSec),
    autoRecordClientTicksOnStart: asBoolean(
      raw.autoRecordClientTicksOnStart,
      DEFAULT_CLI_CONFIG.autoRecordClientTicksOnStart
    ),
    locale: parseAppLocale(raw.locale),
    scoreboardSnapshotEnabled: asBoolean(
      raw.scoreboardSnapshotEnabled,
      DEFAULT_CLI_CONFIG.scoreboardSnapshotEnabled
    ),
    scoreboardHotkeyVirtualKey: asVkCode(
      raw.scoreboardHotkeyVirtualKey,
      DEFAULT_CLI_CONFIG.scoreboardHotkeyVirtualKey
    ),
    scoreboardRequireLivePhase: asBoolean(
      raw.scoreboardRequireLivePhase,
      DEFAULT_CLI_CONFIG.scoreboardRequireLivePhase
    ),
  };
  return normalized;
}

function asVkCode(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.floor(value);
    if (n >= 1 && n <= 255) return n;
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (t.startsWith("0x") || t.startsWith("0X")) {
      const v = Number.parseInt(t.slice(2), 16);
      if (Number.isFinite(v)) {
        const n = v & 0xff;
        if (n >= 1) return n;
      }
    } else {
      const v = Number.parseInt(t, 10);
      if (Number.isFinite(v)) {
        const n = Math.floor(v);
        if (n >= 1 && n <= 255) return n;
      }
    }
  }
  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function asPositiveInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

function asPositiveNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

/** Parses draft text for scoreboard hotkey VK; invalid input yields `fallback`. */
export function parseScoreboardVkInput(input: string, fallback: number): number {
  const trimmed = input.trim();
  if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
    const v = Number.parseInt(trimmed.slice(2), 16);
    if (Number.isFinite(v)) {
      const n = v & 0xff;
      if (n >= 1) return n;
    }
    return fallback;
  }
  const v = Number.parseInt(trimmed, 10);
  if (Number.isFinite(v)) {
    const n = Math.floor(v);
    if (n >= 1 && n <= 255) return n;
  }
  return fallback;
}
