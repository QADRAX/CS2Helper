import { AuthDomainError } from "./errors";

const MIN_LENGTH = 10;

export function validatePassword(password: string): string {
  if (password.length < MIN_LENGTH) {
    throw new AuthDomainError(
      "VALIDATION_ERROR",
      `Password must be at least ${MIN_LENGTH} characters`
    );
  }
  return password;
}
