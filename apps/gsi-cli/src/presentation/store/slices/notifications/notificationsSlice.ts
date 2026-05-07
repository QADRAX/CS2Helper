import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  notificationsInitialState,
  type NotificationItem,
  type NotificationKind,
} from "./types";

const DEFAULT_DURATION_MS = 6000;

interface EnqueueNotificationPayload {
  message: string;
  kind?: NotificationKind;
  durationMs?: number;
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: notificationsInitialState,
  reducers: {
    enqueueNotification: (state, action: PayloadAction<EnqueueNotificationPayload>) => {
      const now = Date.now();
      const item: NotificationItem = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        message: action.payload.message,
        kind: action.payload.kind ?? "info",
        createdAtMs: now,
        durationMs: Math.max(500, action.payload.durationMs ?? DEFAULT_DURATION_MS),
      };
      state.items.push(item);
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    pruneExpiredNotifications: (state, action: PayloadAction<number>) => {
      const now = action.payload;
      state.items = state.items.filter((item) => now - item.createdAtMs < item.durationMs);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  enqueueNotification,
  dismissNotification,
  pruneExpiredNotifications,
  clearNotifications,
} = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
