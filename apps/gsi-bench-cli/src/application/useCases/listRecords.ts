import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile } from "../../domain";
import type { RecordCatalogPort } from "../ports";

/**
 * Lists available raw GSI records sorted by newest first.
 *
 * Ports tuple order: `[recordCatalog]`.
 */
export const listRecords: UseCase<[RecordCatalogPort], [], Promise<readonly GsiRecordFile[]>> = (
  [recordCatalog]
) => recordCatalog.listRecords();
