import { authKeys } from "./auth.keys";
import { mailKeys } from "./mail.keys";
import { notificationsKeys } from "./notifications.keys";
import { rootQueryKeys } from "./root.keys";
import { trackingKeys } from "./tracking.keys";

export { authKeys } from "./auth.keys";
export { mailKeys } from "./mail.keys";
export { notificationsKeys } from "./notifications.keys";
export { rootQueryKeys } from "./root.keys";
export { trackingKeys } from "./tracking.keys";

/**
 * Compatibility facade for callers that still import the aggregate key tree.
 * New code should import the domain key factory directly.
 */
export const queryKeys = {
  all: rootQueryKeys.all,
  auth: authKeys,
  notifications: notificationsKeys,
  mail: mailKeys,
  tracking: trackingKeys,
} as const;
