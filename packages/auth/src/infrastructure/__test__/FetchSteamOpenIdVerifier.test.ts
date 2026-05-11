import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchSteamOpenIdVerifier } from "../adapters/FetchSteamOpenIdVerifier";

describe("FetchSteamOpenIdVerifier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns valid when Steam responds is_valid:true", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => "ns:foo\nis_valid:true\n",
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => "<profile><steamID>Carlos</steamID><avatarFull>https://a/b.jpg</avatarFull></profile>",
        })
    );
    const v = new FetchSteamOpenIdVerifier();
    const r = await v.verifyOpenIdAssertion({
      "openid.mode": "id_res",
      "openid.return_to": "http://localhost/cb",
      "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      "openid.identity": "https://steamcommunity.com/openid/id/76561198000000001",
    });
    expect(r).toEqual({
      valid: true,
      steamId64: "76561198000000001",
      accountName: "Carlos",
      avatarUrl: "https://a/b.jpg",
    });
  });

  it("unwraps CDATA in profile fields (Steam XML)", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => "ns:foo\nis_valid:true\n",
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () =>
            "<profile><steamID><![CDATA[DISCO]]></steamID><avatarFull><![CDATA[https://avatars.fastly.steamstatic.com/x_full.jpg]]></avatarFull></profile>",
        })
    );
    const v = new FetchSteamOpenIdVerifier();
    const r = await v.verifyOpenIdAssertion({
      "openid.mode": "id_res",
      "openid.return_to": "http://localhost/cb",
      "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      "openid.identity": "https://steamcommunity.com/openid/id/76561198000000001",
    });
    expect(r).toEqual({
      valid: true,
      steamId64: "76561198000000001",
      accountName: "DISCO",
      avatarUrl: "https://avatars.fastly.steamstatic.com/x_full.jpg",
    });
  });

  it("returns invalid when claimed_id mismatches identity", async () => {
    const v = new FetchSteamOpenIdVerifier();
    const r = await v.verifyOpenIdAssertion({
      "openid.mode": "id_res",
      "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      "openid.identity": "https://steamcommunity.com/openid/id/76561198000000002",
    });
    expect(r.valid).toBe(false);
  });

  it("returns invalid when Steam rejects assertion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        text: async () => "is_valid:false\n",
      }))
    );
    const v = new FetchSteamOpenIdVerifier();
    const r = await v.verifyOpenIdAssertion({
      "openid.mode": "id_res",
      "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      "openid.identity": "https://steamcommunity.com/openid/id/76561198000000001",
    });
    expect(r.valid).toBe(false);
  });
});
