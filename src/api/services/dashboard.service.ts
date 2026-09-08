import { api } from "@/lib/api";

export type UserProfileSummaryDto = {
  firstName: string;
  lastName: string;
  email: string;
};

export type RouteShortSummaryDto = {
  routeId: string;
  origin: string;
  destination: string;
  status: string;
};

export type DashboardSummaryDto = {
  userProfile: UserProfileSummaryDto;
  activeRoutesCount: number;
  recentActiveRoutes: RouteShortSummaryDto[];
};

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryDto | null> => {
    try {
      return await api.get<DashboardSummaryDto>("/api/v1/dashboard/summary");
    } catch {
      return null;
    }
  },
};
