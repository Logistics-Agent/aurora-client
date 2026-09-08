import { api } from "@/lib/api";

export type UnifiedDocumentStatus =
  | "QUEUED"
  | "PROCESSING"
  | "NEEDS_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "FAILED";

export type UnifiedDocumentStage =
  | "UPLOADED"
  | "OCR_PROCESSING"
  | "HUMAN_REVIEW"
  | "COMPLETED"
  | "ERROR";

export type UnifiedDocumentStatusResponse = {
  jobId: string;
  sourceType: string;
  status: UnifiedDocumentStatus;
  stage: UnifiedDocumentStage;
  fileName: string;
  needsReview: boolean;
  confidence: number;
  normalizedJson?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
};

export type ListShipmentDocumentsResponse = {
  items: UnifiedDocumentStatusResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type OcrFieldReviewItem = {
  fieldName: string;
  fieldValue: string;
  confidence: number;
  needsReview: boolean;
};

export type OcrReviewDetailsResponse = {
  documentId: string;
  jobId: string;
  status: UnifiedDocumentStatus;
  artifactReference: string;
  detectedDocumentType: string;
  confidence: number;
  reviewReasons: string[];
  fields: OcrFieldReviewItem[];
};

export const documentsService = {
  listDocuments: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    shipmentId?: string;
  }): Promise<ListShipmentDocumentsResponse> => {
    return api.get("/api/v1/documents/shipment-documents", { params });
  },

  getDocument: async (id: string): Promise<UnifiedDocumentStatusResponse> => {
    return api.get(`/api/v1/documents/shipment-documents/${id}`);
  },

  getOcrReviewDetails: async (id: string): Promise<OcrReviewDetailsResponse> => {
    return api.get(`/api/v1/documents/shipment-documents/${id}/review`);
  },

  reviewDocument: async (
    id: string,
    body: {
      decision: "CONFIRM" | "CORRECT" | "REJECT";
      correctedFields?: Record<string, string>;
      reviewNotes?: string;
    },
  ): Promise<UnifiedDocumentStatusResponse> => {
    return api.post(`/api/v1/documents/shipment-documents/${id}/review`, body);
  },

  submitShipmentDocument: async (body: {
    storageReference: string;
    fileName: string;
    mimeType?: string;
    sizeBytes?: number;
    documentTypeHint?: number;
    shipmentId?: string;
    idempotencyKey?: string;
  }): Promise<UnifiedDocumentStatusResponse> => {
    return api.post("/api/v1/documents/shipment", body);
  },
};

