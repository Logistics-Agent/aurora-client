// UI-only fixture until backend integration phase.
export type EmailMock = {
  id: string;
  subject: string;
  sender: string;
  extractedAction: string;
  state: "Needs review" | "Approved";
};

export const emailMocks: EmailMock[] = [
  {
    id: "EML-01",
    subject: "Change delivery window for SHP-2026-00127",
    sender: "carrier@eastwind.example",
    extractedAction: "Move ETA to 15 Jun · 09:20",
    state: "Needs review",
  },
  {
    id: "EML-02",
    subject: "Booking confirmation SHP-2026-00128",
    sender: "ops@pacific.example",
    extractedAction: "Confirm vessel booking",
    state: "Approved",
  },
];

export function approveEmail(email: EmailMock): EmailMock {
  return { ...email, state: "Approved" };
}
