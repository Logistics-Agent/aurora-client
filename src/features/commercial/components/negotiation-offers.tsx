"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import {
  AiInsight,
  ConfirmActionDialog,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { acceptOffer, carrierOfferMocks } from "../mock";
import { negotiationService, type NegotiationMailDraftResponse } from "@/api/services/negotiation.service";

export interface NegotiationOffersProps {
  negotiationId?: string;
}

export function NegotiationOffers({ negotiationId = "SHP-2026-00128" }: NegotiationOffersProps) {
  const [offers, setOffers] = useState(carrierOfferMocks);
  const [confirm, setConfirm] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [createdDraft, setCreatedDraft] = useState<NegotiationMailDraftResponse | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const selected = offers[0];

  const handleCreateDraft = async () => {
    setIsCreatingDraft(true);
    setDraftError(null);
    try {
      // Default domain shared mailbox for Operations
      const defaultMailboxId = "01a08e7e-b561-791e-ac90-a534ac284e2c";
      const result = await negotiationService.createMailDraft(negotiationId, defaultMailboxId);
      setCreatedDraft(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create mail draft";
      setDraftError(message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <WorkspaceCard title="Carrier offers">
        <div className="space-y-3">
          {offers.map((offer) => (
            <button
              type="button"
              key={offer.id}
              onClick={() =>
                setOffers((current) =>
                  current.map((item) =>
                    item.id === offer.id ? { ...item, state: "Pending" } : item,
                  ),
                )
              }
              className="w-full rounded-lg border border-border p-3 text-left hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{offer.carrier}</span>
                <span className="font-mono font-medium text-primary">{offer.amount}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {offer.state}
              </p>
            </button>
          ))}
        </div>
      </WorkspaceCard>

      <WorkspaceCard title="Explainable recommendation & Draft">
        <AiInsight
          result="Counter-offer of $17,950 is within expected lane range."
          confidence={79}
          reason="Comparable lane rates support a modest reduction based on market benchmarks."
          sources={["Lane benchmark", "Carrier offer"]}
          timestamp="Updated locally"
          suggestedAction="Review before accepting"
          onReview={() => setConfirm(true)}
        />

        <div className="mt-4 space-y-2.5 pt-3 border-t border-border">
          <Button className="w-full" onClick={() => setConfirm(true)}>
            Accept offer
          </Button>

          {/* Connected Draft Mail Action */}
          <Button
            variant="outline"
            className="w-full text-xs font-semibold gap-2 border-primary/30 hover:bg-primary/5"
            onClick={handleCreateDraft}
            disabled={isCreatingDraft}
          >
            {isCreatingDraft ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Creating Mail Draft...
              </>
            ) : (
              <>
                <Mail className="size-3.5 text-primary" />
                Tạo Mail Draft từ gợi ý AI
              </>
            )}
          </Button>

          {createdDraft && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                <span>Mail Draft đã sẵn sàng trong Thread!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Draft ID: <span className="font-mono">{createdDraft.draftId}</span>
              </p>
              <Link
                href={`/mail/${createdDraft.threadId || ""}`}
                className="inline-flex items-center gap-1 font-semibold text-primary underline text-xs mt-1 hover:text-primary/80"
              >
                Mở Mail Workspace để duyệt & gửi <ExternalLink className="size-3" />
              </Link>
            </div>
          )}

          {draftError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
              <span className="font-semibold">Notice:</span> {draftError}
            </div>
          )}
        </div>
      </WorkspaceCard>

      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Accept ${selected.carrier} offer?`}
        consequence="Accepting this offer will finalize negotiation terms for this lane."
        confirmLabel="Confirm"
        onConfirm={() => {
          setOffers((current) =>
            current.map((offer) =>
              offer.id === selected.id ? acceptOffer(offer) : offer,
            ),
          );
          setConfirm(false);
        }}
      />
    </div>
  );
}

