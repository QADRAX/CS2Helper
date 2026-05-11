import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { UserProfile, UserProfileUpdate } from "../profile";

describe("profile types", () => {
  it("UserProfile and UserProfileUpdate are usable", () => {
    const now = new Date();
    const p: UserProfile = {
      userId: "u",
      displayName: null,
      avatarUrl: null,
      updatedAt: now,
    };
    const patch: UserProfileUpdate = { displayName: "N" };
    expect(p.userId).toBe("u");
    expect(patch.displayName).toBe("N");
    expectTypeOf<UserProfileUpdate>().toMatchTypeOf<{ displayName?: string | null }>();
  });
});
