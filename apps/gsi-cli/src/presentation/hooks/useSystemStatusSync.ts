import { useEffect } from "react";
import type { CliApp } from "../../infrastructure/CliAppService";
import { cs2TrackingUpdated, steamStatusUpdated } from "../store";
import { useAppDispatch } from "./redux";

/**
 * Subscribes to CS2 and Steam status streams from the CLI app and mirrors
 * each snapshot into Redux so the presentation layer can render reactive
 * indicators in the shell header.
 */
export function useSystemStatusSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribeCs2 = cliApp.subscribeCs2ProcessTracking((snapshot) => {
      dispatch(cs2TrackingUpdated(snapshot));
    });

    const unsubscribeSteam = cliApp.subscribeSteamStatus((status) => {
      dispatch(steamStatusUpdated(status));
    });

    return () => {
      unsubscribeCs2();
      unsubscribeSteam();
    };
  }, [cliApp, dispatch]);
}
