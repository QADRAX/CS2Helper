import { useEffect } from "react";
import type { CliApp } from "../../application/CliApp";
import { steamStatusUpdated } from "../store";
import { useAppDispatch } from "./redux";

/**
 * Subscribes to Steam status from the CLI app and mirrors it into Redux.
 * CS2 process/performance snapshots come from the client listener tick stream ({@link useTickFrameSync}).
 */
export function useSystemStatusSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribeSteam = cliApp.subscribeSteamStatus((status) => {
      dispatch(steamStatusUpdated(status));
    });

    return () => {
      unsubscribeSteam();
    };
  }, [cliApp, dispatch]);
}
