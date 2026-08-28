import Link from "next/link";
import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ShipmentTable } from "../components/shipment-table";

export function ShipmentsPage() {
  return (
    <>
      <PageHeader
        title="Shipments"
        description="Shipment-centric operations with exceptions first."
        actions={
          <Button asChild>
            <Link href="/shipments/new">Create shipment</Link>
          </Button>
        }
      />
      <WorkspaceCard>
        <ShipmentTable />
      </WorkspaceCard>
    </>
  );
}
