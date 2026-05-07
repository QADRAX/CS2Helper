import type { NotificationsState } from "./slices/notifications";
import type { UiState } from "./slices/ui/types";

export interface RootState {
  ui: UiState;
  notifications: NotificationsState;
}
