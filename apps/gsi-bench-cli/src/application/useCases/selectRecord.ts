import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile } from "../../domain";

/** Selects one record by index from the current catalog view. */
export const selectRecord: UseCase<
  [],
  [records: readonly GsiRecordFile[], selectedIndex: number],
  GsiRecordFile | null
> = (_ports, records, selectedIndex) => records[selectedIndex] ?? null;
