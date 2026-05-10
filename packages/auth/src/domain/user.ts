export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
