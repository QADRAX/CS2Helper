import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile } from "../../../domain/bench";
import type { RecordCatalogPort } from "../ports";

export interface ListRecordsPorts {
  recordCatalog: RecordCatalogPort;
}

/** Lists available raw GSI records sorted by newest first. */
export const listRecords: UseCase<ListRecordsPorts, [], Promise<readonly GsiRecordFile[]>> = (
  { recordCatalog }
) => recordCatalog.listRecords();
