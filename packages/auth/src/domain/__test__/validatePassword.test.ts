import { describe, expect, it } from "vitest";
import { AuthDomainError } from "../errors";
import { validatePassword } from "../validatePassword";

describe("validatePassword", () => {
  it("returns password when long enough", () => {
    expect(validatePassword("1234567890")).toBe("1234567890");
  });

  it("rejects short passwords", () => {
    expect(() => validatePassword("short")).toThrow(AuthDomainError);
    expect(() => validatePassword("short")).toThrow(
      expect.objectContaining({ code: "VALIDATION_ERROR" })
    );
  });
});
