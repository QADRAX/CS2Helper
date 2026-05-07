import type { AppLocale } from "../../domain/cli/locale";
import { flattenNestedMessages } from "./flattenNestedMessages";
import type { MessageKey } from "./msgKeys";
import messagesEnJson from "./locales/en.json";
import messagesEsJson from "./locales/es.json";

export const messagesEn = flattenNestedMessages(
  messagesEnJson as Record<string, unknown>
) as Record<MessageKey, string>;

export const messagesEs = flattenNestedMessages(
  messagesEsJson as Record<string, unknown>
) as Record<MessageKey, string>;

const catalogs: Record<AppLocale, Record<MessageKey, string>> = {
  en: messagesEn,
  es: messagesEs,
};

/** Replace `{foo}` placeholders; unknown keys return the key. */
export function translate(
  locale: AppLocale,
  key: MessageKey,
  params?: Record<string, string | number | undefined>
): string {
  const table = catalogs[locale] ?? catalogs.en;
  let s = table[key] ?? catalogs.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) continue;
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export type { MessageKey } from "./msgKeys";
export { msgKeys } from "./msgKeys";
export { resolveInitialLocale, type AppLocale, parseAppLocale, isAppLocale } from "../../domain/cli/locale";
