export type RoleId = string;
export type PermissionId = string;

export interface Role {
  id: RoleId;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Permission {
  id: PermissionId;
  key: string;
  description: string | null;
  createdAt: Date;
}
