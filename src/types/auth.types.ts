import type {
  AuthUserDto,
  UserProfile,
  UserRole,
} from "@/dto/auth/auth.dto";

export type { AuthUserDto, UserProfile, UserRole } from "@/dto/auth/auth.dto";

export function hasPermission(
  user: UserProfile | null,
  permission: string,
): boolean {
  return user?.permissions.includes(permission) ?? false;
}

