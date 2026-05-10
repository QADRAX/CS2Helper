import { describe, expect, it } from "vitest";
import { CommunityDomainError } from "../errors";
import { parseInstanceDisplayName } from "../instanceDisplayName";

describe("parseInstanceDisplayName", () => {
  it("trims and accepts valid name", () => {
    expect(parseInstanceDisplayName("  My Team  ")).toBe("My Team");
  });

  it("rejects empty", () => {
    expect(() => parseInstanceDisplayName("   ")).toThrow(CommunityDomainError);
  });

  it("rejects too long", () => {
    expect(() => parseInstanceDisplayName("x".repeat(121))).toThrow(CommunityDomainError);
  });
});
