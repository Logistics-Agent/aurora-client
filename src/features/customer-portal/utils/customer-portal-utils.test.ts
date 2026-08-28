import { describe, expect, it } from "vitest";
import type {
  CustomerNotification,
  CustomerPreference,
  CustomerQuote,
  CustomerShipment,
} from "../types";
import {
  confirmCustomerQuote,
  filterCustomerShipments,
  markCustomerNotificationRead,
  toggleCustomerPreference,
} from "./customer-portal-utils";

const shipments: CustomerShipment[] = [
  {
    id: "SHP-128",
    fullId: "SHP-2026-00128",
    origin: "Ho Chi Minh City",
    destination: "Singapore",
    route: "HCM → Singapore",
    status: "Delayed",
    eta: "Today 14:35",
    lastUpdate: "18 min ago",
    summary: "Port congestion advisory",
  },
  {
    id: "SHP-124",
    fullId: "SHP-2026-00124",
    origin: "Da Nang",
    destination: "Busan",
    route: "Da Nang → Busan",
    status: "In transit",
    eta: "26 Aug",
    lastUpdate: "32 min ago",
    summary: "On schedule",
  },
];

describe("customer portal helpers", () => {
  it("filters shipments by ID, origin or destination", () => {
    expect(filterCustomerShipments(shipments, "128", "All")).toEqual([
      shipments[0],
    ]);
    expect(filterCustomerShipments(shipments, "da nang", "All")).toEqual([
      shipments[1],
    ]);
    expect(filterCustomerShipments(shipments, "singapore", "All")).toEqual([
      shipments[0],
    ]);
  });

  it("combines text and status filters", () => {
    expect(filterCustomerShipments(shipments, "", "Delayed")).toEqual([
      shipments[0],
    ]);
    expect(filterCustomerShipments(shipments, "HCM", "In transit")).toEqual([]);
  });

  it("transitions customer actions without mutating fixtures", () => {
    const quote: CustomerQuote = {
      id: "Q-2026-014",
      lane: "HCM → Singapore",
      amount: "USD 4,280",
      validUntil: "31 Aug",
      state: "Awaiting confirmation",
    };
    const notification: CustomerNotification = {
      id: "NTF-1",
      title: "ETA updated",
      detail: "Today 12:03",
      category: "Shipment",
      group: "Today",
      read: false,
    };
    const preference: CustomerPreference = {
      event: "Shipment milestones",
      inApp: true,
      email: false,
    };

    expect(confirmCustomerQuote(quote)).toEqual({
      ...quote,
      state: "Confirmed",
    });
    expect(quote.state).toBe("Awaiting confirmation");
    expect(markCustomerNotificationRead(notification).read).toBe(true);
    expect(notification.read).toBe(false);
    expect(toggleCustomerPreference(preference, "email")).toEqual({
      ...preference,
      email: true,
    });
    expect(preference.email).toBe(false);
  });
});
