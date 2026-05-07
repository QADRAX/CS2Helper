export type AppLocale = "en" | "es";

export function isAppLocale(value: unknown): value is AppLocale {
  return value === "en" || value === "es";
}

/** Runtime locale for LANG / LC_* (prefix `es`) or Intl fallback. */
export function resolveInitialLocale(): AppLocale {
  const fromEnv = process.env.LANG ?? process.env.LC_ALL ?? process.env.LC_MESSAGES ?? "";
  if (/^es([_-]|$)/i.test(fromEnv.trim())) {
    return "es";
  }
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? "en";
    return locale.toLowerCase().startsWith("es") ? "es" : "en";
  } catch {
    return "en";
  }
}

export function parseAppLocale(value: unknown): AppLocale {
  if (isAppLocale(value)) return value;
  if (typeof value === "string") {
    const n = value.trim().toLowerCase();
    if (n === "en" || n.startsWith("en-")) return "en";
    if (n === "es" || n.startsWith("es-")) return "es";
  }
  return resolveInitialLocale();
}
