export type NotificationKind = "info" | "warning" | "success" | "error";

export interface NotificationItem {
  id: string;
  message: string;
  kind: NotificationKind;
  createdAtMs: number;
  durationMs: number;
}

export interface NotificationsState {
  items: NotificationItem[];
}

export const notificationsInitialState: NotificationsState = {
  items: [],
};
