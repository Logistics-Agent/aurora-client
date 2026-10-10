import type { UserProfile } from "@/types/auth.types";

export function hasMailPermission(user: UserProfile | null, permission: string): boolean {
  if (!user?.isAuthenticated) return false;
  const target = permission.toLowerCase().trim();
  return (user.permissions ?? []).some((value) => {
    const granted = value.toLowerCase().trim();
    return (
      granted === target || granted === "*" || granted === "mail:*" || granted === "mail:manage"
    );
  });
}
