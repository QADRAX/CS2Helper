import type { GsiRecordFile } from "../../domain";

/** Lists raw GSI record files available to the bench CLI. */
export interface RecordCatalogPort {
  listRecords: () => Promise<readonly GsiRecordFile[]>;
}
