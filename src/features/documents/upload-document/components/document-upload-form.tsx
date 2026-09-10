"use client";

import { Upload } from "lucide-react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { DOCUMENT_TYPE_OPTIONS } from "../constants/document-type-options";
import { useDocumentUploadForm } from "../hooks/use-document-upload-form";

export function DocumentUploadForm() {
  const {
    storageReference,
    setStorageReference,
    fileName,
    setFileName,
    sizeBytes,
    setSizeBytes,
    documentTypeHint,
    setDocumentTypeHint,
    shipmentId,
    setShipmentId,
    submit,
    submitMutation,
  } = useDocumentUploadForm();
  return (
    <WorkspaceCard title="Upload">
      <form
        className="space-y-3 rounded-xl border border-dashed border-border p-4"
        onSubmit={submit}
      >
        <Upload className="mx-auto size-8 text-primary" />
        <p className="font-semibold">Submit an uploaded document</p>
        <p className="text-sm text-muted-foreground">
          The storage service must provide the reference before OCR submission.
        </p>
        <Input
          aria-label="Storage reference"
          value={storageReference}
          onChange={(event) => setStorageReference(event.target.value)}
          placeholder="Storage reference"
        />
        <Input
          aria-label="Document file name"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="File name"
        />
        <Input
          aria-label="Document size in bytes"
          type="number"
          min={1}
          value={sizeBytes || ""}
          onChange={(event) => setSizeBytes(Number(event.target.value))}
          placeholder="Size in bytes"
        />
        <Input
          aria-label="Shipment id"
          value={shipmentId}
          onChange={(event) => setShipmentId(event.target.value)}
          placeholder="Shipment id (optional)"
        />
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Document type</span>
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
            value={documentTypeHint}
            onChange={(event) => setDocumentTypeHint(Number(event.target.value))}
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {submitMutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(submitMutation.error)}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            !storageReference.trim() ||
            !fileName.trim() ||
            sizeBytes <= 0 ||
            submitMutation.isPending
          }
        >
          {submitMutation.isPending ? "Submitting…" : "Submit for OCR"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
