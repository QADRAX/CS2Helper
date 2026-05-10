import type { GsiRecordFile } from "./recordTypes";

/** NDJSON record filenames accepted by the bench catalog. */
export function isNdjsonRecordFileName(name: string): boolean {
  return name.endsWith(".ndjson");
}

export function toGsiRecordFileFromStats(params: {
  name: string;
  filePath: string;
  sizeBytes: number;
  modifiedAt: number;
}): GsiRecordFile {
  return {
    id: params.filePath,
    name: params.name,
    path: params.filePath,
    sizeBytes: params.sizeBytes,
    modifiedAt: params.modifiedAt,
  };
}

export function sortGsiRecordsByModifiedAtDesc(records: readonly GsiRecordFile[]): GsiRecordFile[] {
  return [...records].sort((left, right) => right.modifiedAt - left.modifiedAt);
}

/** Narrow `unknown` errors to a specific `errno` code (e.g. `ENOENT`). */
export function isErrnoCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}
