"use client";

import { useState } from "react";

import type { DocumentReviewInput } from "@/api/services/documents.service";
import { useDocumentReviewMutation } from "@/hooks/mutations/documents/use-document-review-mutation";
import {
  useDocumentQuery,
  useDocumentReviewQuery,
} from "@/hooks/queries/documents/use-document-query";
import { useDocumentsQuery } from "@/hooks/queries/documents/use-documents-query";

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
  const [correctionsByDocument, setCorrectionsByDocument] = useState<
    Record<string, Record<string, string>>
  >({});
  const documentsQuery = useDocumentsQuery({ page: 1, pageSize: 20 });
  const documents = documentsQuery.data?.items ?? [];
  const selected = documents.find((document) => document.id === selectedId) ?? documents[0] ?? null;
  const reviewQuery = useDocumentReviewQuery(showOcrFields ? selected?.id : undefined);
  const selectedQuery = useDocumentQuery(showOcrFields ? undefined : selected?.id);
  const reviewMutation = useDocumentReviewMutation();
  const corrections = selected ? (correctionsByDocument[selected.id] ?? {}) : {};

  const refresh = () => {
    void documentsQuery.refetch();
    if (showOcrFields) void reviewQuery.refetch();
  };

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

  const updateCorrection = (name: string, value: string) => {
    if (!selected) return;
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
  };
}
