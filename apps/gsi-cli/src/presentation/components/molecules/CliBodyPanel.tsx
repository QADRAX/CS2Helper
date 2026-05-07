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
  onConfigPortChange: (value: string) => void;
  errorMessage?: string;
}

export function CliBodyPanel({
  mode,
  menuOptions,
  menuIndex,
  configCursor,
  configPortDraft,
  onConfigPortChange,
  errorMessage,
}: CliBodyPanelProps) {
  return (
    <Box marginTop={1} borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      {mode === "menu" ? <MenuScreen menuOptions={menuOptions} menuIndex={menuIndex} /> : null}
      {mode === "config" ? (
        <ConfigScreen
          configCursor={configCursor}
          configPortDraft={configPortDraft}
          onConfigPortChange={onConfigPortChange}
        />
      ) : null}
      {mode === "exitConfirm" ? <ExitConfirmScreen /> : null}
      {errorMessage ? <ErrorMessageLine message={errorMessage} /> : null}
    </Box>
  );
}
