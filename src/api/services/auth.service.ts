import { api } from "@/lib/api";
import { env } from "@/configs";
import { parseAuthUserDto, type UserProfile } from "@/dto/auth/auth.dto";

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${origin}${path}`;
  }
  return pathOrUrl;
}

export const authService = {
  buildLoginRedirectUrl: (returnUrl: string = "/overview"): string => {
    const resolvedUrl = toAbsoluteUrl(returnUrl);
    return (
      (env.NEXT_PUBLIC_API_BASE_URL || "") +
      "/api/v1/auth/login?returnUrl=" +
      encodeURIComponent(resolvedUrl)
    );
  },

  buildLogoutRedirectUrl: (returnUrl: string = "/login"): string => {
    const resolvedUrl = toAbsoluteUrl(returnUrl);
    return (
      (env.NEXT_PUBLIC_API_BASE_URL || "") +
      "/api/v1/auth/logout?returnUrl=" +
      encodeURIComponent(resolvedUrl)
    );
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const response = await api.get<unknown>("/api/v1/auth/me");
      if (!response) return null;
      return parseAuthUserDto(response);
    } catch {
      // 401 Unauthenticated or network error
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // Best-effort logout
    }
    if (typeof window !== "undefined") {
      window.location.assign(authService.buildLogoutRedirectUrl("/login"));
    }
  },
};
