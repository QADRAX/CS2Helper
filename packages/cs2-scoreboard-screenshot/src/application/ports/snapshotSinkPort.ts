export interface SnapshotWriteResult {
  absolutePath: string;
}

export interface SnapshotSinkPort {
  writeSnapshot(filename: string, pngBytes: Uint8Array): Promise<SnapshotWriteResult>;
}
