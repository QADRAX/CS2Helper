import fs from "fs/promises";
import path from "path";
import { parse as parseVdf, stringify as stringifyVdf } from "@node-steam/vdf";
import type {
  GsiCfgPayload,
  GsiConfigFilePort,
  InstalledGsiCfg,
} from "../../application/ports/GsiConfigFilePort";

const FILENAME_PREFIX = "gamestate_integration_";
const FILENAME_SUFFIX = ".cfg";

interface SerializableGsiBlock {
  uri: string;
  timeout?: string;
  buffer?: string;
  throttle?: string;
  heartbeat?: string;
  auth?: Record<string, string>;
  data?: Record<string, string>;
}

/**
 * Filesystem adapter that materializes GSI cfg files in CS2's `cfg` folder.
 *
 * Serialization uses Valve's KeyValues (VDF) format, which CS2 expects for
 * `gamestate_integration_*.cfg`. Writes are atomic (write-then-rename) so
 * the game never reads a partially flushed file.
 */
export class FsGsiConfigFileAdapter implements GsiConfigFilePort {
  async isInstalled(cfgDir: string, name: string): Promise<boolean> {
    return pathExists(buildCfgPath(cfgDir, name));
  }

  async read(cfgDir: string, name: string): Promise<InstalledGsiCfg | null> {
    const filePath = buildCfgPath(cfgDir, name);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }

    const payload = tryDeserialize(raw, name);
    return { filePath, payload };
  }

  async write(cfgDir: string, payload: GsiCfgPayload): Promise<InstalledGsiCfg> {
    const filePath = buildCfgPath(cfgDir, payload.name);
    const tempPath = `${filePath}.tmp`;
    const serialized = serialize(payload);

    await fs.mkdir(cfgDir, { recursive: true });
    await fs.writeFile(tempPath, serialized, "utf-8");
    await fs.rename(tempPath, filePath);

    return { filePath, payload };
  }

  async remove(cfgDir: string, name: string): Promise<void> {
    const filePath = buildCfgPath(cfgDir, name);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (isNotFound(error)) return;
      throw error;
    }
  }
}

const buildCfgPath = (cfgDir: string, name: string): string =>
  path.join(cfgDir, `${FILENAME_PREFIX}${name}${FILENAME_SUFFIX}`);

const serialize = (payload: GsiCfgPayload): string => {
  const block: SerializableGsiBlock = {
    uri: payload.endpointUrl,
  };

  if (payload.timeout !== undefined) block.timeout = numberToVdf(payload.timeout);
  if (payload.buffer !== undefined) block.buffer = numberToVdf(payload.buffer);
  if (payload.throttle !== undefined) block.throttle = numberToVdf(payload.throttle);
  if (payload.heartbeat !== undefined) block.heartbeat = numberToVdf(payload.heartbeat);

  if (payload.authToken !== undefined) {
    block.auth = { token: payload.authToken };
  }

  if (payload.data) {
    const flags: Record<string, string> = {};
    for (const [key, enabled] of Object.entries(payload.data)) {
      flags[key] = enabled ? "1" : "0";
    }
    block.data = flags;
  }

  const root = { [payload.displayName ?? payload.name]: block };
  return stringifyVdf(root);
};

const numberToVdf = (value: number): string => {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? `${value}.0` : String(value);
};

const tryDeserialize = (raw: string, name: string): GsiCfgPayload | undefined => {
  let parsed: unknown;
  try {
    parsed = parseVdf(raw);
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== "object") return undefined;

  const entries = Object.entries(parsed as Record<string, unknown>);
  if (entries.length === 0) return undefined;

  const [displayName, blockUnknown] = entries[0]!;
  if (!blockUnknown || typeof blockUnknown !== "object") return undefined;

  const block = blockUnknown as Record<string, unknown>;
  const uri = block.uri;
  if (typeof uri !== "string") return undefined;

  const payload: GsiCfgPayload = {
    name,
    displayName,
    endpointUrl: uri,
  };

  const timeout = readNumber(block.timeout);
  if (timeout !== undefined) payload.timeout = timeout;
  const buffer = readNumber(block.buffer);
  if (buffer !== undefined) payload.buffer = buffer;
  const throttle = readNumber(block.throttle);
  if (throttle !== undefined) payload.throttle = throttle;
  const heartbeat = readNumber(block.heartbeat);
  if (heartbeat !== undefined) payload.heartbeat = heartbeat;

  if (block.auth && typeof block.auth === "object") {
    const token = (block.auth as Record<string, unknown>).token;
    if (typeof token === "string") payload.authToken = token;
    else if (typeof token === "number") payload.authToken = String(token);
  }

  if (block.data && typeof block.data === "object") {
    const flags: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(block.data)) {
      flags[key] = readBoolean(value);
    }
    payload.data = flags;
  }

  return payload;
};

const readNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const readBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value !== "0" && value.toLowerCase() !== "false";
  return false;
};

const pathExists = async (target: string): Promise<boolean> => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const isNotFound = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "ENOENT";
