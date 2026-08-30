"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/api/services/auth.service";
import { authKeys } from "@/api/query-keys/auth.keys";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 60_000,
  });
}
