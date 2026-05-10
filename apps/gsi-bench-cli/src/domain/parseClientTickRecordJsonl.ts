import { TICK_HUB_SCHEMA_VERSION, type TickFrame } from "@cs2helper/tick-hub";
import type { GsiRecordFrame, GsiRecordParseError, ReadRecordFramesResult } from "./recordTypes";

/**
 * Parses one client-listener `.jsonl` record file into {@link TickFrame} rows and parse errors.
 * Handles pretty-printed JSON split across multiple lines (same framing as legacy NDJSON).
 */
export function parseClientTickRecordContents(contents: string): ReadRecordFramesResult {
  const frames: GsiRecordFrame[] = [];
  const errors: GsiRecordParseError[] = [];
  let buffer = "";
  let startLineNumber = 1;

  contents.split(/\r?\n/).forEach((line, index) => {
    if (!buffer && line.trim().length === 0) return;

    const lineNumber = index + 1;
    if (!buffer) {
      startLineNumber = lineNumber;
      buffer = line;
    } else {
      buffer = `${buffer}\n${line}`;
    }

    if (isCompleteJsonText(buffer)) {
      readBufferedFrame(buffer, startLineNumber, frames, errors);
      buffer = "";
    }
  });

  if (buffer.trim().length > 0) {
    readBufferedFrame(buffer, startLineNumber, frames, errors);
  }

  return { frames, errors };
}

function readBufferedFrame(
  raw: string,
  lineNumber: number,
  frames: GsiRecordFrame[],
  errors: GsiRecordParseError[]
): void {
  const trimmed = raw.trim();

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isTickFrameRecord(parsed)) {
      errors.push({
        lineNumber,
        raw: trimmed,
        message: `Expected TickFrame with schemaVersion ${TICK_HUB_SCHEMA_VERSION}`,
      });
      return;
    }

    frames.push({ lineNumber, raw: trimmed, tick: parsed });
  } catch (error) {
    errors.push({
      lineNumber,
      raw: trimmed,
      message: error instanceof Error ? error.message : "Invalid JSON",
    });
  }
}

function isTickFrameRecord(value: unknown): value is TickFrame {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    o.schemaVersion === TICK_HUB_SCHEMA_VERSION &&
    typeof o.sequence === "number" &&
    typeof o.receivedAtMs === "number" &&
    "master" in o &&
    typeof o.sources === "object" &&
    o.sources !== null &&
    !Array.isArray(o.sources)
  );
}

function isCompleteJsonText(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const first = trimmed[0];

  if (first !== "{" && first !== "[") {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return !startsLikeJsonScalar(trimmed);
    }
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (const char of trimmed) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = inString;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{" || char === "[") {
      depth += 1;
      continue;
    }
    if (char === "}" || char === "]") {
      depth -= 1;
      if (depth < 0) return true;
    }
  }

  return depth === 0 && !inString;
}

function startsLikeJsonScalar(value: string): boolean {
  return (
    "true".startsWith(value) ||
    "false".startsWith(value) ||
    "null".startsWith(value) ||
    value.startsWith("\"") ||
    /^-?\d/.test(value)
  );
}
