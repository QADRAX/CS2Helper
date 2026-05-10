import fs from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { TICK_HUB_SCHEMA_VERSION, type TickFrame } from "@cs2helper/tick-hub";
import type { GsiRecordFile } from "../../../domain";
import { NdjsonRecordReaderAdapter } from "../NdjsonRecordReaderAdapter";

describe("NdjsonRecordReaderAdapter", () => {
  it("reads TickFrame JSONL, ignores empty lines, and reports parse errors", async () => {
    const recordsDir = await fs.mkdtemp(path.join(os.tmpdir(), "gsi-record-"));
    const recordPath = path.join(recordsDir, "record.jsonl");
    const line1 = stringifyTick(1, 0, "null");
    const line2 = stringifyTick(2, 1_000, JSON.stringify({ watcherMode: "client_local" }));
    await fs.writeFile(recordPath, `${line1}\n\n${line2}\nnot-json\n`, "utf-8");

    const adapter = new NdjsonRecordReaderAdapter();
    const result = await adapter.readFrames(createRecord(recordPath));

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.lineNumber)).toEqual([1, 3]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.lineNumber).toBe(4);
  });

  it("reads pretty-printed consecutive TickFrame objects", async () => {
    const recordsDir = await fs.mkdtemp(path.join(os.tmpdir(), "gsi-record-"));
    const recordPath = path.join(recordsDir, "record.jsonl");
    const tick1 = makeTick(1, 0, "null");
    const tick2 = makeTick(2, 1_000, "null");
    await fs.writeFile(
      recordPath,
      `${JSON.stringify(tick1, null, 2)}\n${JSON.stringify(tick2, null, 2)}`,
      "utf-8"
    );

    const adapter = new NdjsonRecordReaderAdapter();
    const result = await adapter.readFrames(createRecord(recordPath));

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.lineNumber)).toEqual([1, 18]);
    expect(result.errors).toEqual([]);
  });
});

function makeTick(sequence: number, receivedAtMs: number, raw: string): TickFrame {
  const state = {
    totalTicks: 0,
    streamState: "cold_start",
    watcherMode: null,
    lastSnapshot: null,
    playersBySteamId: {},
    lastProcessedAt: null,
  } as GsiProcessorState;
  return {
    schemaVersion: TICK_HUB_SCHEMA_VERSION,
    sequence,
    receivedAtMs,
    master: { state, raw },
    sources: {},
  };
}

function stringifyTick(sequence: number, receivedAtMs: number, raw: string): string {
  return JSON.stringify(makeTick(sequence, receivedAtMs, raw));
}

function createRecord(recordPath: string): GsiRecordFile {
  return {
    id: recordPath,
    name: path.basename(recordPath),
    path: recordPath,
    sizeBytes: 0,
    modifiedAt: 0,
  };
}
