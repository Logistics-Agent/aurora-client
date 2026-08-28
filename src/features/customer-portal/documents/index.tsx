"use client";

import { useMemo, useState } from "react";
import { FileText, Search, X } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { customerDocumentMocks } from "../mock";

export function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [openedId, setOpenedId] = useState<string>();
  const documents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? customerDocumentMocks.filter((document) =>
          `${document.name} ${document.shipmentId}`
            .toLowerCase()
            .includes(normalized),
        )
      : customerDocumentMocks;
  }, [query]);
  const openedDocument = customerDocumentMocks.find(
    ({ id }) => id === openedId,
  );

  return (
    <>
      <CustomerPageHeading
        title="Documents"
        description="Review customer-visible documents shared with your organization."
      />
      <label className="relative mb-5 block max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search documents"
          className="bg-card pl-9"
        />
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        {documents.map((document) => (
          <WorkspaceCard key={document.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <FileText className="size-5" />
              </span>
              <StatusBadge
                label={document.state}
                intent={
                  document.state === "Needs review" ? "warning" : "success"
                }
              />
            </div>
            <div>
              <h2 className="font-semibold">{document.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {document.shipmentId} · {document.format}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setOpenedId(document.id)}
              aria-label={`Open ${document.name}`}
            >
              Open document
            </Button>
          </WorkspaceCard>
        ))}
      </div>
      {documents.length === 0 && (
        <WorkspaceCard className="text-center text-sm text-muted-foreground">
          No shared documents match this search.
        </WorkspaceCard>
      )}
      {openedDocument && (
        <WorkspaceCard className="mt-5 border-blue-200 bg-blue-50/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                Document preview: {openedDocument.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fixture preview for {openedDocument.shipmentId}. File download
                becomes available during backend integration.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenedId(undefined)}
            >
              <X className="size-4" />
              <span className="sr-only">Close document preview</span>
            </Button>
          </div>
        </WorkspaceCard>
      )}
    </>
  );
}
