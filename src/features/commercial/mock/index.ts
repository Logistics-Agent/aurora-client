// UI-only fixture until backend integration phase.
export type CommercialLine = {
  item: string;
  amount: string;
  state: "Normal" | "At risk" | "Verified";
};
export type CarrierOffer = {
  id: string;
  carrier: string;
  amount: string;
  state: "Recommended" | "Pending" | "Declined";
};

export const commercialLineMocks: CommercialLine[] = [
  { item: "Ocean freight", amount: "$12,400", state: "Normal" },
  { item: "Port handling", amount: "$3,240", state: "At risk" },
  { item: "Insurance & fees", amount: "$2,780", state: "Verified" },
];

export const carrierOfferMocks: CarrierOffer[] = [
  {
    id: "OFR-01",
    carrier: "Pacific Meridian",
    amount: "$17,950",
    state: "Recommended",
  },
  {
    id: "OFR-02",
    carrier: "Eastwind Lines",
    amount: "$18,420",
    state: "Pending",
  },
];

export function acceptOffer(offer: CarrierOffer): CarrierOffer {
  return { ...offer, state: "Recommended" };
}
