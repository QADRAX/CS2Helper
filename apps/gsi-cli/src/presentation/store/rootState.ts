import type { NotificationsState } from "./slices/notifications";
import type { CliSessionState } from "./slices/cliSession/types";
import type { UiState } from "./slices/ui/types";

export interface RootState {
  ui: UiState;
  notifications: NotificationsState;
  cliSession: CliSessionState;
}
