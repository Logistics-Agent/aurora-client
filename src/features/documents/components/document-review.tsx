"use client";

import { useEffect, useState } from "react";
import { FileCheck2, RefreshCw, Upload } from "lucide-react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { documentsService } from "@/api/services/documents.service";
import { approveDocument, documentMocks, type DocumentMock, ocrFieldMocks } from "../mock";

export function DocumentReview({
  showUpload = false,
  showOcrFields = false,
  initialDocumentId,
}: {
  showUpload?: boolean;
  showOcrFields?: boolean;
  initialDocumentId?: string;
}) {
  const [documents, setDocuments] = useState<DocumentMock[]>([]);
  const [selected, setSelected] = useState<DocumentMock | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrFields, setOcrFields] = useState<
    { label: string; value: string; confidence: string }[]
  >([]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await documentsService.listDocuments({ pageSize: 20 });
      if (res?.items && res.items.length > 0) {
        const mapped: DocumentMock[] = res.items.map((item) => ({
          id: item.jobId,
          name: item.fileName || "Shipment Document",
          shipmentId: item.sourceType || "Shipment",
          state:
            item.status === "VERIFIED"
              ? "Verified"
              : item.status === "NEEDS_REVIEW"
                ? "Needs review"
                : "Processing",
          confidence: Math.round(item.confidence * 100),
        }));
        setDocuments(mapped);
        const currentSelected =
          mapped.find((d) => d.id === initialDocumentId) || mapped[0];
        if (currentSelected) setSelected(currentSelected);
      } else {
        setDocuments([]);
        setSelected(null);
      }
    } catch {
      setDocuments([]);
      setSelected(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, [initialDocumentId]);

  useEffect(() => {
    if (!selected?.id) return;
    const fetchOcrDetails = async () => {
      try {
        const review = await documentsService.getOcrReviewDetails(selected.id);
        if (review?.fields && review.fields.length > 0) {
          setOcrFields(
            review.fields.map((f) => ({
              label: f.fieldName,
              value: f.fieldValue,
              confidence: `${Math.round(f.confidence * 100)}%`,
            })),
          );
        }
      } catch {
        // Fallback
      }
    };
    if (showOcrFields) {
      void fetchOcrDetails();
    }
  }, [selected?.id, showOcrFields]);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {showUpload && (
          <WorkspaceCard title="Upload">
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Upload className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-semibold">Select document file</p>
              <Button
                className="mt-4"
                onClick={() => setSelected(documents[0] ?? documentMocks[1])}
              >
                Select file
              </Button>
            </div>
          </WorkspaceCard>
        )}
        <WorkspaceCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Document queue</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadDocuments()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 size-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No documents currently in review queue.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <button
                  type="button"
                  key={document.id}
                  onClick={() => setSelected(document)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${selected?.id === document.id ? "border-primary bg-blue-50" : "border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="size-4 text-primary" />
                    <div>
                      <p className="font-semibold">{document.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {document.id} · {document.shipmentId}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    label={document.state}
                    intent={
                      document.state === "Verified"
                        ? "success"
                        : document.state === "Processing"
                          ? "ai"
                          : "warning"
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </WorkspaceCard>
        <WorkspaceCard title="Review detail">
          {!selected ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Select a document from the queue to view extraction details.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {(showOcrFields
                  ? ocrFields
                  : [
                      {
                        label: "Selected document",
                        value: selected.name,
                        confidence: `${selected.confidence ?? 0}%`,
                      },
                    ]
                ).map((field) => (
                  <div
                    className="flex justify-between gap-3 border-b border-border pb-2 text-sm"
                    key={field.label}
                  >
                    <span className="text-muted-foreground">{field.label}</span>
                    <span className="font-medium">
                      {field.value}{" "}
                      <span className="ml-2 text-xs text-ai">
                        {field.confidence}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="mt-5 w-full"
                disabled={selected.state === "Verified"}
                onClick={() => setConfirm(true)}
              >
                {selected.state === "Verified"
                  ? "Document verified"
                  : "Approve extraction"}
              </Button>
            </>
          )}
        </WorkspaceCard>
      </div>
      {selected && (
        <ConfirmActionDialog
          open={confirm}
          onOpenChange={setConfirm}
          title={`Approve ${selected.name}?`}
          consequence="Submits human verification to Staff BFF Document OCR Service."
          confirmLabel="Approve"
          onConfirm={async () => {
            try {
              await documentsService.reviewDocument(selected.id, {
                decision: "CONFIRM",
              });
            } catch {
              // Best-effort remote call
            }
            const approved = approveDocument(selected);
            setDocuments((current) =>
              current.map((document) =>
                document.id === selected.id ? approved : document,
              ),
            );
            setSelected(approved);
            setConfirm(false);
          }}
        />
      )}
    </>
  );
}
