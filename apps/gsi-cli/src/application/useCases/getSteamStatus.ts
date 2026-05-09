import type { AsyncUseCase } from "@cs2helper/shared";
import type {
  SteamInstallLocation,
  SteamInstallLocatorPort,
} from "../ports/SteamInstallLocatorPort";
import type { SteamProcessPort } from "../ports/SteamProcessPort";

/**
 * Combined view of the Steam client on the host: whether it is installed
 * (with its discovered location) and whether the process is currently up.
 */
export interface SteamStatus {
  installed: boolean;
  running: boolean;
  pid?: number;
  location: SteamInstallLocation | null;
}

/**
 * Resolves Steam installation and process state in parallel and folds them
 * into a single snapshot consumed by the presentation layer.
 *
 * Ports tuple order: `[steamInstall, steamProcess]`.
 */
export const getSteamStatus: AsyncUseCase<
  [SteamInstallLocatorPort, SteamProcessPort],
  [],
  SteamStatus
> = async ([steamInstall, steamProcess]) => {
  const [location, processStatus] = await Promise.all([
    steamInstall.detect(),
    steamProcess.getStatus(),
  ]);

  return {
    installed: location !== null,
    running: processStatus.running,
    pid: processStatus.pid,
    location,
  };
};
