"use client";

import { Upload } from "lucide-react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DOCUMENT_TYPE_OPTIONS,
  isDocumentTypeOptionValue,
} from "../constants/document-type-options";
import { useDocumentUploadForm } from "../hooks/use-document-upload-form";
import { DocumentUploadProgress } from "./document-upload-progress";

export function DocumentUploadForm({ initialShipmentId = "" }: { initialShipmentId?: string }) {
  const {
    file,
    documentTypeHint,
    shipmentId,
    phase,
    progress,
    errorMessage,
    validationMessage,
    hasUploadedSession,
    isBusy,
    handleFileChange,
    setDocumentTypeHint,
    setShipmentId,
    submit,
    cancel,
  } = useDocumentUploadForm(initialShipmentId);

  const isInvalid = Boolean(validationMessage);
  const submitLabel = phase === "intaking" ? "Starting OCR…" : "Start upload";

  return (
    <WorkspaceCard title="Upload document">
      <form className="space-y-4" onSubmit={submit}>
        <div className="rounded-xl border border-dashed border-border p-4">
          <Upload className="mx-auto size-8 text-primary" aria-hidden="true" />
          <p className="mt-2 text-center font-semibold">Upload a document for OCR</p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Choose a PDF, JPG, or PNG file up to 10 MB.
          </p>
          <label className="mt-4 block text-sm font-medium" htmlFor="document-file">
            Document file
            <Input
              id="document-file"
              className="mt-1"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              disabled={isBusy}
            />
          </label>
          {file && !isInvalid && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {file.name} ({formatFileSize(file.size)})
            </p>
          )}
          {validationMessage && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {validationMessage}
            </p>
          )}
        </div>

        <label className="block text-sm font-medium" htmlFor="document-type">
          Document type
          <select
            id="document-type"
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
            value={documentTypeHint}
            onChange={(event) => {
              if (isDocumentTypeOptionValue(event.target.value)) {
                setDocumentTypeHint(event.target.value);
              }
            }}
            disabled={isBusy}
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium" htmlFor="shipment-id">
          Shipment reference <span className="font-normal text-muted-foreground">(optional)</span>
          <Input
            id="shipment-id"
            className="mt-1"
            value={shipmentId}
            onChange={(event) => setShipmentId(event.target.value)}
            placeholder="Search or enter shipment ID"
            disabled={isBusy}
          />
        </label>

        <DocumentUploadProgress
          phase={phase}
          progress={progress}
          errorMessage={errorMessage}
          retryLabel={hasUploadedSession ? "Retry intake" : "Retry upload"}
          onCancel={cancel}
          onRetry={() => void submit()}
        />

        <Button type="submit" disabled={!file || isInvalid || isBusy || phase === "error"}>
          {submitLabel}
        </Button>
      </form>
    </WorkspaceCard>
  );
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`;
}
