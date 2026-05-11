const STEAM_OPENID_LOGIN = "https://steamcommunity.com/openid/login";

export function steamOpenIdRealm(appUrl: string): string {
  const u = appUrl.replace(/\/$/, "");
  try {
    const parsed = new URL(u);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return u;
  }
}

export function steamOpenIdReturnTo(appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/api/auth/steam/callback`;
}

export function buildSteamOpenIdRedirectUrl(returnTo: string, realm: string): string {
  const q = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_LOGIN}?${q.toString()}`;
}
