import { useCallback } from "react";
import type { AppLocale } from "../../domain/cli/locale";
import type { MessageKey } from "./msgKeys";
import { translate } from "./translate";
import type { RootState } from "../store/rootState";
import { useAppSelector } from "../hooks/redux";

export function useTranslation(): {
  t: (key: MessageKey, params?: Record<string, string | number | undefined>) => string;
  locale: AppLocale;
} {
  const locale = useAppSelector((state: RootState) => state.i18n.locale);
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number | undefined>) => translate(locale, key, params),
    [locale]
  );
  return { t, locale };
}
