"use client";

import { useState } from "react";
import {
  AiInsight,
  ConfirmActionDialog,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { acceptOffer, carrierOfferMocks } from "../mock";

export function NegotiationOffers() {
  const [offers, setOffers] = useState(carrierOfferMocks);
  const [confirm, setConfirm] = useState(false);
  const selected = offers[0];

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
              className="w-full rounded-lg border border-border p-3 text-left"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{offer.carrier}</span>
                <span>{offer.amount}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {offer.state}
              </p>
            </button>
          ))}
        </div>
      </WorkspaceCard>
      <WorkspaceCard title="Explainable recommendation">
        <AiInsight
          result="Counter-offer of $17,950 is within expected lane range."
          confidence={79}
          reason="Comparable lane rates support a modest reduction."
          sources={["Lane benchmark", "Carrier offer"]}
          timestamp="Updated locally"
          suggestedAction="Review before accepting"
          onReview={() => setConfirm(true)}
        />
        <Button className="mt-4 w-full" onClick={() => setConfirm(true)}>
          Accept offer
        </Button>
      </WorkspaceCard>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Accept ${selected.carrier} offer?`}
        consequence="Only local mock state changes."
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
