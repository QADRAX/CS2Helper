import {
  type CliConfig,
  DEFAULT_SCOREBOARD_HOTKEY_VK,
} from "../../../../domain/cli/config";
import type { AppLocale } from "../../../../domain/cli/locale";
import { parseAppLocale } from "../../../../domain/cli/locale";
import type { ScreenMode } from "../../../components/types";

export interface CliConfigDraft {
  port: string;
  gsiThrottleSec: string;
  gsiHeartbeatSec: string;
  locale: AppLocale;
  autoRecordClientTicksOnStart: boolean;
  scoreboardSnapshotEnabled: boolean;
  scoreboardHotkeyVirtualKey: string;
  scoreboardRequireLivePhase: boolean;
}

export interface CliSessionState {
  mode: ScreenMode;
  menuIndex: number;
  configCursor: number;
  configDraft: CliConfigDraft;
}

export const CONFIG_FORM_ROW_COUNT = 12;

export function cliConfigToDraft(config: CliConfig): CliConfigDraft {
  const vk = config.scoreboardHotkeyVirtualKey ?? DEFAULT_SCOREBOARD_HOTKEY_VK;
  return {
    port: config.port?.toString() ?? "",
    gsiThrottleSec: config.gsiThrottleSec?.toString() ?? "0.1",
    gsiHeartbeatSec: config.gsiHeartbeatSec?.toString() ?? "10",
    locale: parseAppLocale(config.locale),
    autoRecordClientTicksOnStart: config.autoRecordClientTicksOnStart ?? false,
    scoreboardSnapshotEnabled: config.scoreboardSnapshotEnabled ?? false,
    scoreboardHotkeyVirtualKey: vk.toString(10),
    scoreboardRequireLivePhase: config.scoreboardRequireLivePhase ?? false,
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
    autoRecordClientTicksOnStart: false,
    scoreboardSnapshotEnabled: false,
    scoreboardHotkeyVirtualKey: DEFAULT_SCOREBOARD_HOTKEY_VK.toString(10),
    scoreboardRequireLivePhase: false,
  },
};
