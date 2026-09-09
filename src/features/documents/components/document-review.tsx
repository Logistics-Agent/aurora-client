"use client";

import { ErrorState, LoadingState } from "@/components/common";

import { useDocumentReviewWorkflow } from "../hooks/use-document-review-workflow";
import { DocumentUploadForm } from "../upload-document/components/document-upload-form";
import { DocumentDetail } from "./document-detail";
import { DocumentQueue } from "./document-queue";

export function DocumentReview({
  showUpload = false,
  showOcrFields = false,
  initialDocumentId,
}: {
  showUpload?: boolean;
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
  } = useDocumentReviewWorkflow({ showOcrFields, initialDocumentId });

  if (documentsQuery.isLoading) return <LoadingState label="Loading document queue" />;
  if (documentsQuery.isError)
    return (
      <ErrorState
        title="Document queue unavailable"
        description="Try again to load the OCR queue."
      />
    );
  if (!documentList) return <LoadingState label="Loading document queue" />;
  const confidence = selected?.confidence ?? selectedQuery.data?.confidence ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      {showUpload && <DocumentUploadForm />}
      <DocumentQueue
        data={documentList}
        selectedId={selectedId}
        fetching={documentsQuery.isFetching}
        onRefresh={refresh}
        onSelect={setSelectedId}
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
        onConfirmChange={setConfirm}
        onFieldChange={updateCorrection}
        onRequestReview={requestReview}
        onConfirmReview={confirmReview}
      />
    </div>
  );
}
