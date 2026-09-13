"use client";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useCorpusIngestionForm } from "../hooks/use-corpus-ingestion-form";

export function CorpusIngestionForm() {
  const {
    authority,
    setAuthority,
    title,
    setTitle,
    canonicalSourceUri,
    setCanonicalSourceUri,
    file,
    setFile,
    uploadProgress,
    ingest,
    uploadCorpus,
  } = useCorpusIngestionForm();
  return (
    <WorkspaceCard title="Ingest regulatory source">
      <form className="space-y-2" onSubmit={ingest}>
        <Input
          aria-label="Regulatory authority"
          value={authority}
          onChange={(event) => setAuthority(event.target.value)}
          placeholder="Authority"
        />
        <Input
          aria-label="Regulatory title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
        />
        <Input
          aria-label="Canonical source URI"
          type="url"
          value={canonicalSourceUri}
          onChange={(event) => setCanonicalSourceUri(event.target.value)}
          placeholder="https://authority.example/rule"
        />
        <Input
          aria-label="Regulatory source file"
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
          disabled={
            !authority.trim() ||
            !title.trim() ||
            !canonicalSourceUri.trim() ||
            !file ||
            uploadCorpus.isPending
          }
        >
          {uploadCorpus.isPending ? "Uploading…" : "Upload regulatory source"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
