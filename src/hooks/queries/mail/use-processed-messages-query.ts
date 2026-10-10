"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";
import type { ProcessedMessageListParams } from "@/dto/mail/mail.dto";

export function useProcessedMessagesQuery(
  params: ProcessedMessageListParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: mailKeys.messages(params),
    queryFn: () => mailService.listProcessedMessages(params),
    enabled: options?.enabled ?? true,
  });
}
