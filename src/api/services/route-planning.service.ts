import { api } from "@/lib/api";

export type ApiRouteStop = {
  sequence: number;
  stopType: string;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalMinutes?: number;
  serviceDurationMinutes?: number;
};

export type CreateRouteApiRequest = {
  name: string;
  description?: string;
  routeType: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  stops: ApiRouteStop[];
};

export type CreateShipmentApiRequest = {
  orderId?: string;
  customerName: string;
  originAddress: string;
  destinationAddress: string;
  originCountry?: string;
  destinationCountry?: string;
  cargoItems?: Array<{
    name: string;
    quantity: number;
    weightKg: number;
    hsCode?: string;
  }>;
};

export const routePlanningApiService = {
  // Routes endpoints (/api/v1/routes)
  listRoutes: async (page = 1, limit = 20, status?: string) => {
    return api.get<{
      items: any[];
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    }>("/api/v1/routes", {
      params: { page, limit, status },
    });
  },

  getRoute: async (id: string) => {
    return api.get<any>(`/api/v1/routes/${id}`);
  },

  createRoute: async (data: CreateRouteApiRequest) => {
    return api.post<any>("/api/v1/routes", data);
  },

  updateRoute: async (id: string, data: CreateRouteApiRequest) => {
    return api.put<any>(`/api/v1/routes/${id}`, data);
  },

  optimizeRoute: async (id: string) => {
    return api.post<any>(`/api/v1/routes/${id}/optimize`);
  },

  getRouteRecommendation: async (id: string) => {
    return api.post<{
      routeId: string;
      riskLevel: string;
      automationDecision: string;
      recommendationSource: string;
      summary: string;
      suggestions: string[];
      confidenceScore: number;
      approvalRequestId?: string | null;
      applicableRegulations: string[];
    }>(`/api/v1/routes/${id}/recommendation`);
  },

  updateRouteStatus: async (id: string, newStatus: string) => {
    return api.patch<any>(`/api/v1/routes/${id}/status`, { newStatus });
  },

  deleteRoute: async (id: string) => {
    return api.delete<void>(`/api/v1/routes/${id}`);
  },

  // Shipments endpoints (/api/v1/shipments)
  listShipments: async (page = 1, limit = 20, status?: string) => {
    return api.get<{
      shipments: any[];
      totalCount: number;
      page: number;
      limit: number;
    }>("/api/v1/shipments", {
      params: { page, limit, status },
    });
  },

  getShipment: async (id: string) => {
    return api.get<any>(`/api/v1/shipments/${id}`);
  },

  createShipment: async (data: CreateShipmentApiRequest) => {
    return api.post<any>("/api/v1/shipments", data);
  },

  submitShipment: async (id: string) => {
    return api.post<any>(`/api/v1/shipments/${id}/submit`);
  },

  updateShipmentStatus: async (id: string, status: string, note?: string) => {
    return api.patch<any>(`/api/v1/shipments/${id}/status`, { status, note });
  },
};
