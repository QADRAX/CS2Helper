import fs from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import type { GsiRecordFile } from "../../../../domain/bench";
import { NdjsonRecordReaderAdapter } from "../NdjsonRecordReaderAdapter";

describe("NdjsonRecordReaderAdapter", () => {
  it("reads frames, ignores empty lines, and reports parse errors", async () => {
    const recordsDir = await fs.mkdtemp(path.join(os.tmpdir(), "gsi-record-"));
    const recordPath = path.join(recordsDir, "record.ndjson");
    await fs.writeFile(recordPath, "null\n\n{\"watcherMode\":\"client_local\"}\nnot-json\n", "utf-8");

    const adapter = new NdjsonRecordReaderAdapter();
    const result = await adapter.readFrames(createRecord(recordPath));

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.lineNumber)).toEqual([1, 3]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.lineNumber).toBe(4);
  });

  it("reads pretty-printed consecutive JSON objects from legacy recordings", async () => {
    const recordsDir = await fs.mkdtemp(path.join(os.tmpdir(), "gsi-record-"));
    const recordPath = path.join(recordsDir, "legacy-record.ndjson");
    await fs.writeFile(
      recordPath,
      [
        "{",
        '  "provider": { "name": "Counter-Strike 2", "appid": 730, "version": 1, "timestamp": 1 },',
        '  "player": { "steamid": "1", "name": "DISCO", "activity": "menu" }',
        "}",
        "{",
        '  "provider": { "name": "Counter-Strike 2", "appid": 730, "version": 1, "timestamp": 2 },',
        '  "player": { "steamid": "1", "name": "DISCO", "activity": "menu" }',
        "}",
      ].join("\n"),
      "utf-8"
    );

    const adapter = new NdjsonRecordReaderAdapter();
    const result = await adapter.readFrames(createRecord(recordPath));

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.lineNumber)).toEqual([1, 5]);
    expect(result.errors).toEqual([]);
  });
});

function createRecord(recordPath: string): GsiRecordFile {
  return {
    id: recordPath,
    name: path.basename(recordPath),
    path: recordPath,
    sizeBytes: 0,
    modifiedAt: 0,
  };
}
