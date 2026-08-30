import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { CONTROLLERS } from "@/configs/api";
import {
  parseDeviceResponseDto,
  parseNotificationListResponseDto,
  parseUnreadNotificationCountResponseDto,
  type DeviceResponse,
  type NormalizedNotificationListParams,
  type NotificationListParams,
  type NotificationListResponse,
  type RegisterDeviceRequest,
} from "@/dto/notifications/notification.dto";

export const DEFAULT_NOTIFICATION_LIST_PARAMS: NormalizedNotificationListParams =
  {
    page: 1,
    pageSize: 20,
    unreadOnly: false,
  };

export function normalizeNotificationListParams(
  params: NotificationListParams = {},
): NormalizedNotificationListParams {
  return {
    page: params.page ?? DEFAULT_NOTIFICATION_LIST_PARAMS.page,
    pageSize: params.pageSize ?? DEFAULT_NOTIFICATION_LIST_PARAMS.pageSize,
    unreadOnly:
      params.unreadOnly ?? DEFAULT_NOTIFICATION_LIST_PARAMS.unreadOnly,
  };
}

function parseResponse<T>(
  response: unknown,
  parser: (value: unknown) => T,
): T {
  try {
    return parser(response);
  } catch (error) {
    throw new ApiError({
      message: "Notification service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const notificationService = {
  getNotifications: async (
    params: NotificationListParams = {},
  ): Promise<NotificationListResponse> => {
    const response = await api.get<unknown>(
      CONTROLLERS.notifications,
      { params: normalizeNotificationListParams(params) },
    );
    return parseResponse(response, parseNotificationListResponseDto);
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    const response = await api.get<unknown>(
      CONTROLLERS.notificationUnreadCount,
    );
    return parseResponse(response, parseUnreadNotificationCountResponseDto)
      .count;
  },

  registerNotificationDevice: async (
    input: RegisterDeviceRequest,
  ): Promise<DeviceResponse> => {
    const response = await api.post<unknown>(
      CONTROLLERS.notificationDevices,
      input,
    );
    return parseResponse(response, parseDeviceResponseDto);
  },

  removeNotificationDevice: async (id: string): Promise<void> => {
    await api.delete(
      `${CONTROLLERS.notificationDevices}/${encodeURIComponent(id)}`,
    );
  },

  subscribeToShipment: async (shipmentId: string): Promise<void> => {
    await api.post(
      `${CONTROLLERS.notifications}/subscriptions/shipments/${encodeURIComponent(shipmentId)}`,
    );
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await api.patch(
      `${CONTROLLERS.notifications}/${encodeURIComponent(id)}/read`,
    );
  },

  markAllNotificationsRead: async (): Promise<number> => {
    const response = await api.patch<unknown>(
      CONTROLLERS.notificationReadAll,
    );
    return parseResponse(response, parseUnreadNotificationCountResponseDto)
      .count;
  },
};
