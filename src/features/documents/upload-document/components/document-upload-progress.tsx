"use client";

import { Button } from "@/components/ui/button";

import type { DocumentUploadPhase } from "../hooks/use-document-upload-form";

export function DocumentUploadProgress({
  phase,
  progress,
  errorMessage,
  retryLabel,
  onCancel,
  onRetry,
}: {
  phase: DocumentUploadPhase;
  progress: number;
  errorMessage: string | null;
  retryLabel: string;
  onCancel: () => void;
  onRetry: () => void;
}) {
  if (phase === "idle") return null;

  if (phase === "error") {
    return (
      <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
        <Button type="button" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      </div>
    );
  }

  const isIntaking = phase === "intaking";
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{isIntaking ? "Starting OCR intake…" : `${progress}% uploaded`}</span>
        {!isIntaking && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      {!isIntaking && (
        <progress
          className="h-2 w-full accent-primary"
          max={100}
          value={progress}
          aria-label="Upload progress"
        />
      )}
    </div>
  );
}
