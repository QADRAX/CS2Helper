import { describe, expect, it } from "vitest";
import { normalizeSteamProfileTextField, stripXmlCdataSection } from "../xmlCdata";

describe("xmlCdata", () => {
  it("stripXmlCdataSection unwraps CDATA", () => {
    expect(stripXmlCdataSection("<![CDATA[DISCO]]>")).toBe("DISCO");
    expect(stripXmlCdataSection("plain")).toBe("plain");
  });

  it("normalizeSteamProfileTextField unwraps CDATA and fixes https:/", () => {
    expect(
      normalizeSteamProfileTextField(
        "<![CDATA[https:/avatars.fastly.steamstatic.com/a_full.jpg]]>"
      )
    ).toBe("https://avatars.fastly.steamstatic.com/a_full.jpg");
  });

  it("normalizeSteamProfileTextField rejects leftover CDATA markers", () => {
    expect(normalizeSteamProfileTextField("prefix <![CDATA[ x")).toBeNull();
  });
});
