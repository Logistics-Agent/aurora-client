"use client";

import { useState } from "react";

import type { DocumentReviewInput } from "@/api/services/documents.service";
import { ErrorState, LoadingState } from "@/components/common";
import { useDocumentReviewMutation } from "@/hooks/mutations/documents/use-document-review-mutation";
import {
  useDocumentQuery,
  useDocumentReviewQuery,
} from "@/hooks/queries/documents/use-document-query";
import { useDocumentsQuery } from "@/hooks/queries/documents/use-documents-query";

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
  const [selectedId, setSelectedId] = useState(initialDocumentId);
  const [confirm, setConfirm] = useState(false);
  const [reviewAction, setReviewAction] = useState<DocumentReviewInput["decision"] | null>(null);
  const [correctionsByDocument, setCorrectionsByDocument] = useState<
    Record<string, Record<string, string>>
  >({});
  const documentsQuery = useDocumentsQuery({ page: 1, pageSize: 20 });
  const documents = documentsQuery.data?.items ?? [];
  const selected = documents.find((document) => document.id === selectedId) ?? documents[0] ?? null;
  const reviewQuery = useDocumentReviewQuery(showOcrFields ? selected?.id : undefined);
  const selectedQuery = useDocumentQuery(showOcrFields ? undefined : selected?.id);
  const reviewMutation = useDocumentReviewMutation();

  if (documentsQuery.isLoading) return <LoadingState label="Loading document queue" />;
  if (documentsQuery.isError)
    return (
      <ErrorState
        title="Document queue unavailable"
        description="Try again to load the OCR queue."
      />
    );
  const documentList = documentsQuery.data;
  if (!documentList) return <LoadingState label="Loading document queue" />;
  const refresh = () => {
    void documentsQuery.refetch();
    if (showOcrFields) void reviewQuery.refetch();
  };
  const confidence = selected?.confidence ?? selectedQuery.data?.confidence ?? null;
  const corrections = selected ? (correctionsByDocument[selected.id] ?? {}) : {};
  const requestReview = (action: DocumentReviewInput["decision"]) => {
    setReviewAction(action);
    setConfirm(true);
  };
  const confirmReview = () => {
    if (!selected) return;
    const action = reviewAction ?? "CONFIRM";
    void reviewMutation
      .mutateAsync({
        id: selected.id,
        input: {
          decision: action,
          ...(action === "CORRECT" ? { correctedFields: corrections } : {}),
        },
      })
      .then(() => {
        setConfirm(false);
        setReviewAction(null);
        setCorrectionsByDocument((current) => {
          const next = { ...current };
          delete next[selected.id];
          return next;
        });
      });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      {showUpload && <DocumentUploadForm />}
      <DocumentQueue
        data={documentList}
        selectedId={selected?.id}
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
        onFieldChange={(name, value) => {
          if (!selected) return;
          setCorrectionsByDocument((current) => ({
            ...current,
            [selected.id]: { ...(current[selected.id] ?? {}), [name]: value },
          }));
        }}
        onRequestReview={requestReview}
        onConfirmReview={confirmReview}
      />
    </div>
  );
}
