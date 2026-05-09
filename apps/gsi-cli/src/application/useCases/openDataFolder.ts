import type { AsyncUseCase } from "@cs2helper/shared";
import type { DataFolderOpenerPort } from "../ports/DataFolderOpenerPort";

/**
 * Ports tuple order: `[folderOpener]`.
 */
export const openDataFolder: AsyncUseCase<[DataFolderOpenerPort], [], void> = async ([
  folderOpener,
]) => {
  await folderOpener.openFolder();
};
