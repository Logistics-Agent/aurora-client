import { create } from "zustand";
import { customerNotificationMocks, customerPreferenceMocks } from "../mock";
import type { CustomerNotification, CustomerPreference } from "../types";
import {
  markCustomerNotificationRead,
  toggleCustomerPreference,
} from "../utils/customer-portal-utils";

type CustomerPortalState = {
  questionAsked: boolean;
  notifications: CustomerNotification[];
  preferences: CustomerPreference[];
  askQuestion: () => void;
  markNotificationRead: (id: string) => void;
  togglePreference: (event: string, channel: "inApp" | "email") => void;
};

export const useCustomerPortalStore = create<CustomerPortalState>((set) => ({
  questionAsked: false,
  notifications: customerNotificationMocks,
  preferences: customerPreferenceMocks,
  askQuestion: () => set({ questionAsked: true }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? markCustomerNotificationRead(notification)
          : notification,
      ),
    })),
  togglePreference: (event, channel) =>
    set((state) => ({
      preferences: state.preferences.map((preference) =>
        preference.event === event
          ? toggleCustomerPreference(preference, channel)
          : preference,
      ),
    })),
}));
