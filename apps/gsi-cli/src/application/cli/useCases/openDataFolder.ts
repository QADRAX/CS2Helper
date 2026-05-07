import type { AsyncUseCase } from "@cs2helper/shared";
import type { DataFolderOpenerPort } from "../ports/DataFolderOpenerPort";

export interface OpenDataFolderPorts {
  folderOpener: DataFolderOpenerPort;
}

export const openDataFolder: AsyncUseCase<OpenDataFolderPorts, [], void> = async ({
  folderOpener,
}) => {
  await folderOpener.openFolder();
};
