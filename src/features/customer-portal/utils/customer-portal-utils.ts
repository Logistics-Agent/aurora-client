import type {
  CustomerNotification,
  CustomerPreference,
  CustomerQuote,
  CustomerShipment,
  CustomerShipmentFilter,
} from "../types";

export function filterCustomerShipments(
  shipments: CustomerShipment[],
  query: string,
  status: CustomerShipmentFilter,
): CustomerShipment[] {
  const normalizedQuery = query.trim().toLowerCase();
  return shipments.filter((shipment) => {
    const matchesQuery = [
      shipment.id,
      shipment.fullId,
      shipment.origin,
      shipment.destination,
      shipment.route,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesStatus = status === "All" || shipment.status === status;
    return matchesQuery && matchesStatus;
  });
}

export function confirmCustomerQuote(quote: CustomerQuote): CustomerQuote {
  return { ...quote, state: "Confirmed" };
}

export function markCustomerNotificationRead(
  notification: CustomerNotification,
): CustomerNotification {
  return { ...notification, read: true };
}

export function toggleCustomerPreference(
  preference: CustomerPreference,
  channel: "inApp" | "email",
): CustomerPreference {
  return { ...preference, [channel]: !preference[channel] };
}
