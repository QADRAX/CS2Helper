import { useEffect } from "react";
import { bootstrapPresentMonAtStartup } from "../store";
import { useAppDispatch } from "./redux";

/** Dispatches startup PresentMon bootstrap once (progress + loader state in Redux). */
export function usePresentMonBootstrap(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(bootstrapPresentMonAtStartup());
  }, [dispatch]);
}
