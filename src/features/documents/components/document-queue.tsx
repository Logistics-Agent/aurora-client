import { FileCheck2, RefreshCw } from "lucide-react";

import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { DocumentList } from "@/dto/documents/document.dto";

import { documentStatusIntent, documentStatusLabel } from "../utils/document-display";

export function DocumentQueue({
  data,
  selectedId,
  fetching,
  onRefresh,
  onSelect,
}: {
  data: DocumentList;
  selectedId?: string;
  fetching: boolean;
  onRefresh: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <WorkspaceCard
      title="Document queue"
      action={
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={fetching}>
          <RefreshCw className={`mr-2 size-3.5 ${fetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      {data.items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No documents currently in review queue.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((document) => (
            <button
              type="button"
              key={document.id}
              onClick={() => onSelect(document.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${selectedId === document.id ? "border-primary bg-blue-50" : "border-border"}`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="size-4 text-primary" />
                <div>
                  <p className="font-semibold">{document.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.id} · {document.documentType}
                  </p>
                </div>
              </div>
              <StatusBadge
                label={documentStatusLabel(document.status)}
                intent={documentStatusIntent(document.status)}
              />
            </button>
          ))}
        </div>
      )}
    </WorkspaceCard>
  );
}
