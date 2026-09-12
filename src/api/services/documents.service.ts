import { CONTROLLERS } from "@/configs/api";
import {
  type DocumentList,
  type DocumentReview,
  type DocumentStatus,
  parseDocumentListDto,
  parseDocumentReviewDto,
  parseDocumentStatusDto,
} from "@/dto/documents/document.dto";
import {
  type CreateDocumentIntakeInput,
  type DocumentIntake,
  parseDocumentIntakeDto,
} from "@/dto/documents/document-upload.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export type UnifiedDocumentStatusResponse = DocumentStatus;
export type ListShipmentDocumentsResponse = DocumentList;
export type OcrReviewDetailsResponse = DocumentReview;

export type DocumentReviewInput = {
  decision: "CONFIRM" | "CORRECT" | "REJECT";
  correctedFields?: Record<string, string>;
  reviewNotes?: string;
};

export type SubmitShipmentDocumentInput = {
  idempotencyKey?: string;
  storageReference: string;
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  documentTypeHint: number;
  externalDocumentId: string;
  shipmentId?: string;
};

export type DocumentListParams = {
  page?: number;
  pageSize?: number;
  status?: DocumentStatus["status"];
  shipmentId?: string;
};

export type DocumentQueryParams = DocumentListParams | NormalizedDocumentListParams;

export type NormalizedDocumentListParams = {
  page: number;
  pageSize: number;
  status?: string;
  shipmentId?: string;
};

export const DEFAULT_DOCUMENT_LIST_PARAMS: NormalizedDocumentListParams = {
  page: 1,
  pageSize: 20,
};

const DOCUMENT_STATUS_FILTERS: Record<DocumentStatus["status"], string> = {
  RECEIVED: "Queued",
  PROCESSING: "Processing",
  READY: "Completed",
  NEEDS_REVIEW: "RequiresReview",
  REJECTED: "Rejected",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export function normalizeDocumentListParams(
  params: DocumentListParams = {},
): NormalizedDocumentListParams {
  return {
    page: params.page ?? DEFAULT_DOCUMENT_LIST_PARAMS.page,
    pageSize: params.pageSize ?? DEFAULT_DOCUMENT_LIST_PARAMS.pageSize,
    ...(params.status ? { status: DOCUMENT_STATUS_FILTERS[params.status] } : {}),
    ...(params.shipmentId ? { shipmentId: params.shipmentId } : {}),
  };
}

function parseResponse<T>(response: unknown, parser: (value: unknown) => T): T {
  try {
    return parser(response);
  } catch (error) {
    throw new ApiError({
      message: "Document service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const documentsService = {
  listDocuments: async (params?: DocumentQueryParams): Promise<ListShipmentDocumentsResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.documents.shipmentDocuments, {
      params: normalizeQueryParams(params),
    });
    return parseResponse(response, parseDocumentListDto);
  },

  getDocument: async (id: string): Promise<UnifiedDocumentStatusResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.documents.shipmentDocument(id));
    return parseResponse(response, parseDocumentStatusDto);
  },

  getOcrReviewDetails: async (id: string): Promise<OcrReviewDetailsResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.documents.shipmentDocumentReview(id));
    return parseResponse(response, parseDocumentReviewDto);
  },

  reviewDocument: async (
    id: string,
    body: DocumentReviewInput,
  ): Promise<UnifiedDocumentStatusResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.shipmentDocumentReview(id), {
      action: body.decision,
      fields: Object.entries(body.correctedFields ?? {}).map(([name, value]) => ({ name, value })),
      comment: body.reviewNotes ?? null,
    });
    return parseResponse(response, parseDocumentStatusDto);
  },

  createDocumentIntake: async (body: CreateDocumentIntakeInput): Promise<DocumentIntake> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.intakes, body);
    return parseResponse(response, parseDocumentIntakeDto);
  },

  cancelDocument: async (id: string): Promise<UnifiedDocumentStatusResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.shipmentDocumentCancel(id));
    return parseResponse(response, parseDocumentStatusDto);
  },

  retryDocument: async (id: string): Promise<UnifiedDocumentStatusResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.shipmentDocumentRetry(id));
    return parseResponse(response, parseDocumentStatusDto);
  },

  submitShipmentDocument: async (
    body: SubmitShipmentDocumentInput,
  ): Promise<UnifiedDocumentStatusResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.shipmentDocumentSubmit, body);
    return parseResponse(response, parseDocumentStatusDto);
  },
};

function isServerDocumentStatus(status: string): boolean {
  return [
    "Queued",
    "Processing",
    "Completed",
    "RequiresReview",
    "Rejected",
    "Failed",
    "Cancelled",
  ].includes(status);
}

function isNormalizedDocumentListParams(
  params: DocumentQueryParams,
): params is NormalizedDocumentListParams {
  return (
    typeof params.page === "number" &&
    typeof params.pageSize === "number" &&
    (params.status === undefined || isServerDocumentStatus(params.status))
  );
}

function normalizeQueryParams(params?: DocumentQueryParams): NormalizedDocumentListParams {
  if (params && isNormalizedDocumentListParams(params)) return params;
  return normalizeDocumentListParams(params);
}
