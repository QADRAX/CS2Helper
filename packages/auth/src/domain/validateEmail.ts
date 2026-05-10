import { AuthDomainError } from "./errors";

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !EMAIL_RE.test(trimmed)) {
    throw new AuthDomainError("VALIDATION_ERROR", "Invalid email address");
  }
  return trimmed;
}
