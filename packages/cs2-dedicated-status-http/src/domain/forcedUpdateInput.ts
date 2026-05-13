import type { DedicatedStatusPaths } from "./dedicatedStatusPaths";
import type { SteamInstallProgressHooks } from "./steamInstallHooks";

/** Paths + optional install stream hooks (e.g. HTTP 202 after first % line). */
export type ForcedUpdateInput = DedicatedStatusPaths & SteamInstallProgressHooks;
