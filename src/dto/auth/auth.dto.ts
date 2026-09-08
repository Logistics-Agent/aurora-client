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
  userId: z.string().default(""),
  tenantId: z.string().default(""),
  email: z.string().email(),
  name: z.string().default(""),
  role: z.string().transform((val) => {
    const normalized = val.toUpperCase().replace(/\s+/g, "_");
    if (normalized.includes("ADMIN") && normalized.includes("TENANT")) return "TENANT_ADMIN";
    if (normalized.includes("SYSTEM")) return "SYSTEM_ADMIN";
    if (normalized.includes("MANAGER")) return "MANAGER";
    return "STAFF";
  }) as z.ZodType<UserRole>,
  permissions: z.array(z.string()).default([]),
  isAuthenticated: z.boolean().default(true),
});

export function parseAuthUserDto(value: unknown): AuthUserDto {
  return authUserDtoValidator.parse(value);
}
