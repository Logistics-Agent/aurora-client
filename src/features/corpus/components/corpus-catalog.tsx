"use client";

import { Badge } from "@/components/ui/badge";
import { WorkspaceCard } from "@/components/common";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useKnowledgeDocumentsQuery,
  useRegulatorySourcesQuery,
} from "@/hooks/queries/corpus/use-corpus-queries";

function CorpusStatus({ status }: { status: string }) {
  return <Badge variant={status === "COMPLETED" ? "secondary" : "outline"}>{status}</Badge>;
}

export function CorpusCatalog() {
  const regulatory = useRegulatorySourcesQuery();
  const knowledge = useKnowledgeDocumentsQuery();

  return (
    <WorkspaceCard title="Corpus processing status" className="lg:col-span-2">
      {(regulatory.isError || knowledge.isError) && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {getApiErrorMessage(regulatory.error ?? knowledge.error)}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <CatalogList
          title="Regulatory sources"
          emptyLabel="No regulatory sources yet."
          items={regulatory.data?.items.map((item) => ({
            id: item.id,
            title: item.title,
            detail: `${item.authority} · ${item.jurisdictionCode}`,
            version: item.latestVersion,
          }))}
          isLoading={regulatory.isLoading}
        />
        <CatalogList
          title="Knowledge documents"
          emptyLabel="No knowledge documents yet."
          items={knowledge.data?.items.map((item) => ({
            id: item.id,
            title: item.title,
            detail: `${item.category} · ${item.languageCode}`,
            version: item.latestVersion,
          }))}
          isLoading={knowledge.isLoading}
        />
      </div>
    </WorkspaceCard>
  );
}

function CatalogList({
  title,
  emptyLabel,
  items,
  isLoading,
}: {
  title: string;
  emptyLabel: string;
  items?: Array<{
    id: string;
    title: string;
    detail: string;
    version: {
      status: string;
      chunkCount: number;
      embeddedChunkCount: number;
    } | null;
  }>;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !items?.length && (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
      <div className="space-y-2">
        {items?.map((item) => (
          <div key={item.id} className="rounded-md bg-secondary p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{item.title}</p>
              <CorpusStatus status={item.version?.status ?? "UNKNOWN"} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            {item.version && (
              <p className="mt-1 text-xs text-muted-foreground">
                {item.version.embeddedChunkCount}/{item.version.chunkCount} chunks embedded
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
