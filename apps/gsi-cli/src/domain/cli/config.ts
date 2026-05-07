export interface CliConfig {
  port?: number;
  gsiThrottleSec?: number;
  gsiHeartbeatSec?: number;
}

export const DEFAULT_CLI_CONFIG: Required<CliConfig> = {
  port: 3000,
  gsiThrottleSec: 0.1,
  gsiHeartbeatSec: 1,
};

export function normalizeCliConfig(value: unknown): CliConfig {
  const raw = asRecord(value);
  const normalized: CliConfig = {
    port: asPositiveInt(raw.port, DEFAULT_CLI_CONFIG.port),
    gsiThrottleSec: asPositiveNumber(raw.gsiThrottleSec, DEFAULT_CLI_CONFIG.gsiThrottleSec),
    gsiHeartbeatSec: asPositiveNumber(raw.gsiHeartbeatSec, DEFAULT_CLI_CONFIG.gsiHeartbeatSec),
  };
  return normalized;
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
