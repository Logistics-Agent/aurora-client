import Link from "next/link";
import { ArrowRight, CircleHelp, FileText } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { customerDocumentMocks, customerTimelineMocks } from "../mock";
import { CustomerPageHeading } from "../components/customer-page-heading";

const timelineDots = {
  complete: "bg-emerald-500",
  attention: "bg-amber-500",
  current: "bg-primary",
} as const;

export function ShipmentDetailPage({
  shipmentId = "SHP-2026-00128",
}: {
  shipmentId?: string;
}) {
  const displayId = shipmentId === "SHP-2026-00128" ? "SHP-128" : shipmentId;

  return (
    <>
      <CustomerPageHeading
        title={displayId}
        description="Ho Chi Minh City → Singapore · Ocean freight"
        actions={
          <Button asChild variant="outline">
            <Link href={`/portal/shipments/${shipmentId}/tracking`}>
              View tracking
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <div className="-mt-4 mb-6">
        <StatusBadge label="Delayed · customer notified" intent="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <WorkspaceCard title="Shipment timeline">
          <p className="-mt-3 mb-4 text-xs text-muted-foreground">
            Latest customer-visible progress
          </p>
          <div className="space-y-4">
            {customerTimelineMocks.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${timelineDots[event.state]}`}
                />
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="Shipment details">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Reference</dt>
              <dd className="font-medium">Reference: PO-2026-118</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Carrier</dt>
                <dd className="font-medium">ONE</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">ETA</dt>
                <dd className="font-medium">Today, 14:35</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Container</dt>
              <dd className="font-medium">TGHU 624 091 8</dd>
            </div>
          </dl>
        </WorkspaceCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkspaceCard title="Documents">
          <p className="-mt-3 mb-3 text-xs text-muted-foreground">
            3 documents available
          </p>
          <div className="divide-y divide-border">
            {customerDocumentMocks.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {document.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.state}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/portal/documents">Open {document.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="Customer support">
          <div className="flex items-start gap-3">
            <CircleHelp className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-semibold">Need help with this shipment?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your logistics team has been notified about the delay.
              </p>
            </div>
          </div>
          <Button asChild className="mt-5">
            <Link href="/portal/assistant">Ask AI Assistant</Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            AI answers cite shipment events and never make changes without your
            approval.
          </p>
        </WorkspaceCard>
      </div>
    </>
  );
}
