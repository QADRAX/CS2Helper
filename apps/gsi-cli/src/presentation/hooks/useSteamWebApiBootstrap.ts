import { useEffect } from "react";
import { readSteamWebApiKeyFromEnv } from "../../domain/cli/steamWebApiEnv";
import { steamWebApiDisabled, verifySteamWebApi } from "../store";
import { useAppDispatch } from "./redux";

/** Si existe `CS2HELPER_STEAM_WEB_API_KEY`, valida la clave contra la Web API al arrancar. */
export function useSteamWebApiBootstrap(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!readSteamWebApiKeyFromEnv()) {
      dispatch(steamWebApiDisabled());
      return;
    }
    void dispatch(verifySteamWebApi());
  }, [dispatch]);
}
