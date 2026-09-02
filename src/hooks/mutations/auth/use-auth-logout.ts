"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/api/services/auth.service";
import { authKeys } from "@/api/query-keys/auth.keys";
import { useFcmNotification } from "@/features/notifications/hooks/use-fcm-notification";

export function useAuthLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { disable } = useFcmNotification();

  return useMutation({
    mutationFn: async () => {
      const deviceDisabled = await disable();
      if (!deviceDisabled) {
        throw new Error("Unable to disable browser notifications.");
      }

      await authService.logout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.currentUser() });
      router.push("/login");
    },
  });
}
