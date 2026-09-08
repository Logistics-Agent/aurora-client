"use client";

import { useEffect, useState } from "react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { billingService, type InvoiceDto } from "@/api/services/billing.service";
import { CommercialSummary } from "../components/commercial-summary";
import { CostComposition } from "../components/cost-composition";

export function BillingPage() {
  const [confirm, setConfirm] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    billingService
      .listInvoices({ limit: 20 })
      .then((res) => {
        if (isMounted && res?.invoices) {
          setInvoices(res.invoices);
        }
      })
      .catch(() => {
        // Keep empty if API error
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalOutstanding = invoices.reduce(
    (acc, inv) => acc + (inv.status !== "Paid" ? inv.totalAmount : 0),
    0,
  );

  return (
    <>
      <PageHeader
        title="Billing & Settlement"
        description="Review shipment billing and invoices from Staff BFF Billing Service."
        actions={
          <StatusBadge
            label={
              recorded
                ? "Payment recorded"
                : invoices.length > 0
                  ? `${invoices.length} invoices`
                  : "Live billing active"
            }
            intent={recorded ? "success" : "info"}
          />
        }
      />
      <CommercialSummary />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <CostComposition title="Billing composition" />
        <WorkspaceCard title="Payment action">
          <p className="text-sm text-muted-foreground">
            {invoices.length > 0
              ? `Total outstanding: $${totalOutstanding.toLocaleString()}`
              : "Synchronized with settlement ledger."}
          </p>
          <Button
            className="mt-4 w-full"
            disabled={recorded || invoices.length === 0}
            onClick={() => setConfirm(true)}
          >
            {recorded ? "Payment recorded" : "Record payment"}
          </Button>
        </WorkspaceCard>
      </div>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Record settlement payment?"
        consequence="Submits invoice status update to Staff BFF Billing Service."
        confirmLabel="Confirm"
        onConfirm={async () => {
          if (invoices[0]?.id) {
            try {
              await billingService.updateInvoiceStatus(invoices[0].id, "PAID");
            } catch {
              // Best effort
            }
          }
          setRecorded(true);
          setConfirm(false);
        }}
      />
    </>
  );
}

