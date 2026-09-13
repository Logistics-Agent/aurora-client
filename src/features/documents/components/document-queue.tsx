import Link from "next/link";
import { FileCheck2, RefreshCw } from "lucide-react";

import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DocumentList, DocumentStatus } from "@/dto/documents/document.dto";

import { documentStatusIntent, documentStatusLabel } from "../utils/document-display";

export function DocumentQueue({
  data,
  selectedId,
  fetching,
  onRefresh,
  onSelect,
  statusFilter,
  shipmentIdFilter,
  onStatusFilterChange,
  onShipmentIdFilterChange,
}: {
  data: DocumentList;
  selectedId?: string;
  fetching: boolean;
  onRefresh: () => void;
  onSelect: (id: string) => void;
  statusFilter: DocumentStatus["status"] | "";
  shipmentIdFilter: string;
  onStatusFilterChange: (status: DocumentStatus["status"] | "") => void;
  onShipmentIdFilterChange: (shipmentId: string) => void;
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
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="text-sm font-medium" htmlFor="document-status-filter">
          Status
          <select
            id="document-status-filter"
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value;
              onStatusFilterChange(isDocumentStatus(value) ? value : "");
            }}
          >
            <option value="">All statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="NEEDS_REVIEW">Needs review</option>
            <option value="REJECTED">Rejected</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="text-sm font-medium" htmlFor="document-shipment-filter">
          Shipment reference
          <Input
            id="document-shipment-filter"
            className="mt-1"
            value={shipmentIdFilter}
            onChange={(event) => onShipmentIdFilterChange(event.target.value)}
            placeholder="Filter by shipment ID"
          />
        </label>
      </div>
      {data.items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No documents currently in review queue.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((document) => (
            <Link
              href={`/documents/${encodeURIComponent(document.id)}`}
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
            </Link>
          ))}
        </div>
      )}
    </WorkspaceCard>
  );
}

function isDocumentStatus(value: string): value is DocumentStatus["status"] {
  return [
    "RECEIVED",
    "PROCESSING",
    "READY",
    "NEEDS_REVIEW",
    "REJECTED",
    "FAILED",
    "CANCELLED",
  ].includes(value);
}
