import { useEffect } from "react";
import { loadConfig } from "../store";
import { useAppDispatch } from "./redux";

/** Loads persisted CLI config once the Redux store is available. */
export function useConfigBootstrap(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(loadConfig());
  }, [dispatch]);
}
