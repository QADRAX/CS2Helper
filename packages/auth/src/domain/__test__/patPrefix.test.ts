import { describe, expect, it } from "vitest";
import { PERSONAL_ACCESS_TOKEN_PREFIX, isPersonalAccessTokenPlain } from "../patPrefix";

describe("patPrefix", () => {
  it("detects prefixed tokens", () => {
    expect(isPersonalAccessTokenPlain(`${PERSONAL_ACCESS_TOKEN_PREFIX}abc`)).toBe(true);
    expect(isPersonalAccessTokenPlain("eyJ")).toBe(false);
  });
});
