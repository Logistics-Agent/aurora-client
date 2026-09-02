import { describe, expect, it } from "vitest";
import { notificationsKeys } from "./notifications.keys";

describe("notificationsKeys", () => {
  it("builds every notification key from the notifications all key", () => {
    const params = { page: 2, pageSize: 20, unreadOnly: true };

    expect(notificationsKeys.all).toEqual([
      "logistics-control-tower",
      "notifications",
    ]);
    expect(notificationsKeys.lists()).toEqual([
      ...notificationsKeys.all,
      "list",
    ]);
    expect(notificationsKeys.list(params)).toEqual([
      ...notificationsKeys.lists(),
      params,
    ]);
    expect(notificationsKeys.unreadCount()).toEqual([
      ...notificationsKeys.all,
      "unread-count",
    ]);
  });
});
