"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";

export function useProcessedMessageQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: id ? mailKeys.message(id) : ([...mailKeys.messages(), "selected"] as const),
    queryFn: () => {
      if (!id) throw new Error("A processed message ID is required.");
      return mailService.getProcessedMessage(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
