import type { SteamOpenIdVerifierPort, SteamOpenIdVerifyResult } from "../../application/ports";
import { stripXmlCdataSection } from "../../domain/xmlCdata";

const STEAM_LOGIN = "https://steamcommunity.com/openid/login";
const STEAM_CLAIMED_RE = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;
const XML_TAG_RE = (tag: string) => new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");

function extractSteamId64(params: Readonly<Record<string, string>>): string | null {
  const claimed = params["openid.claimed_id"] ?? "";
  const identity = params["openid.identity"] ?? "";
  const m1 = claimed.match(STEAM_CLAIMED_RE);
  const m2 = identity.match(STEAM_CLAIMED_RE);
  if (!m1 || !m2) return null;
  if (m1[1] !== m2[1]) return null;
  return m1[1];
}

function decodeXmlText(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function readXmlTag(xml: string, tag: string): string | null {
  const m = xml.match(XML_TAG_RE(tag));
  if (!m) return null;
  const value = decodeXmlText(stripXmlCdataSection(m[1]));
  return value.length > 0 ? value : null;
}

async function fetchSteamPublicProfile(
  steamId64: string
): Promise<{ accountName: string | null; avatarUrl: string | null }> {
  const res = await fetch(`https://steamcommunity.com/profiles/${steamId64}?xml=1`);
  if (!res.ok) {
    return { accountName: null, avatarUrl: null };
  }
  const xml = await res.text();
  return {
    accountName: readXmlTag(xml, "steamID"),
    avatarUrl: readXmlTag(xml, "avatarFull") ?? readXmlTag(xml, "avatarMedium"),
  };
}

/**
 * Verifies the OpenID assertion with Steam (`openid.mode=check_authentication`).
 */
export class FetchSteamOpenIdVerifier implements SteamOpenIdVerifierPort {
  async verifyOpenIdAssertion(
    params: Readonly<Record<string, string>>
  ): Promise<SteamOpenIdVerifyResult> {
    const mode = params["openid.mode"] ?? "";
    if (mode !== "id_res") {
      return { valid: false, reason: "openid.mode is not id_res" };
    }

    const steamId64 = extractSteamId64(params);
    if (!steamId64) {
      return { valid: false, reason: "missing or mismatched Steam claimed_id/identity" };
    }

    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith("openid.")) {
        body.append(key, value);
      }
    }
    body.set("openid.mode", "check_authentication");

    const res = await fetch(STEAM_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" },
      body,
    });
    if (!res.ok) {
      return { valid: false, reason: `Steam HTTP ${res.status}` };
    }
    const text = await res.text();
    if (!/\bis_valid\s*:\s*true\b/i.test(text)) {
      return { valid: false, reason: "Steam did not confirm is_valid:true" };
    }

    const profile = await fetchSteamPublicProfile(steamId64);
    return {
      valid: true,
      steamId64,
      accountName: profile.accountName,
      avatarUrl: profile.avatarUrl,
    };
  }
}
