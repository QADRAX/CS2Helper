/**
 * Unwrap a single top-level XML CDATA section if the whole string is one block.
 * Steam profile XML (`?xml=1`) wraps many tags this way.
 */
export function stripXmlCdataSection(raw: string): string {
  const s = raw.trim();
  const m = s.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return m ? m[1].trim() : s;
}

/**
 * Cleans profile text persisted before CDATA handling, or odd single-slash URLs.
 */
export function normalizeSteamProfileTextField(value: string | null): string | null {
  if (value == null) return null;
  let s = value.trim();
  if (!s) return null;
  for (let i = 0; i < 4; i++) {
    const next = stripXmlCdataSection(s);
    if (next === s) break;
    s = next.trim();
    if (!s) return null;
  }
  if (/cdata/i.test(s) || /<\!\[/.test(s)) return null;
  s = s.replace(/^https:\/(?!\/)/i, "https://");
  return s.length ? s : null;
}
