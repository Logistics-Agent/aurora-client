import { api } from "@/lib/api";
import { env } from "@/configs";
import { parseAuthUserDto, type UserProfile } from "@/dto/auth/auth.dto";

export type IdentifyResponse = {
  exists: boolean;
  tenantCode: string;
  userType: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  tenantCode?: string;
};

export type LoginSuccessResponse = {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  expiresIn: number;
};

export type LoginErrorResponse = {
  detail?: string;
  requiresInvitationCompletion?: boolean;
  session?: string;
};

export type CompleteInvitationRequest = {
  email: string;
  newPassword: string;
  confirmationCode: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
  confirmationCode: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

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
  identify: async (email: string): Promise<IdentifyResponse> => {
    return api.post("/api/v1/auth/identify", { email });
  },

  login: async (payload: LoginRequest): Promise<LoginSuccessResponse> => {
    return api.post("/api/v1/auth/login", payload);
  },

  completeInvitation: async (
    payload: CompleteInvitationRequest,
  ): Promise<LoginSuccessResponse> => {
    return api.post("/api/v1/auth/complete-invitation", payload);
  },

  forgotPassword: async (
    payload: ForgotPasswordRequest,
  ): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/forgot-password", payload);
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/reset-password", payload);
  },

  changePassword: async (
    payload: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/change-password", payload);
  },

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
      window.location.assign("/login");
    }
  },
};


