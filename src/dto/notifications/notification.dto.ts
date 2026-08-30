import { z } from "zod";

export type NotificationDto = {
  id: string;
  eventType: string;
  channel: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  shipmentId: string | null;
  shipmentNumber: string | null;
  actionUrl: string | null;
};

export type NotificationRecord = NotificationDto;

export type NotificationListParams = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

export type NormalizedNotificationListParams = {
  page: number;
  pageSize: number;
  unreadOnly: boolean;
};

export type NotificationListResponseDto = {
  notifications: NotificationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type NotificationListResponse = NotificationListResponseDto;

export type RegisterNotificationDeviceDto = {
  token: string;
  platform: "Web";
  appVersion: string;
};

export type RegisterDeviceRequest = RegisterNotificationDeviceDto;

export type DeviceResponseDto = {
  id: string;
  platform: string;
  isActive: boolean;
};

export type DeviceResponse = DeviceResponseDto;

export type UnreadNotificationCountResponseDto = {
  count: number;
};

const nullableStringDtoValidator = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().nullable(),
);

const validDateStringDtoValidator = z
  .string()
  .min(1)
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Expected a valid notification timestamp",
  );

function preprocessTimestampDto(
  value: unknown,
  context: z.RefinementCtx,
): unknown {
  if (value === null || value === "") return null;
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const timestamp = value as Record<string, unknown>;
    const seconds = Number(timestamp.seconds);
    const nanos = Number(timestamp.nanos ?? 0);

    if (
      Number.isFinite(seconds) &&
      Number.isFinite(nanos) &&
      Number.isInteger(nanos)
    ) {
      return new Date(seconds * 1000 + nanos / 1_000_000).toISOString();
    }
  }

  context.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Expected an ISO or protobuf notification timestamp",
  });
  return z.NEVER;
}

const notificationTimestampDtoValidator = z.preprocess(
  preprocessTimestampDto,
  validDateStringDtoValidator,
);

const nullableNotificationTimestampDtoValidator = z.preprocess(
  preprocessTimestampDto,
  validDateStringDtoValidator.nullable(),
);

const notificationDtoValidator = z.object({
  id: z.string().min(1),
  eventType: z.string().min(1),
  channel: z.string().min(1),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: notificationTimestampDtoValidator,
  readAt: nullableNotificationTimestampDtoValidator,
  shipmentId: nullableStringDtoValidator,
  shipmentNumber: nullableStringDtoValidator,
  actionUrl: nullableStringDtoValidator,
});

const notificationListResponseDtoValidator = z.object({
  notifications: z.array(notificationDtoValidator),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

const deviceResponseDtoValidator = z.object({
  id: z.string().min(1),
  platform: z.string().min(1),
  isActive: z.boolean(),
});

const unreadNotificationCountResponseDtoValidator = z.object({
  count: z.number().int().nonnegative(),
});

export function parseNotificationListResponseDto(
  value: unknown,
): NotificationListResponseDto {
  return notificationListResponseDtoValidator.parse(value);
}

export function parseDeviceResponseDto(value: unknown): DeviceResponseDto {
  return deviceResponseDtoValidator.parse(value);
}

export function parseUnreadNotificationCountResponseDto(
  value: unknown,
): UnreadNotificationCountResponseDto {
  return unreadNotificationCountResponseDtoValidator.parse(value);
}
