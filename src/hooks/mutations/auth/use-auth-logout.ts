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
      try {
        await disable();
      } catch {
        // Best-effort device notification cleanup
      }

      await authService.logout();
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authKeys.currentUser() });
      queryClient.clear();
      router.push("/login");
    },
  });
}
