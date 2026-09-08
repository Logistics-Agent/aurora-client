import { api } from "@/lib/api";

export type CargoItemDto = {
  id?: string;
  name: string;
  quantity: number;
  weightKg: number;
  hsCode?: string;
};

export type ShipmentDto = {
  id: string;
  tenantId?: string;
  shipmentNo: string;
  orderId?: string;
  customerName: string;
  originAddress: string;
  destinationAddress: string;
  originCountry?: string;
  destinationCountry?: string;
  status: string;
  assignedRouteId?: string;
  assignedVehicleId?: string;
  cargoItems?: CargoItemDto[];
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
};
