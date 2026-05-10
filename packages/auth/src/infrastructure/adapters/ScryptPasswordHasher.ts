import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasherPort } from "../../application/ports";

const scryptAsync = promisify(scrypt);

const SALT_BYTES = 16;
const KEYLEN = 64;

export class ScryptPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derivedKey = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
    return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derivedKey = (await scryptAsync(password, salt, expected.length)) as Buffer;
    if (derivedKey.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, expected);
  }
}
