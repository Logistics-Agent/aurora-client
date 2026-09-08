"use client";

import type { ReactNode } from "react";
import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import { hasPermission } from "@/types/auth.types";
import type { PermissionCode } from "@/constants/permissions";

type PermissionGateProps = {
  permission?: PermissionCode | string;
  anyPermission?: readonly (PermissionCode | string)[];
  allPermissions?: readonly (PermissionCode | string)[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { data: user } = useCurrentUserQuery();

  if (permission && !hasPermission(user ?? null, permission)) {
    return <>{fallback}</>;
  }

  if (anyPermission && anyPermission.length > 0) {
    const hasAny = anyPermission.some((p) => hasPermission(user ?? null, p));
    if (!hasAny) return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0) {
    const hasAll = allPermissions.every((p) => hasPermission(user ?? null, p));
    if (!hasAll) return <>{fallback}</>;
  }

  return <>{children}</>;
}
