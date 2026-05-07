import type { RootState } from "../../rootState";
import type { NotificationItem } from "./types";

export function selectNotifications(state: RootState): NotificationItem[] {
  return state.notifications.items;
}
