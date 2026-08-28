import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LogisticsMap, StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  customerMilestoneMocks,
  customerTrackingMapMock,
  customerTrackingTelemetry,
} from "../mock";
import { CustomerPageHeading } from "../components/customer-page-heading";

const milestoneDots = {
  complete: "bg-emerald-500",
  attention: "bg-amber-500",
  current: "bg-primary",
} as const;

export function TrackingPage({
  shipmentId = "SHP-2026-00128",
}: {
  shipmentId?: string;
}) {
  const displayId = shipmentId === "SHP-2026-00128" ? "SHP-128" : shipmentId;

  return (
    <>
      <CustomerPageHeading
        title={`Track ${displayId}`}
        description="Ho Chi Minh City → Singapore · Customer-visible shipment status"
        actions={
          <Button asChild variant="outline">
            <Link href={`/portal/shipments/${shipmentId}`}>
              <ArrowLeft className="size-4" />
              Shipment details
            </Link>
          </Button>
        }
      />
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge
          label={customerTrackingTelemetry.status}
          intent="warning"
        />
        <span className="text-xs text-muted-foreground">
          Last updated {customerTrackingTelemetry.lastUpdate}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <WorkspaceCard title="Shipment map">
          <p className="-mt-3 mb-3 text-xs text-muted-foreground">
            Current carrier position unavailable in this customer view
          </p>
          <LogisticsMap
            className="min-h-[260px] sm:min-h-[360px]"
            routes={customerTrackingMapMock.routes}
            markers={customerTrackingMapMock.markers}
          />
        </WorkspaceCard>

        <WorkspaceCard title="Milestones">
          <p className="-mt-3 mb-5 text-xs text-muted-foreground">
            Last updated {customerTrackingTelemetry.lastUpdate}
          </p>
          <div className="space-y-6">
            {customerMilestoneMocks.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${milestoneDots[milestone.state]}`}
                />
                <div>
                  <p className="text-sm font-semibold">{milestone.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {milestone.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </WorkspaceCard>
      </div>

      <WorkspaceCard className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Port congestion advisory</p>
            <p className="text-sm text-muted-foreground">
              {customerTrackingTelemetry.advisory}
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Customer-visible milestones only
          </p>
        </div>
      </WorkspaceCard>
    </>
  );
}
