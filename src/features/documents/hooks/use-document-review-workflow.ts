"use client";

import { useState } from "react";

import type { DocumentReviewInput } from "@/api/services/documents.service";
import { useDocumentLifecycleMutation } from "@/hooks/mutations/documents/use-document-lifecycle-mutation";
import { useDocumentReviewMutation } from "@/hooks/mutations/documents/use-document-review-mutation";
import {
  useDocumentQuery,
  useDocumentReviewQuery,
} from "@/hooks/queries/documents/use-document-query";
import { useDocumentsQuery } from "@/hooks/queries/documents/use-documents-query";
import type { DocumentStatus } from "@/dto/documents/document.dto";
import { toApiError } from "@/lib/api-error";

export function useDocumentReviewWorkflow({
  showOcrFields,
  initialDocumentId,
}: {
  showOcrFields: boolean;
  initialDocumentId?: string;
}) {
  const [selectedId, setSelectedId] = useState(initialDocumentId);
  const [confirm, setConfirm] = useState(false);
  const [reviewAction, setReviewAction] = useState<DocumentReviewInput["decision"] | null>(null);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus["status"] | "">("");
  const [shipmentIdFilter, setShipmentIdFilter] = useState("");
  const [reviewConflict, setReviewConflict] = useState(false);
  const [correctionsByDocument, setCorrectionsByDocument] = useState<
    Record<string, Record<string, string>>
  >({});
  const documentsQuery = useDocumentsQuery({
    page: 1,
    pageSize: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(shipmentIdFilter.trim() ? { shipmentId: shipmentIdFilter.trim() } : {}),
  });
  const documents = documentsQuery.data?.items ?? [];
  const effectiveSelectedId = selectedId ?? documents[0]?.id;
  const listSelected = documents.find((document) => document.id === effectiveSelectedId);
  const selectedQuery = useDocumentQuery(initialDocumentId);
  const selected = selectedQuery.data ?? listSelected ?? null;
  const reviewQuery = useDocumentReviewQuery(showOcrFields ? effectiveSelectedId : undefined);
  const reviewMutation = useDocumentReviewMutation();
  const lifecycleMutation = useDocumentLifecycleMutation();
  const corrections = selected ? (correctionsByDocument[selected.id] ?? {}) : {};

  const refresh = () => {
    void documentsQuery.refetch();
    void selectedQuery.refetch();
    if (showOcrFields) void reviewQuery.refetch();
  };

  const requestReview = (action: DocumentReviewInput["decision"]) => {
    setReviewConflict(false);
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
      })
      .catch((error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.status === 409 || apiError.code === "INVALID_STATE_TRANSITION") {
          setReviewConflict(true);
          void reviewQuery.refetch();
        }
      });
  };

  const updateCorrection = (name: string, value: string) => {
    if (!selected) return;
    setReviewConflict(false);
    setCorrectionsByDocument((current) => ({
      ...current,
      [selected.id]: { ...(current[selected.id] ?? {}), [name]: value },
    }));
  };

  return {
    documentsQuery,
    documentList: documentsQuery.data,
    selected,
    reviewQuery,
    selectedQuery,
    reviewMutation,
    lifecycleMutation,
    selectedId: selected?.id,
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
    retryDocument: () => {
      if (selected) void lifecycleMutation.mutateAsync({ id: selected.id, action: "retry" });
    },
    cancelDocument: () => {
      if (selected) void lifecycleMutation.mutateAsync({ id: selected.id, action: "cancel" });
    },
  };
}
