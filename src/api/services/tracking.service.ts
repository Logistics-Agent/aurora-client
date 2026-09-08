import { api } from "@/lib/api";

export type GpsPositionDto = {
  id: string;
  externalReadingId?: string;
  deviceId: string;
  vehicleId?: string;
  shipmentId?: string;
  latitude: number;
  longitude: number;
  speedKph?: number;
  headingDegrees?: number;
  accuracyMeters?: number;
  recordedAt: string;
  receivedAt: string;
};

export type CurrentLocationDto = {
  positionId: string;
  vehicleId: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  speedKph?: number;
  headingDegrees?: number;
  accuracyMeters?: number;
  recordedAt: string;
  receivedAt: string;
};

export type ListPositionHistoryResponse = {
  positions: GpsPositionDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type GeofenceDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  shipmentId?: string;
  vehicleId?: string;
  isActive: boolean;
};

export type MonitoringAlertDto = {
  id: string;
  alertType: string;
  status: string;
  vehicleId?: string;
  shipmentId?: string;
  geofenceId?: string;
  positionId?: string;
  message: string;
  occurredAt: string;
  resolvedAt?: string;
};

export const trackingService = {
  getCurrentLocation: async (
    id: string,
    type: "shipment" | "vehicle" = "shipment",
  ): Promise<CurrentLocationDto | null> => {
    try {
      return await api.get<CurrentLocationDto>(`/api/v1/tracking/${id}/current`, {
        params: { type },
      });
    } catch {
      return null;
    }
  },

  listPositionHistory: async (
    id: string,
    options?: {
      type?: "shipment" | "vehicle";
      from?: string;
      to?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<ListPositionHistoryResponse> => {
    return api.get<ListPositionHistoryResponse>(`/api/v1/tracking/${id}/history`, {
      params: {
        type: options?.type ?? "shipment",
        from: options?.from,
        to: options?.to,
        page: options?.page ?? 1,
        pageSize: options?.pageSize ?? 50,
      },
    });
  },

  listGeofences: async (includeInactive = false): Promise<{ geofences: GeofenceDto[] }> => {
    return api.get<{ geofences: GeofenceDto[] }>("/api/v1/tracking/geofences", {
      params: { includeInactive },
    });
  },

  createGeofence: async (payload: {
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    shipmentId?: string;
    vehicleId?: string;
  }): Promise<GeofenceDto> => {
    return api.post<GeofenceDto>("/api/v1/tracking/geofences", payload);
  },

  setGeofenceActive: async (id: string, isActive: boolean): Promise<GeofenceDto> => {
    return api.patch<GeofenceDto>(`/api/v1/tracking/geofences/${id}/active`, { isActive });
  },

  listMonitoringAlerts: async (params?: {
    alertType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ alerts: MonitoringAlertDto[]; totalItems: number }> => {
    return api.get<{ alerts: MonitoringAlertDto[]; totalItems: number }>(
      "/api/v1/tracking/alerts",
      { params },
    );
  },

  resolveMonitoringAlert: async (id: string): Promise<MonitoringAlertDto> => {
    return api.post<MonitoringAlertDto>(`/api/v1/tracking/alerts/${id}/resolve`);
  },
};
