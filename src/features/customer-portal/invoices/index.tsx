"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { customerInvoiceMocks } from "../mock";

export function InvoicesPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const selectedInvoice = customerInvoiceMocks.find(
    ({ id }) => id === selectedId,
  );

  return (
    <>
      <CustomerPageHeading
        title="Invoices"
        description="View invoices for shipments in your organization."
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          {customerInvoiceMocks.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col gap-4 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-primary">
                  <ReceiptText className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{invoice.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    {invoice.shipmentId}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold tabular-nums">
                  {invoice.amount}
                </span>
                <StatusBadge
                  label={invoice.state}
                  intent={invoice.state === "Paid" ? "success" : "warning"}
                />
                <Button
                  variant="outline"
                  onClick={() => setSelectedId(invoice.id)}
                  aria-label={`View invoice ${invoice.id}`}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </section>
        <WorkspaceCard title="Invoice detail">
          {selectedInvoice ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Invoice</p>
                <p className="font-semibold">{selectedInvoice.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-xl font-semibold tabular-nums">
                  {selectedInvoice.amount}
                </p>
              </div>
              <p className="rounded-lg bg-secondary p-3 text-sm">
                {selectedInvoice.due}
              </p>
              <p className="text-xs text-muted-foreground">
                Payment controls are intentionally unavailable in this UI-only
                portal.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an invoice to view customer-safe billing details.
            </p>
          )}
        </WorkspaceCard>
      </div>
    </>
  );
}
