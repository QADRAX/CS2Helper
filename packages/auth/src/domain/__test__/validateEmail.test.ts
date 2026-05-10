import { describe, expect, it } from "vitest";
import { AuthDomainError } from "../errors";
import { validateEmail } from "../validateEmail";

describe("validateEmail", () => {
  it("trims and lowercases", () => {
    expect(validateEmail("  User@EXAMPLE.com  ")).toBe("user@example.com");
  });

  it("rejects invalid addresses", () => {
    expect(() => validateEmail("not-an-email")).toThrow(AuthDomainError);
    expect(() => validateEmail("not-an-email")).toThrow(
      expect.objectContaining({ code: "VALIDATION_ERROR" })
    );
  });
});
