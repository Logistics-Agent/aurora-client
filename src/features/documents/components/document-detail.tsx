import { useMemo } from "react";

import type { DocumentReviewInput } from "@/api/services/documents.service";
import { ConfirmActionDialog, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DocumentReview, DocumentStatus } from "@/dto/documents/document.dto";
import { getApiErrorMessage } from "@/lib/api-error";

type ReviewAction = DocumentReviewInput["decision"];

const actionCopy: Record<ReviewAction, { title: string; consequence: string; label: string }> = {
  CONFIRM: {
    title: "Confirm extraction?",
    consequence: "Confirms the OCR fields and completes human verification.",
    label: "Confirm",
  },
  CORRECT: {
    title: "Submit corrections?",
    consequence: "Saves the corrected OCR fields and completes human verification.",
    label: "Submit corrections",
  },
  REJECT: {
    title: "Reject extraction?",
    consequence: "Marks the OCR extraction as rejected for follow-up processing.",
    label: "Reject",
  },
};

export function DocumentDetail({
  selected,
  review,
  confidence,
  confirm,
  reviewAction,
  corrections,
  reviewPending,
  reviewError,
  reviewConflict,
  lifecyclePending,
  lifecycleError,
  onConfirmChange,
  onFieldChange,
  onRequestReview,
  onConfirmReview,
  onRetry,
  onCancel,
}: {
  selected: DocumentStatus | null;
  review?: DocumentReview;
  confidence: number | null;
  confirm: boolean;
  reviewAction: ReviewAction | null;
  corrections: Record<string, string>;
  reviewPending: boolean;
  reviewError?: unknown;
  reviewConflict: boolean;
  lifecyclePending: boolean;
  lifecycleError?: unknown;
  onConfirmChange: (open: boolean) => void;
  onFieldChange: (name: string, value: string) => void;
  onRequestReview: (action: ReviewAction) => void;
  onConfirmReview: () => void;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const fields = review?.fields ?? [];
  const hasCorrections = Object.keys(corrections).length > 0;
  const copy = reviewAction ? actionCopy[reviewAction] : actionCopy.CONFIRM;
  const fallbackConfidence = useMemo(
    () => (confidence === null ? "—" : `${Math.round(confidence * 100)}%`),
    [confidence],
  );

  if (!selected)
    return (
      <WorkspaceCard title="Review detail">
        <div className="py-8 text-center text-sm text-muted-foreground">
          Select a document from the queue to view extraction details.
        </div>
      </WorkspaceCard>
    );

  const reviewErrorMessage = reviewError ? getApiErrorMessage(reviewError) : undefined;
  const lifecycleErrorMessage = lifecycleError ? getApiErrorMessage(lifecycleError) : undefined;
  const canCancel = selected.status === "RECEIVED" || selected.status === "PROCESSING";
  const canRetry = selected.status === "FAILED";
  return (
    <>
      <WorkspaceCard title="Review detail">
        <div className="space-y-3">
          {fields.length > 0 ? (
            fields.map((field) => (
              <div className="space-y-1 border-b border-border pb-2" key={field.name}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="text-muted-foreground" htmlFor={`ocr-field-${field.name}`}>
                    {field.name}
                  </label>
                  <span className="text-ai text-xs">
                    {Math.round(field.confidence * 100)}% confidence
                  </span>
                </div>
                <Input
                  id={`ocr-field-${field.name}`}
                  value={corrections[field.name] ?? field.value}
                  onChange={(event) => onFieldChange(field.name, event.target.value)}
                  aria-label={`OCR field ${field.name}`}
                  disabled={!selected.needsReview || reviewPending}
                />
              </div>
            ))
          ) : (
            <div className="flex justify-between gap-3 border-b border-border pb-2 text-sm">
              <span className="text-muted-foreground">Selected document</span>
              <span className="font-medium">
                {selected.fileName}{" "}
                <span className="text-ai ml-2 text-xs">{fallbackConfidence}</span>
              </span>
            </div>
          )}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Button
            disabled={!selected.needsReview || reviewPending}
            onClick={() => onRequestReview("CONFIRM")}
          >
            Confirm extraction
          </Button>
          <Button
            variant="outline"
            disabled={!selected.needsReview || reviewPending || !hasCorrections}
            onClick={() => onRequestReview("CORRECT")}
          >
            Submit corrections
          </Button>
          <Button
            variant="destructive"
            disabled={!selected.needsReview || reviewPending}
            onClick={() => onRequestReview("REJECT")}
          >
            Reject extraction
          </Button>
        </div>
        {(canCancel || canRetry) && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            {canRetry && (
              <Button type="button" variant="outline" disabled={lifecyclePending} onClick={onRetry}>
                {lifecyclePending ? "Retrying…" : "Retry OCR"}
              </Button>
            )}
            {canCancel && (
              <Button type="button" variant="ghost" disabled={lifecyclePending} onClick={onCancel}>
                {lifecyclePending ? "Cancelling…" : "Cancel processing"}
              </Button>
            )}
          </div>
        )}
        {!selected.needsReview && (
          <p className="mt-2 text-sm text-muted-foreground">Document does not require review.</p>
        )}
        {reviewErrorMessage && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {reviewErrorMessage}
          </p>
        )}
        {reviewConflict && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            This document changed while you were reviewing it. The latest OCR values were loaded;
            review your corrections and submit again.
          </p>
        )}
        {lifecycleErrorMessage && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {lifecycleErrorMessage}
          </p>
        )}
      </WorkspaceCard>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={onConfirmChange}
        title={`${copy.title} ${selected.fileName}`}
        consequence={copy.consequence}
        confirmLabel={reviewPending ? `${copy.label}…` : copy.label}
        onConfirm={onConfirmReview}
      />
    </>
  );
}
