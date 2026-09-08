"use client";

import { useCurrentUserQuery } from "./use-current-user-query";
import { hasPermission } from "@/types/auth.types";
import type { PermissionCode } from "@/constants/permissions";

export function useHasPermission(permission: PermissionCode | string): boolean {
  const { data: user } = useCurrentUserQuery();
  return hasPermission(user ?? null, permission);
}

export function useHasAnyPermission(
  permissions: readonly (PermissionCode | string)[],
): boolean {
  const { data: user } = useCurrentUserQuery();
  if (!user?.permissions) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function useHasAllPermissions(
  permissions: readonly (PermissionCode | string)[],
): boolean {
  const { data: user } = useCurrentUserQuery();
  if (!user?.permissions) return false;
  return permissions.every((p) => user.permissions.includes(p));
}
