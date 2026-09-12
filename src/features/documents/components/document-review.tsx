"use client";

import { ErrorState, LoadingState } from "@/components/common";
import { toApiError } from "@/lib/api-error";

import { useDocumentReviewWorkflow } from "../hooks/use-document-review-workflow";
import { DocumentDetail } from "./document-detail";
import { DocumentQueue } from "./document-queue";

export function DocumentReview({
  showOcrFields = false,
  initialDocumentId,
}: {
  showOcrFields?: boolean;
  initialDocumentId?: string;
}) {
  const {
    documentsQuery,
    documentList,
    selected,
    reviewQuery,
    selectedQuery,
    reviewMutation,
    lifecycleMutation,
    selectedId,
    confirm,
    reviewAction,
    corrections,
    refresh,
    setSelectedId,
    setConfirm,
    updateCorrection,
    requestReview,
    confirmReview,
    reviewConflict,
    statusFilter,
    setStatusFilter,
    shipmentIdFilter,
    setShipmentIdFilter,
    retryDocument,
    cancelDocument,
  } = useDocumentReviewWorkflow({ showOcrFields, initialDocumentId });

  if (documentsQuery.isLoading) return <LoadingState label="Loading document queue" />;
  if (documentsQuery.isError) {
    const error = toApiError(documentsQuery.error);
    const unavailable = error.code === "DOCUMENT_OCR_UNAVAILABLE";
    return (
      <ErrorState
        title={unavailable ? "OCR processing unavailable" : "Document queue unavailable"}
        description={
          unavailable
            ? "The OCR service is temporarily unavailable. Try again later."
            : "Try again to load the OCR queue."
        }
      />
    );
  }
  if (!documentList) return <LoadingState label="Loading document queue" />;
  const confidence = selected?.confidence ?? selectedQuery.data?.confidence ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <DocumentQueue
        data={documentList}
        selectedId={selectedId}
        fetching={documentsQuery.isFetching}
        onRefresh={refresh}
        onSelect={setSelectedId}
        statusFilter={statusFilter}
        shipmentIdFilter={shipmentIdFilter}
        onStatusFilterChange={setStatusFilter}
        onShipmentIdFilterChange={setShipmentIdFilter}
      />
      <DocumentDetail
        selected={selected}
        review={reviewQuery.data}
        confidence={confidence}
        confirm={confirm}
        reviewAction={reviewAction}
        corrections={corrections}
        reviewPending={reviewMutation.isPending}
        reviewError={reviewMutation.error}
        reviewConflict={reviewConflict}
        lifecyclePending={lifecycleMutation.isPending}
        lifecycleError={lifecycleMutation.error}
        onConfirmChange={setConfirm}
        onFieldChange={updateCorrection}
        onRequestReview={requestReview}
        onConfirmReview={confirmReview}
        onRetry={retryDocument}
        onCancel={cancelDocument}
      />
    </div>
  );
}
