"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";

export function useMailThreadQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mailKeys.thread(id ?? ""),
    queryFn: () => mailService.getThread(id ?? ""),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
