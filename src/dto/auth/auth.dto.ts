import { z } from "zod";

export type UserRole =
  | "SYSTEM_ADMIN"
  | "TENANT_ADMIN"
  | "MANAGER"
  | "STAFF";

export type AuthUserDto = {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  isAuthenticated: boolean;
};

export type UserProfile = AuthUserDto;

const authUserDtoValidator = z.object({
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["SYSTEM_ADMIN", "TENANT_ADMIN", "MANAGER", "STAFF"]),
  permissions: z.array(z.string()),
  isAuthenticated: z.boolean(),
});

export function parseAuthUserDto(value: unknown): AuthUserDto {
  return authUserDtoValidator.parse(value);
}
