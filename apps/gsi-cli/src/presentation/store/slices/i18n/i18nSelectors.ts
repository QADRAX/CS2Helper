import type { RootState } from "../../rootState";
import type { AppLocale } from "../../../../domain/cli/locale";
import { parseAppLocale } from "../../../../domain/cli/locale";

export function selectI18nLocale(state: RootState): AppLocale {
  return parseAppLocale(state.i18n.locale);
}
