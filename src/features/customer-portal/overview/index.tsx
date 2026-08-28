import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { customerKpis, customerShipmentMocks } from "../mock";
import { CustomerPageHeading } from "../components/customer-page-heading";

const kpiValueStyles = {
  primary: "text-primary",
  success: "text-emerald-600",
  warning: "text-amber-600",
  ai: "text-violet-600",
} as const;

export function OverviewPage() {
  return (
    <>
      <CustomerPageHeading
        title="Good morning, Acme Trading"
        description="Your supply chain at a glance"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {customerKpis.map((kpi) => (
          <section
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-4 shadow-[0_2px_8px_rgba(16,32,51,0.03)]"
          >
            <p className="text-sm font-semibold">{kpi.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{kpi.meta}</p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums ${kpiValueStyles[kpi.tone]}`}
            >
              {kpi.value}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <WorkspaceCard title="Shipment activity">
          <p className="-mt-3 mb-3 text-xs text-muted-foreground">
            Your latest customer-visible milestones
          </p>
          <div className="divide-y divide-border">
            {customerShipmentMocks.slice(0, 3).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/portal/shipments/${shipment.fullId}`}
                className="flex items-center justify-between gap-3 py-4 first:pt-1 hover:text-primary"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {shipment.id} · {shipment.route}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shipment.status === "Delayed"
                      ? `ETA ${shipment.eta.toLowerCase()}`
                      : shipment.summary}
                  </p>
                </div>
                <StatusBadge
                  label={shipment.status}
                  intent={shipment.status === "Delayed" ? "warning" : "success"}
                />
              </Link>
            ))}
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="Attention required">
          <p className="-mt-3 text-xs text-muted-foreground">
            Items awaiting your action
          </p>
          <div className="mt-4 rounded-lg bg-secondary p-4">
            <p className="text-sm font-semibold">1 document needs review</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Commercial Invoice · SHP-128
            </p>
            <Button asChild className="mt-4">
              <Link href="/portal/documents">
                Review document
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Customer-safe data only
          </p>
        </WorkspaceCard>
      </div>
    </>
  );
}
