import { useEffect } from "react";
import { useInput } from "ink";
import {
  DEFAULT_SCOREBOARD_HOTKEY_VK,
  parseScoreboardVkInput,
} from "../../../domain/cli/config";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  clearError,
  configDraftAutoRecordToggled,
  configDraftLocaleToggled,
  configDraftResetFromCliConfig,
  configDraftScoreboardRequireLivePhaseToggled,
  configDraftScoreboardSnapshotToggled,
  createOrUpdateGsiCfg,
  exitCli,
  interactiveConfigCursorMoved,
  interactiveGoMenu,
  interactiveMenuIndexMoved,
  interactiveMenuIndexSet,
  interactiveModeSet,
  launchCs2,
  openDataFolder,
  saveCliConfig,
  selectCliConfig,
  selectCs2Tracking,
  selectGatewayDiagnostics,
  selectGatewayWarning,
  selectLastClientTickFrame,
  selectInteractiveConfigDraft,
  selectInteractiveConfigCursor,
  selectInteractiveMode,
  selectInteractiveMenuIndex,
  selectMainMenuOptions,
  selectNotifications,
  selectSteamStatus,
  selectSteamWebApiUi,
  selectUiErrorDisplay,
  selectUiStatus,
  startGateway,
  stopGateway,
} from "../../store";
import { GatewayContentBox } from "../molecules/GatewayContentBox";
import { PrimaryPanel } from "../molecules/PrimaryPanel";
import { CliShell } from "./CliShell";
import { MainMenu } from "./MainMenu";
import { ConfigEditor } from "./ConfigEditor";
import { ExitConfirm } from "./ExitConfirm";

function CliPrimaryBody() {
  const mode = useAppSelector(selectInteractiveMode);
  if (mode === "menu") return <MainMenu />;
  if (mode === "config") return <ConfigEditor />;
  return <ExitConfirm />;
}

export function InteractiveCli() {
  const dispatch = useAppDispatch();
  const uiStatus = useAppSelector(selectUiStatus);
  const steamStatus = useAppSelector(selectSteamStatus);
  const steamWebApiUi = useAppSelector(selectSteamWebApiUi);
  const cs2Tracking = useAppSelector(selectCs2Tracking);
  const errorDisplay = useAppSelector(selectUiErrorDisplay);
  const gatewayDiagnostics = useAppSelector(selectGatewayDiagnostics);
  const gatewayWarning = useAppSelector(selectGatewayWarning);
  const lastClientTickFrame = useAppSelector(selectLastClientTickFrame);
  const notifications = useAppSelector(selectNotifications);
  const config = useAppSelector(selectCliConfig);

  const mode = useAppSelector(selectInteractiveMode);
  const menuIndex = useAppSelector(selectInteractiveMenuIndex);
  const menuOptions = useAppSelector(selectMainMenuOptions);
  const configCursor = useAppSelector(selectInteractiveConfigCursor);
  const draft = useAppSelector(selectInteractiveConfigDraft);

  const gatewayOnline = uiStatus === "LISTENING";

  useEffect(() => {
    if (menuIndex >= menuOptions.length) {
      dispatch(interactiveMenuIndexSet(0));
    }
  }, [menuIndex, menuOptions.length, dispatch]);

  useEffect(() => {
    if (mode !== "config") return;
    dispatch(configDraftResetFromCliConfig(config));
  }, [
    mode,
    config.port,
    config.gsiThrottleSec,
    config.gsiHeartbeatSec,
    config.locale,
    config.autoRecordClientTicksOnStart,
    config.scoreboardSnapshotEnabled,
    config.scoreboardHotkeyVirtualKey,
    config.scoreboardRequireLivePhase,
    dispatch,
  ]);

  const goMenu = () => {
    dispatch(interactiveGoMenu());
  };

  const saveDraft = () => {
    const parsedPort = Number.parseInt(draft.port, 10);
    const parsedThrottle = Number.parseFloat(draft.gsiThrottleSec);
    const parsedHeartbeat = Number.parseFloat(draft.gsiHeartbeatSec);
    if (!Number.isFinite(parsedPort) || parsedPort <= 0) return;
    if (!Number.isFinite(parsedThrottle) || parsedThrottle <= 0) return;
    if (!Number.isFinite(parsedHeartbeat) || parsedHeartbeat <= 0) return;
    const scoreboardHotkeyVirtualKey = parseScoreboardVkInput(
      draft.scoreboardHotkeyVirtualKey,
      DEFAULT_SCOREBOARD_HOTKEY_VK
    );
    void dispatch(
      saveCliConfig({
        port: parsedPort,
        gsiThrottleSec: parsedThrottle,
        gsiHeartbeatSec: parsedHeartbeat,
        autoRecordClientTicksOnStart: draft.autoRecordClientTicksOnStart,
        locale: draft.locale,
        scoreboardSnapshotEnabled: draft.scoreboardSnapshotEnabled,
        scoreboardHotkeyVirtualKey,
        scoreboardRequireLivePhase: draft.scoreboardRequireLivePhase,
      })
    );
    void dispatch(clearError());
    goMenu();
  };

  useInput((input, key) => {
    if (mode === "menu") {
      if (
        key.leftArrow ||
        key.upArrow
      ) {
        return void dispatch(
          interactiveMenuIndexMoved({ optionCount: menuOptions.length, direction: "prev" })
        );
      }
      if (key.rightArrow || key.downArrow) {
        return void dispatch(
          interactiveMenuIndexMoved({ optionCount: menuOptions.length, direction: "next" })
        );
      }
      if (!key.return) return;

      const selected = menuOptions[menuIndex];
      if (selected === "start") return void dispatch(startGateway());
      if (selected === "stop") return void dispatch(stopGateway());
      if (selected === "launch_cs2") return void dispatch(launchCs2());
      if (selected === "config") return void dispatch(interactiveModeSet("config"));
      return void dispatch(interactiveModeSet("exitConfirm"));
    }

    if (mode === "config") {
      if (key.escape) return goMenu();
      if (key.upArrow) return void dispatch(interactiveConfigCursorMoved({ direction: "prev" }));
      if (key.downArrow || key.tab) return void dispatch(interactiveConfigCursorMoved({ direction: "next" }));
      if (!key.return) return;
      if (configCursor === 3) {
        return void dispatch(configDraftLocaleToggled());
      }
      if (configCursor === 4) {
        return void dispatch(configDraftAutoRecordToggled());
      }
      if (configCursor === 5) {
        return void dispatch(configDraftScoreboardSnapshotToggled());
      }
      if (configCursor === 7) {
        return void dispatch(configDraftScoreboardRequireLivePhaseToggled());
      }
      if (configCursor === 8) return saveDraft();
      if (configCursor === 9) return void dispatch(createOrUpdateGsiCfg());
      if (configCursor === 10) return void dispatch(openDataFolder());
      if (configCursor === 11) return goMenu();
      return;
    }

    if (input.toLowerCase() === "y" || key.return) return void dispatch(exitCli());
    if (input.toLowerCase() === "n" || key.escape) return goMenu();
  });

  return (
    <CliShell
      steamStatus={steamStatus}
      cs2Tracking={cs2Tracking}
      gatewayStatus={uiStatus}
      steamWebApi={steamWebApiUi}
      gatewaySlot={
        gatewayOnline ? (
          <GatewayContentBox
            tickFrame={lastClientTickFrame}
            gatewayDiagnostics={gatewayDiagnostics}
            cs2Running={cs2Tracking.running}
            gatewayWarning={gatewayWarning}
          />
        ) : null
      }
      primarySlot={
        <PrimaryPanel errorMessage={errorDisplay}>
          <CliPrimaryBody />
        </PrimaryPanel>
      }
      notifications={notifications}
    />
  );
}
