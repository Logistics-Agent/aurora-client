"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/components/common";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useKnowledgeDocumentsQuery,
  useRegulatorySourcesQuery,
} from "@/hooks/queries/corpus/use-corpus-queries";

import { CorpusIngestionPipeline } from "./corpus-ingestion-pipeline";

function CorpusStatus({ status }: { status: string }) {
  return <Badge variant={status === "COMPLETED" ? "secondary" : "outline"}>{status}</Badge>;
}

const PAGE_SIZE = 5;

export function CorpusCatalog() {
  const [regulatoryPage, setRegulatoryPage] = useState(1);
  const [knowledgePage, setKnowledgePage] = useState(1);

  const regulatory = useRegulatorySourcesQuery({ page: regulatoryPage, pageSize: PAGE_SIZE });
  const knowledge = useKnowledgeDocumentsQuery({ page: knowledgePage, pageSize: PAGE_SIZE });

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
            version: item.latestVersion && {
              ...item.latestVersion,
              errorMessage: item.latestVersion.errorMessage,
            },
          }))}
          isLoading={regulatory.isLoading}
          page={regulatoryPage}
          pageSize={PAGE_SIZE}
          totalCount={regulatory.data?.totalCount ?? 0}
          onPageChange={setRegulatoryPage}
        />
        <CatalogList
          title="Knowledge documents"
          emptyLabel="No knowledge documents yet."
          items={knowledge.data?.items.map((item) => ({
            id: item.id,
            title: item.title,
            detail: `${item.category} · ${item.languageCode}`,
            version: item.latestVersion && {
              ...item.latestVersion,
              errorMessage: item.latestVersion.errorMessage,
            },
          }))}
          isLoading={knowledge.isLoading}
          page={knowledgePage}
          pageSize={PAGE_SIZE}
          totalCount={knowledge.data?.totalCount ?? 0}
          onPageChange={setKnowledgePage}
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
  page = 1,
  pageSize = PAGE_SIZE,
  totalCount = 0,
  onPageChange,
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
      errorMessage?: string | null;
    } | null;
  }>;
  isLoading: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border p-3">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              Total: {totalCount}
            </span>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && !items?.length && (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}

        {/* Scrollable list of items */}
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {items?.map((item) => (
            <div key={item.id} className="rounded-md bg-secondary p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{item.title}</p>
                <CorpusStatus status={item.version?.status ?? "UNKNOWN"} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              {item.version && <CorpusIngestionPipeline version={item.version} />}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && onPageChange && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
