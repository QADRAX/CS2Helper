/**
 * Optional hooks while streaming steamcmd install output.
 */
export type SteamInstallProgressHooks = {
  /**
   * Called once when the first install line parses a numeric download percentage
   * (steamcmd “progress: …” / success-style line), not the synthetic “starting_steamcmd” state.
   */
  onFirstDownloadPercentLog?: () => void;
};

export type RunSteamInstallInput = {
  installScript: string;
} & SteamInstallProgressHooks;
