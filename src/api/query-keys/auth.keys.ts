import { rootQueryKeys } from "./root.keys";

export const authKeys = {
  all: [...rootQueryKeys.all, "auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
} as const;
