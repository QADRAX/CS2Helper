import fs from "fs/promises";
import path from "path";
import { getGsiCliRecordingsDir } from "@cs2helper/cli-common";
import type { RecordCatalogPort } from "../../../application/bench";
import type { GsiRecordFile } from "../../../domain/bench";

/** Filesystem adapter that lists records written by `gsi-cli`. */
export class FsRecordCatalogAdapter implements RecordCatalogPort {
  constructor(private readonly recordsDir: string = getGsiCliRecordingsDir()) {}

  async listRecords(): Promise<readonly GsiRecordFile[]> {
    try {
      const entries = await fs.readdir(this.recordsDir, { withFileTypes: true });
      const records = await Promise.all(
        entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".ndjson"))
          .map((entry) => this.toRecordFile(entry.name))
      );

      return records.sort((left, right) => right.modifiedAt - left.modifiedAt);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private async toRecordFile(name: string): Promise<GsiRecordFile> {
    const filePath = path.join(this.recordsDir, name);
    const stat = await fs.stat(filePath);
    return {
      id: filePath,
      name,
      path: filePath,
      sizeBytes: stat.size,
      modifiedAt: stat.mtimeMs,
    };
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
