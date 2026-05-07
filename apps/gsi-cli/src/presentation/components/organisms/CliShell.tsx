import { useEffect, useState } from "react";
import { Box, useInput } from "ink";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  clearError,
  createOrUpdateGsiCfg,
  exitCli,
  launchCs2,
  saveCliConfig,
  selectNotifications,
  selectCliConfig,
  selectCs2Status,
  selectGatewayDiagnostics,
  selectGatewayWarning,
  selectGsiState,
  selectSteamStatus,
  selectUiError,
  selectUiStatus,
  startGateway,
  stopGateway,
} from "../../store";
import type { MenuOption, ScreenMode } from "../types";
import { CliHeaderPanel } from "../molecules/CliHeaderPanel";
import { CliBodyPanel } from "../molecules/CliBodyPanel";
import { GatewayContentBox } from "../molecules/GatewayContentBox";
import { NotificationsStack } from "../molecules/NotificationsStack";

interface ConfigDraft {
  port: string;
  gsiThrottleSec: string;
  gsiHeartbeatSec: string;
}

export function CliShell() {
  const dispatch = useAppDispatch();
  const uiStatus = useAppSelector(selectUiStatus);
  const steamStatus = useAppSelector(selectSteamStatus);
  const cs2Status = useAppSelector(selectCs2Status);
  const errorMessage = useAppSelector(selectUiError);
  const gatewayDiagnostics = useAppSelector(selectGatewayDiagnostics);
  const gatewayWarning = useAppSelector(selectGatewayWarning);
  const gsiState = useAppSelector(selectGsiState);
  const notifications = useAppSelector(selectNotifications);
  const config = useAppSelector(selectCliConfig);

  const [mode, setMode] = useState<ScreenMode>("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [configCursor, setConfigCursor] = useState(0);
  const [draft, setDraft] = useState<ConfigDraft>({
    port: config.port?.toString() ?? "",
    gsiThrottleSec: config.gsiThrottleSec?.toString() ?? "0.1",
    gsiHeartbeatSec: config.gsiHeartbeatSec?.toString() ?? "10",
  });

  const gatewayOnline = uiStatus === "LISTENING";
  const menuOptions: MenuOption[] = gatewayOnline
    ? cs2Status.running
      ? ["stop", "exit"]
      : ["launch_cs2", "stop", "exit"]
    : ["start", "config", "exit"];

  useEffect(() => {
    if (menuIndex >= menuOptions.length) {
      setMenuIndex(0);
    }
  }, [menuIndex, menuOptions.length]);

  useEffect(() => {
    if (mode !== "config") return;
    setDraft({
      port: config.port?.toString() ?? "",
      gsiThrottleSec: config.gsiThrottleSec?.toString() ?? "0.1",
      gsiHeartbeatSec: config.gsiHeartbeatSec?.toString() ?? "10",
    });
    setConfigCursor(0);
  }, [mode, config.port, config.gsiThrottleSec, config.gsiHeartbeatSec]);

  const goMenu = () => {
    setMode("menu");
    setMenuIndex(0);
  };

  const saveDraft = () => {
    const parsedPort = Number.parseInt(draft.port, 10);
    const parsedThrottle = Number.parseFloat(draft.gsiThrottleSec);
    const parsedHeartbeat = Number.parseFloat(draft.gsiHeartbeatSec);
    if (!Number.isFinite(parsedPort) || parsedPort <= 0) return;
    if (!Number.isFinite(parsedThrottle) || parsedThrottle <= 0) return;
    if (!Number.isFinite(parsedHeartbeat) || parsedHeartbeat <= 0) return;
    void dispatch(
      saveCliConfig({
        port: parsedPort,
        gsiThrottleSec: parsedThrottle,
        gsiHeartbeatSec: parsedHeartbeat,
      })
    );
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
      if (selected === "launch_cs2") return void dispatch(launchCs2());
      if (selected === "config") return setMode("config");
      return setMode("exitConfirm");
    }

    if (mode === "config") {
      if (key.escape) return goMenu();
      if (key.upArrow) return setConfigCursor((prev) => (prev <= 0 ? 5 : prev - 1));
      if (key.downArrow || key.tab) return setConfigCursor((prev) => (prev + 1) % 6);
      if (!key.return) return;
      if (configCursor === 3) return saveDraft();
      if (configCursor === 4) return void dispatch(createOrUpdateGsiCfg());
      if (configCursor === 5) return goMenu();
      return;
    }

    if (input.toLowerCase() === "y" || key.return) return void dispatch(exitCli());
    if (input.toLowerCase() === "n" || key.escape) return goMenu();
  });

  return (
    <Box flexDirection="column" width="100%">
      <CliHeaderPanel steamStatus={steamStatus} cs2Status={cs2Status} gatewayStatus={uiStatus} />
      {gatewayOnline ? (
        <GatewayContentBox
          gsiState={gsiState}
          gatewayDiagnostics={gatewayDiagnostics}
          cs2Running={cs2Status.running}
          gatewayWarning={gatewayWarning}
        />
      ) : null}
      <CliBodyPanel
        mode={mode}
        menuOptions={menuOptions}
        menuIndex={menuIndex}
        configCursor={configCursor}
        configPortDraft={draft.port}
        configThrottleDraft={draft.gsiThrottleSec}
        configHeartbeatDraft={draft.gsiHeartbeatSec}
        onConfigPortChange={(value) => setDraft((prev) => ({ ...prev, port: value }))}
        onConfigThrottleChange={(value) => setDraft((prev) => ({ ...prev, gsiThrottleSec: value }))}
        onConfigHeartbeatChange={(value) => setDraft((prev) => ({ ...prev, gsiHeartbeatSec: value }))}
        errorMessage={errorMessage}
      />
      <NotificationsStack notifications={notifications} />
    </Box>
  );
}
