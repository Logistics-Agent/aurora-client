"use client";

import { useState } from "react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CommercialSummary } from "../components/commercial-summary";
import { CostComposition } from "../components/cost-composition";

export function BillingPage() {
  const [confirm, setConfirm] = useState(false);
  const [recorded, setRecorded] = useState(false);

  return (
    <>
      <PageHeader
        title="Billing"
        description="Review shipment billing with explicit local confirmation."
        actions={
          <StatusBadge
            label={recorded ? "Recorded locally" : "2 overdue"}
            intent="warning"
          />
        }
      />
      <CommercialSummary />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <CostComposition title="Billing composition" />
        <WorkspaceCard title="Payment action">
          <p className="text-sm text-muted-foreground">
            This prototype records only local fixture state and does not process
            a payment.
          </p>
          <Button
            className="mt-4 w-full"
            disabled={recorded}
            onClick={() => setConfirm(true)}
          >
            {recorded ? "Payment recorded locally" : "Record payment"}
          </Button>
        </WorkspaceCard>
      </div>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Record payment?"
        consequence="Only local mock state changes."
        confirmLabel="Confirm"
        onConfirm={() => {
          setRecorded(true);
          setConfirm(false);
        }}
      />
    </>
  );
}
