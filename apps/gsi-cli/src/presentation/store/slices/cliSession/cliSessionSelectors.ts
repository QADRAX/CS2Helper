import { createSelector } from "@reduxjs/toolkit";
import type { MenuOption } from "../../../components/types";
import type { RootState } from "../../rootState";
import { selectCs2Running, selectUiStatus } from "../ui/uiSelectors";
import type { CliSessionState } from "./types";

export function selectCliSession(state: RootState): CliSessionState {
  return state.cliSession;
}

export function selectInteractiveMode(state: RootState) {
  return state.cliSession.mode;
}

export function selectInteractiveMenuIndex(state: RootState): number {
  return state.cliSession.menuIndex;
}

export function selectInteractiveConfigCursor(state: RootState): number {
  return state.cliSession.configCursor;
}

export function selectInteractiveConfigDraft(state: RootState) {
  return state.cliSession.configDraft;
}

export const selectMainMenuOptions = createSelector(
  [selectUiStatus, selectCs2Running],
  (status, running): MenuOption[] => {
    const gatewayOnline = status === "LISTENING";
    return gatewayOnline
      ? running
        ? ["stop", "exit"]
        : ["launch_cs2", "stop", "exit"]
      : ["start", "config", "exit"];
  }
);
