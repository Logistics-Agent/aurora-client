import { env } from "@/configs";
import type { UserProfile } from "@/dto/auth/auth.dto";

export const authService = {
  buildLoginRedirectUrl: (returnUrl: string): string =>
    (env.NEXT_PUBLIC_API_BASE_URL || "") +
    "/api/v1/auth/login?returnUrl=" +
    encodeURIComponent(returnUrl),

  getCurrentUser: async (): Promise<UserProfile | null> => null,

  logout: async (): Promise<void> => undefined,
};
