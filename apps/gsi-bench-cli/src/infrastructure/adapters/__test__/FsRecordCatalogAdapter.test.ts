import fs from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { FsRecordCatalogAdapter } from "../FsRecordCatalogAdapter";

describe("FsRecordCatalogAdapter", () => {
  it("lists ndjson records newest first", async () => {
    const recordsDir = await fs.mkdtemp(path.join(os.tmpdir(), "gsi-records-"));
    const older = path.join(recordsDir, "older.ndjson");
    const newer = path.join(recordsDir, "newer.ndjson");
    const ignored = path.join(recordsDir, "ignored.txt");

    await fs.writeFile(older, "null\n", "utf-8");
    await fs.writeFile(newer, "null\n", "utf-8");
    await fs.writeFile(ignored, "null\n", "utf-8");
    await fs.utimes(older, new Date(1_000), new Date(1_000));
    await fs.utimes(newer, new Date(2_000), new Date(2_000));

    const adapter = new FsRecordCatalogAdapter(recordsDir);
    const records = await adapter.listRecords();

    expect(records.map((record) => record.name)).toEqual(["newer.ndjson", "older.ndjson"]);
  });

  it("returns an empty list when the recordings folder does not exist", async () => {
    const adapter = new FsRecordCatalogAdapter(path.join(os.tmpdir(), "missing-gsi-records"));

    await expect(adapter.listRecords()).resolves.toEqual([]);
  });
});
