import fs from "fs/promises";
import type { CS2GameState } from "@cs2helper/gsi-processor";
import type { RecordReaderPort } from "../../application";
import type {
  GsiRecordFile,
  GsiRecordFrame,
  GsiRecordParseError,
  ReadRecordFramesResult,
} from "../../domain";

/** Reads raw GSI payload records from disk, including pretty-printed JSON payloads. */
export class NdjsonRecordReaderAdapter implements RecordReaderPort {
  async readFrames(record: GsiRecordFile): Promise<ReadRecordFramesResult> {
    const contents = await fs.readFile(record.path, "utf-8");
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
    if (!isCs2GameState(parsed)) {
      errors.push({
        lineNumber,
        raw: trimmed,
        message: "Invalid GSI payload JSON shape",
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

function isCs2GameState(value: unknown): value is CS2GameState {
  return value === null || (typeof value === "object" && !Array.isArray(value));
}
