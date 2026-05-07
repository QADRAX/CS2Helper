import { Box } from "ink";
import { ErrorMessageLine } from "../atoms/ErrorMessageLine";
import { ConfigScreen } from "./ConfigScreen";
import { ExitConfirmScreen } from "./ExitConfirmScreen";
import { MenuScreen } from "./MenuScreen";
import type { MenuOption, ScreenMode } from "../types";

interface CliBodyPanelProps {
  mode: ScreenMode;
  menuOptions: MenuOption[];
  menuIndex: number;
  configCursor: number;
  configPortDraft: string;
  configThrottleDraft: string;
  configHeartbeatDraft: string;
  autoRecordEnabled: boolean;
  onConfigPortChange: (value: string) => void;
  onConfigThrottleChange: (value: string) => void;
  onConfigHeartbeatChange: (value: string) => void;
  errorMessage?: string;
}

export function CliBodyPanel({
  mode,
  menuOptions,
  menuIndex,
  configCursor,
  configPortDraft,
  configThrottleDraft,
  configHeartbeatDraft,
  autoRecordEnabled,
  onConfigPortChange,
  onConfigThrottleChange,
  onConfigHeartbeatChange,
  errorMessage,
}: CliBodyPanelProps) {
  return (
    <Box marginTop={1} borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      {mode === "menu" ? <MenuScreen menuOptions={menuOptions} menuIndex={menuIndex} /> : null}
      {mode === "config" ? (
        <ConfigScreen
          configCursor={configCursor}
          configPortDraft={configPortDraft}
          configThrottleDraft={configThrottleDraft}
          configHeartbeatDraft={configHeartbeatDraft}
          autoRecordEnabled={autoRecordEnabled}
          onConfigPortChange={onConfigPortChange}
          onConfigThrottleChange={onConfigThrottleChange}
          onConfigHeartbeatChange={onConfigHeartbeatChange}
        />
      ) : null}
      {mode === "exitConfirm" ? <ExitConfirmScreen /> : null}
      {errorMessage ? <ErrorMessageLine message={errorMessage} /> : null}
    </Box>
  );
}
