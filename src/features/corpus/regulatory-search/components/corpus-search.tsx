"use client";

import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useCorpusSearch } from "../hooks/use-corpus-search";

export function CorpusSearch() {
  const { query, setQuery, search, queryRegulatory } = useCorpusSearch();
  return (
    <WorkspaceCard title="Search approved evidence">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={search}>
        <Input
          aria-label="Regulatory corpus query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search regulatory corpus"
        />
        <Button type="submit" disabled={!query.trim() || queryRegulatory.isFetching}>
          {queryRegulatory.isFetching ? "Searching…" : "Search regulatory corpus"}
        </Button>
      </form>
      {queryRegulatory.isError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {getApiErrorMessage(queryRegulatory.error)}
        </p>
      )}
      {queryRegulatory.data && (
        <WorkspaceCard
          title={`Evidence (${queryRegulatory.data.results.length})`}
          action={
            <StatusBadge
              label={queryRegulatory.data.evidenceSufficiency}
              intent={
                queryRegulatory.data.evidenceSufficiency === "SUFFICIENT" ? "success" : "warning"
              }
            />
          }
        >
          <p className="mb-3 text-xs text-muted-foreground">
            Retrieval trace: {queryRegulatory.data.retrievalTraceId}
          </p>
          {queryRegulatory.data.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved evidence matched the query.</p>
          ) : (
            <div className="space-y-3">
              {queryRegulatory.data.results.map((result) => (
                <article
                  key={`${result.documentVersionId}:${result.chunkId}`}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{result.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.score * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {result.authority} · {result.jurisdiction} ·{" "}
                    {result.section || "Section unavailable"}
                  </p>
                  <p className="mt-2">{result.excerpt}</p>
                </article>
              ))}
            </div>
          )}
        </WorkspaceCard>
      )}
    </WorkspaceCard>
  );
}
