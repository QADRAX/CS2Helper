import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { User } from "../user";

describe("user types", () => {
  it("User matches structural contract", () => {
    const now = new Date();
    const u: User = {
      id: "id",
      steamId: "76561198000000001",
      displayName: null,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    expect(u.id).toBe("id");
    expectTypeOf<User["steamId"]>().toEqualTypeOf<string>();
  });
});
