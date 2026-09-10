import { api } from "@/lib/api";

export type CargoItemDto = {
  id?: string;
  name: string;
  quantity: number;
  weightKg: number;
  hsCode?: string;
  description?: string;
  unit?: string;
  volumeM3?: number;
  declaredValue?: number;
  currency?: string;
  isDangerousGoods?: boolean;
  packageType?: string;
};

export type ShipmentLocationDto = {
  id?: string;
  type: string;
  name: string;
  address: string;
  sequence: number;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
};

export type ShipmentMilestoneDto = {
  id?: string;
  status: string;
  description?: string;
  recordedAt: string;
  source?: string;
  latitude?: number;
  longitude?: number;
};

export type ShipmentDto = {
  id: string;
  tenantId?: string;
  shipmentNo: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  originAddress: string;
  destinationAddress: string;
  originCountry?: string;
  destinationCountry?: string;
  status: string;
  priority?: "Normal" | "High" | "Urgent" | string;
  transportMode?: "Road" | "Ocean" | "Air" | "Multimodal" | string;
  assignedRouteId?: string;
  routeId?: string;
  assignedVehicleId?: string;
  vehicleId?: string;
  notes?: string;
  cargoItems?: CargoItemDto[];
  locations?: ShipmentLocationDto[];
  milestones?: ShipmentMilestoneDto[];
  estimatedEta?: string;
  riskLevel?: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
};

export type ListShipmentsResponse = {
  shipments: ShipmentDto[];
  totalCount: number;
  page: number;
  limit: number;
};

export type CreateShipmentRequest = {
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

export type UpdateShipmentRequest = {
  customerName?: string;
  destinationAddress?: string;
  priority?: "Normal" | "High" | "Urgent" | string;
  transportMode?: "Road" | "Ocean" | "Air" | "Multimodal" | string;
  notes?: string;
};

export type AddCargoItemRequest = {
  name: string;
  quantity: number;
  weightKg: number;
  hsCode?: string;
};

export const shipmentService = {
  listShipments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    shipmentNo?: string;
    customerName?: string;
    createdFrom?: string;
    createdTo?: string;
  }): Promise<ListShipmentsResponse> => {
    return api.get<ListShipmentsResponse>("/api/v1/shipments", { params });
  },

  getShipment: async (id: string): Promise<ShipmentDto> => {
    return api.get<ShipmentDto>(`/api/v1/shipments/${id}`);
  },

  createShipment: async (payload: CreateShipmentRequest): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>("/api/v1/shipments", payload);
  },

  updateShipment: async (id: string, payload: UpdateShipmentRequest): Promise<ShipmentDto> => {
    return api.put<ShipmentDto>(`/api/v1/shipments/${id}`, payload);
  },

  submitShipment: async (id: string): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>(`/api/v1/shipments/${id}/submit`);
  },

  updateShipmentStatus: async (
    id: string,
    status: string,
    note?: string,
  ): Promise<ShipmentDto> => {
    return api.patch<ShipmentDto>(`/api/v1/shipments/${id}/status`, { status, note });
  },

  cancelShipment: async (id: string, reason: string): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>(`/api/v1/shipments/${id}/cancel`, { reason });
  },

  deleteDraftShipment: async (id: string): Promise<{ deleted: boolean }> => {
    return api.delete<{ deleted: boolean }>(`/api/v1/shipments/${id}`);
  },

  addCargoItem: async (id: string, item: AddCargoItemRequest): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>(`/api/v1/shipments/${id}/cargo`, item);
  },

  updateCargoItem: async (
    id: string,
    itemId: string,
    item: AddCargoItemRequest,
  ): Promise<ShipmentDto> => {
    return api.put<ShipmentDto>(`/api/v1/shipments/${id}/cargo/${itemId}`, item);
  },

  removeCargoItem: async (id: string, itemId: string): Promise<ShipmentDto> => {
    return api.delete<ShipmentDto>(`/api/v1/shipments/${id}/cargo/${itemId}`);
  },

  addLocation: async (
    id: string,
    loc: {
      type: string;
      name: string;
      address: string;
      sequence: number;
      latitude?: number;
      longitude?: number;
      contactName?: string;
      contactPhone?: string;
    },
  ): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>(`/api/v1/shipments/${id}/locations`, loc);
  },

  getTimeline: async (id: string): Promise<{ shipmentId: string; items: any[] }> => {
    return api.get<{ shipmentId: string; items: any[] }>(`/api/v1/shipments/${id}/timeline`);
  },
};
