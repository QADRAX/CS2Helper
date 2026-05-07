import { useEffect, useState } from "react";
import { Box, useInput } from "ink";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  clearError,
  exitCli,
  saveCliConfig,
  selectCliConfig,
  selectCs2Status,
  selectSteamStatus,
  selectUiError,
  selectUiStatus,
  startGateway,
  stopGateway,
} from "../../store";
import type { MenuOption, ScreenMode } from "../types";
import { CliHeaderPanel } from "../molecules/CliHeaderPanel";
import { CliBodyPanel } from "../molecules/CliBodyPanel";

interface ConfigDraft {
  port: string;
}

export function CliShell() {
  const dispatch = useAppDispatch();
  const uiStatus = useAppSelector(selectUiStatus);
  const steamStatus = useAppSelector(selectSteamStatus);
  const cs2Status = useAppSelector(selectCs2Status);
  const errorMessage = useAppSelector(selectUiError);
  const config = useAppSelector(selectCliConfig);

  const [mode, setMode] = useState<ScreenMode>("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [configCursor, setConfigCursor] = useState(0);
  const [draft, setDraft] = useState<ConfigDraft>({ port: config.port?.toString() ?? "" });

  const gatewayOnline = uiStatus === "LISTENING";
  const menuOptions: MenuOption[] = gatewayOnline ? ["stop", "exit"] : ["start", "config", "exit"];

  useEffect(() => {
    if (menuIndex >= menuOptions.length) {
      setMenuIndex(0);
    }
  }, [menuIndex, menuOptions.length]);

  useEffect(() => {
    if (mode !== "config") return;
    setDraft({ port: config.port?.toString() ?? "" });
    setConfigCursor(0);
  }, [mode, config.port]);

  const goMenu = () => {
    setMode("menu");
    setMenuIndex(0);
  };

  const saveDraft = () => {
    const parsedPort = Number.parseInt(draft.port, 10);
    if (!Number.isFinite(parsedPort) || parsedPort <= 0) return;
    void dispatch(saveCliConfig({ port: parsedPort }));
    void dispatch(clearError());
    goMenu();
  };

  useInput((input, key) => {
    if (mode === "menu") {
      if (key.upArrow) return setMenuIndex((prev) => (prev <= 0 ? menuOptions.length - 1 : prev - 1));
      if (key.downArrow) return setMenuIndex((prev) => (prev + 1) % menuOptions.length);
      if (!key.return) return;

      const selected = menuOptions[menuIndex];
      if (selected === "start") return void dispatch(startGateway());
      if (selected === "stop") return void dispatch(stopGateway());
      if (selected === "config") return setMode("config");
      return setMode("exitConfirm");
    }

    if (mode === "config") {
      if (key.escape) return goMenu();
      if (key.upArrow) return setConfigCursor((prev) => (prev <= 0 ? 2 : prev - 1));
      if (key.downArrow || key.tab) return setConfigCursor((prev) => (prev + 1) % 3);
      if (!key.return) return;
      if (configCursor === 1) return saveDraft();
      if (configCursor === 2) return goMenu();
      return;
    }

    if (input.toLowerCase() === "y" || key.return) return void dispatch(exitCli());
    if (input.toLowerCase() === "n" || key.escape) return goMenu();
  });

  return (
    <Box flexDirection="column" width="100%">
      <CliHeaderPanel steamStatus={steamStatus} cs2Status={cs2Status} gatewayStatus={uiStatus} />
      <CliBodyPanel
        mode={mode}
        menuOptions={menuOptions}
        menuIndex={menuIndex}
        configCursor={configCursor}
        configPortDraft={draft.port}
        onConfigPortChange={(value) => setDraft((prev) => ({ ...prev, port: value }))}
        errorMessage={errorMessage}
      />
    </Box>
  );
}
