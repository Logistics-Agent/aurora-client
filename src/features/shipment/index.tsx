import { CreateShipmentPage as CreateShipmentComposition } from "./create-shipment";
import { ImportShipmentsPage as ImportShipmentsComposition } from "./import-shipments";
import { ShipmentDetailPage as ShipmentDetailComposition } from "./shipment-detail";
import { ShipmentsPage as ShipmentsComposition } from "./shipments";

export function ShipmentsPage() {
  return <ShipmentsComposition />;
}

export function ShipmentDetailPage({ shipmentId }: { shipmentId: string }) {
  return <ShipmentDetailComposition shipmentId={shipmentId} />;
}

export function CreateShipmentPage() {
  return <CreateShipmentComposition />;
}

export function ImportShipmentsPage() {
  return <ImportShipmentsComposition />;
}
