/**
 * GSI `provider.timestamp` is almost always Unix **seconds** (10 digits). Some
 * tooling may forward milliseconds; values above ~1e12 are treated as ms.
 */
export function gsiProviderTimestampToMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return Number.NaN;
  }
  if (value > 10_000_000_000) {
    return value;
  }
  return value * 1000;
}

/**
 * Human-readable calendar date and clock with **seconds and milliseconds**
 * (3 fractional digits). `provider.timestamp` is usually whole seconds, so
 * milliseconds often show `.000`.
 */
export function formatGsiProviderClockHuman(
  timestamp: number,
  locale?: Intl.LocalesArgument
): string {
  const ms = gsiProviderTimestampToMs(timestamp);
  if (!Number.isFinite(ms)) {
    return "—";
  }
  const d = new Date(ms);
  try {
    const datePart = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    }).format(d);
    return `${datePart} · ${timePart}`;
  } catch {
    const pad = (n: number, w: number) => String(n).padStart(w, "0");
    const yyyy = d.getFullYear();
    const mon = pad(d.getMonth() + 1, 2);
    const day = pad(d.getDate(), 2);
    const hh = pad(d.getHours(), 2);
    const mm = pad(d.getMinutes(), 2);
    const ss = pad(d.getSeconds(), 2);
    const frac = pad(d.getMilliseconds(), 3);
    return `${yyyy}-${mon}-${day} ${hh}:${mm}:${ss}.${frac}`;
  }
}

/** Single-line `provider.name` + `appid` + `version` as emitted by GSI. */
export function formatGsiProviderNameAppVersionLine(name: string, appid: number, version: number): string {
  const n = name.trim();
  const title = n.length > 0 ? n : "—";
  return `${title} · app ${appid} · build ${version}`;
}
