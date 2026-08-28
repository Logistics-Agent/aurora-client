import type { ComponentType } from "react";
import { AssistantPage } from "./assistant";
import { DocumentsPage } from "./documents";
import { InvoicesPage } from "./invoices";
import { NotificationsPage } from "./notifications";
import { OverviewPage } from "./overview";
import { QuotesPage } from "./quotes";
import { ShipmentDetailPage } from "./shipment-detail";
import { ShipmentsPage } from "./shipments";
import { TrackingPage } from "./tracking";

export type CustomerKind =
  | "customer-overview"
  | "customer-shipments"
  | "customer-detail"
  | "customer-tracking"
  | "customer-documents"
  | "customer-quotes"
  | "customer-invoices"
  | "customer-assistant"
  | "customer-notifications";

const pageByKind: Record<CustomerKind, ComponentType> = {
  "customer-overview": OverviewPage,
  "customer-shipments": ShipmentsPage,
  "customer-detail": ShipmentDetailPage,
  "customer-tracking": TrackingPage,
  "customer-documents": DocumentsPage,
  "customer-quotes": QuotesPage,
  "customer-invoices": InvoicesPage,
  "customer-assistant": AssistantPage,
  "customer-notifications": NotificationsPage,
};

export function CustomerPortalPage({
  kind = "customer-overview",
  shipmentId,
}: {
  kind?: CustomerKind;
  shipmentId?: string;
}) {
  if (kind === "customer-detail") {
    return <ShipmentDetailPage shipmentId={shipmentId} />;
  }

  if (kind === "customer-tracking") {
    return <TrackingPage shipmentId={shipmentId} />;
  }

  const Page = pageByKind[kind];
  return <Page />;
}
