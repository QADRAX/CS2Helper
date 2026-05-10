export interface PasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
}
