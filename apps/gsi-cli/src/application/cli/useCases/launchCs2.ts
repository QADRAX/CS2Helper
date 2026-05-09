import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2LauncherPort } from "../ports/Cs2LauncherPort";
import type { SteamInstallLocatorPort } from "../ports/SteamInstallLocatorPort";

/**
 * Launches CS2 from the terminal, validating that Steam installation exists first.
 *
 * Ports tuple order: `[steamInstall, cs2Launcher]`.
 */
export const launchCs2: AsyncUseCase<[SteamInstallLocatorPort, Cs2LauncherPort], [], void> = async ([
  steamInstall,
  cs2Launcher,
]) => {
  const steam = await steamInstall.detect();
  if (!steam) {
    throw new Error("Steam is not installed or could not be detected.");
  }
  await cs2Launcher.launch();
};
