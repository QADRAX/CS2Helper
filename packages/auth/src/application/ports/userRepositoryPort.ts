import type { User } from "../../domain";

export interface UserWithPassword {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export interface UserRepositoryPort {
  createUser(input: { email: string; passwordHash: string }): Promise<{ id: string }>;
  findWithPasswordByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<User | null>;
  listUsers(): Promise<User[]>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}
