"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { customerQuoteMocks } from "../mock";
import { confirmCustomerQuote } from "../utils/customer-portal-utils";

export function QuotesPage() {
  const [quotes, setQuotes] = useState(customerQuoteMocks);

  return (
    <>
      <CustomerPageHeading
        title="Quotes"
        description="Review and confirm quotes shared with your organization."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {quotes.map((quote) => (
          <WorkspaceCard key={quote.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {quote.id}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{quote.lane}</h2>
              </div>
              <StatusBadge
                label={quote.state}
                intent={quote.state === "Confirmed" ? "success" : "warning"}
              />
            </div>
            <div className="my-5 grid grid-cols-2 gap-3 rounded-lg bg-secondary p-4">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {quote.amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valid until</p>
                <p className="mt-1 font-medium">{quote.validUntil}</p>
              </div>
            </div>
            {quote.state === "Awaiting confirmation" ? (
              <Button
                onClick={() =>
                  setQuotes((current) =>
                    current.map((item) =>
                      item.id === quote.id ? confirmCustomerQuote(item) : item,
                    ),
                  )
                }
                aria-label={`Confirm quote ${quote.id}`}
              >
                Confirm quote
              </Button>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="size-4" /> Customer confirmation
                recorded locally
              </p>
            )}
          </WorkspaceCard>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Confirmation is a UI-only prototype and does not create a commercial
        transaction.
      </p>
    </>
  );
}
