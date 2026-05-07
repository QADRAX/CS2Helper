import type { CliConfig } from "../../../../domain/cli/config";
import type { AppLocale } from "../../../../domain/cli/locale";
import { parseAppLocale } from "../../../../domain/cli/locale";
import type { ScreenMode } from "../../../components/types";

export interface CliConfigDraft {
  port: string;
  gsiThrottleSec: string;
  gsiHeartbeatSec: string;
  locale: AppLocale;
  autoRecordRawGsiOnStart: boolean;
}

export interface CliSessionState {
  mode: ScreenMode;
  menuIndex: number;
  configCursor: number;
  configDraft: CliConfigDraft;
}

export const CONFIG_FORM_ROW_COUNT = 9;

export function cliConfigToDraft(config: CliConfig): CliConfigDraft {
  return {
    port: config.port?.toString() ?? "",
    gsiThrottleSec: config.gsiThrottleSec?.toString() ?? "0.1",
    gsiHeartbeatSec: config.gsiHeartbeatSec?.toString() ?? "10",
    locale: parseAppLocale(config.locale),
    autoRecordRawGsiOnStart: config.autoRecordRawGsiOnStart ?? false,
  };
}

export const cliSessionInitialState: CliSessionState = {
  mode: "menu",
  menuIndex: 0,
  configCursor: 0,
  configDraft: {
    port: "",
    gsiThrottleSec: "0.1",
    gsiHeartbeatSec: "10",
    locale: "en",
    autoRecordRawGsiOnStart: false,
  },
};
