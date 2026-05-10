import { describe, expect, it } from "vitest";
import { AuthDomainError } from "../errors";

describe("AuthDomainError", () => {
  it("exposes code and message", () => {
    const err = new AuthDomainError("FORBIDDEN", "nope");
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("nope");
    expect(err.name).toBe("AuthDomainError");
  });
});
