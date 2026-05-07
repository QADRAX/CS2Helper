import type { NotificationsState } from "./slices/notifications";
import type { CliSessionState } from "./slices/cliSession/types";
import type { I18nState } from "./slices/i18n/i18nSlice";
import type { UiState } from "./slices/ui/types";

export interface RootState {
  ui: UiState;
  notifications: NotificationsState;
  cliSession: CliSessionState;
  i18n: I18nState;
}
