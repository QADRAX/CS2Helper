import type { CS2GameState } from "@cs2helper/gsi-processor";

/**
 * Parses one HTTP request body into a CS2 tick payload.
 */
export function parseIncomingTick(rawBody: string): CS2GameState {
  if (rawBody.length === 0) {
    throw new Error("Empty GSI payload body");
  }

  const parsed = JSON.parse(rawBody) as unknown;
  if (parsed === null || typeof parsed !== "object") {
    throw new Error("Invalid GSI payload JSON shape");
  }

  return parsed as CS2GameState;
}
