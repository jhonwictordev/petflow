export type UserRole = "OWNER" | "MANAGER" | "EMPLOYEE" | "RECEPTIONIST" | "SUPERADMIN";

export type Permission =
  | "tenant:manage"
  | "users:manage"
  | "finance:view"
  | "finance:manage"
  | "appointments:view"
  | "appointments:manage"
  | "customers:view"
  | "customers:manage"
  | "services:manage"
  | "inventory:view"
  | "inventory:manage"
  | "packages:manage"
  | "reports:view";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPERADMIN: [
    "tenant:manage",
    "users:manage",
    "finance:view",
    "finance:manage",
    "appointments:view",
    "appointments:manage",
    "customers:view",
    "customers:manage",
    "services:manage",
    "inventory:view",
    "inventory:manage",
    "packages:manage",
    "reports:view",
  ],
  OWNER: [
    "tenant:manage",
    "users:manage",
    "finance:view",
    "finance:manage",
    "appointments:view",
    "appointments:manage",
    "customers:view",
    "customers:manage",
    "services:manage",
    "inventory:view",
    "inventory:manage",
    "packages:manage",
    "reports:view",
  ],
  MANAGER: [
    "users:manage",
    "finance:view",
    "appointments:view",
    "appointments:manage",
    "customers:view",
    "customers:manage",
    "services:manage",
    "inventory:view",
    "inventory:manage",
    "packages:manage",
    "reports:view",
  ],
  RECEPTIONIST: [
    "appointments:view",
    "appointments:manage",
    "customers:view",
    "customers:manage",
    "inventory:view",
    "packages:manage",
  ],
  EMPLOYEE: [
    "appointments:view",
    "appointments:manage",
    "customers:view",
    "inventory:view",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const userRole = role as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function assertPermission(role: string, permission: Permission) {
  if (!hasPermission(role, permission)) {
    throw new Error(`FORBIDDEN_INSUFFICIENT_PERMISSIONS: Role '${role}' lacks '${permission}'`);
  }
}
