"use client";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useCorpusPromotionForm } from "../hooks/use-corpus-promotion-form";

export function CorpusPromotionForm() {
  const {
    title,
    setTitle,
    sourceReference,
    setSourceReference,
    file,
    setFile,
    uploadProgress,
    promote,
    uploadCorpus,
  } = useCorpusPromotionForm();
  return (
    <WorkspaceCard title="Ingest knowledge source">
      <form className="space-y-2" onSubmit={promote}>
        <Input
          aria-label="Knowledge title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Knowledge title"
        />
        <Input
          aria-label="Knowledge source reference"
          value={sourceReference}
          onChange={(event) => setSourceReference(event.target.value)}
          placeholder="Source reference or URL"
        />
        <Input
          aria-label="Knowledge source file"
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
        {uploadCorpus.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(uploadCorpus.error)}
          </p>
        )}
        {uploadCorpus.isPending && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Uploading {uploadProgress}% and starting OCR…
          </p>
        )}
        {uploadCorpus.data && (
          <p className="text-sm text-muted-foreground">
            OCR {uploadCorpus.data.ocrJobId}: {uploadCorpus.data.status}
          </p>
        )}
        <Button
          type="submit"
          disabled={!title.trim() || !sourceReference.trim() || !file || uploadCorpus.isPending}
        >
          {uploadCorpus.isPending ? "Uploading…" : "Upload knowledge source"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
