import fs from "fs/promises";
import path from "path";
import { getGsiCliRecordingsDir } from "@cs2helper/cli-common";
import type { RecordCatalogPort } from "../../application";
import {
  type GsiRecordFile,
  isErrnoCode,
  isNdjsonRecordFileName,
  sortGsiRecordsByModifiedAtDesc,
  toGsiRecordFileFromStats,
} from "../../domain";

/** Filesystem adapter that lists records written by `gsi-cli`. */
export class FsRecordCatalogAdapter implements RecordCatalogPort {
  constructor(private readonly recordsDir: string = getGsiCliRecordingsDir()) {}

  async listRecords(): Promise<readonly GsiRecordFile[]> {
    try {
      const entries = await fs.readdir(this.recordsDir, { withFileTypes: true });
      const records = await Promise.all(
        entries
          .filter((entry) => entry.isFile() && isNdjsonRecordFileName(entry.name))
          .map(async (entry) => {
            const filePath = path.join(this.recordsDir, entry.name);
            const stat = await fs.stat(filePath);
            return toGsiRecordFileFromStats({
              name: entry.name,
              filePath,
              sizeBytes: stat.size,
              modifiedAt: stat.mtimeMs,
            });
          })
      );

      return sortGsiRecordsByModifiedAtDesc(records);
    } catch (error) {
      if (isErrnoCode(error, "ENOENT")) {
        return [];
      }
      throw error;
    }
  }
}
