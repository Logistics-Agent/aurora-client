export type FcmPayload = {
  notificationId: string;
  type: string;
  shipmentId: string | null;
  actionUrl: string | null;
  title: string;
  body: string;
};

export type FcmRegistrationState =
  | "disabled"
  | "unsupported"
  | "idle"
  | "requesting"
  | "registering"
  | "enabled"
  | "denied"
  | "error";
