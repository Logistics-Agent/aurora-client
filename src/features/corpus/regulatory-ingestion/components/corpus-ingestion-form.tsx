"use client";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    contentReference,
    setContentReference,
    rawText,
    setRawText,
    ingest,
    ingestRegulatory,
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
          aria-label="Regulatory content reference"
          value={contentReference}
          onChange={(event) => setContentReference(event.target.value)}
          placeholder="regulatory/tenant/rule.md"
        />
        <Textarea
          aria-label="Regulatory raw text"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="Regulatory source text"
        />
        {ingestRegulatory.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(ingestRegulatory.error)}
          </p>
        )}
        {ingestRegulatory.data && (
          <p className="text-sm text-muted-foreground">
            Ingestion {ingestRegulatory.data.id}: {ingestRegulatory.data.status}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            !authority.trim() ||
            !title.trim() ||
            !canonicalSourceUri.trim() ||
            !contentReference.trim() ||
            !rawText.trim() ||
            ingestRegulatory.isPending
          }
        >
          {ingestRegulatory.isPending ? "Submitting…" : "Submit regulatory source"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
