"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerShipmentMocks } from "../mock";
import type { CustomerShipmentFilter } from "../types";
import { filterCustomerShipments } from "../utils/customer-portal-utils";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { CustomerShipmentCard } from "../components/customer-shipment-card";

const statuses: CustomerShipmentFilter[] = [
  "All",
  "Delayed",
  "In transit",
  "On schedule",
  "Documents ready",
];

export function ShipmentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CustomerShipmentFilter>("All");
  const [selectedId, setSelectedId] = useState<string>();
  const filteredShipments = useMemo(
    () => filterCustomerShipments(customerShipmentMocks, query, status),
    [query, status],
  );
  const selectedShipment = customerShipmentMocks.find(
    (shipment) => shipment.fullId === selectedId,
  );

  return (
    <>
      <CustomerPageHeading
        title="My Shipments"
        description="Track milestones, documents and exceptions for your shipments."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search shipment ID, origin or destination"
            className="h-10 bg-card pl-9"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status</span>
          <select
            aria-label="Filter shipment status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CustomerShipmentFilter)
            }
            className="h-10 rounded-lg border border-border bg-card px-3"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[1.05fr_1.1fr_1fr_0.8fr_0.8fr] bg-secondary px-4 py-3 text-xs font-semibold text-muted-foreground md:grid">
          <span>Shipment</span>
          <span>Route</span>
          <span>Status</span>
          <span>ETA</span>
          <span>Last update</span>
        </div>
        {filteredShipments.map((shipment) => (
          <CustomerShipmentCard
            key={shipment.fullId}
            shipment={shipment}
            selected={selectedId === shipment.fullId}
            onSelect={() => setSelectedId(shipment.fullId)}
          />
        ))}
        {filteredShipments.length === 0 && (
          <EmptyState
            title="No shipments found"
            description="Clear the search or choose another customer-visible status."
          />
        )}
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Viewing {filteredShipments.length} of 12 shipments
        </p>
        {selectedShipment ? (
          <Button asChild>
            <Link href={`/portal/shipments/${selectedShipment.fullId}`}>
              View shipment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button disabled>View shipment</Button>
        )}
      </div>
    </>
  );
}
