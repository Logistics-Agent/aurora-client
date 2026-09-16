"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";
import type { MailListParams } from "@/dto/mail/mail.dto";

export function useMailThreadsQuery(params: MailListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mailKeys.threadList(params),
    queryFn: () => mailService.listThreads(params),
    enabled: options?.enabled ?? true,
  });
}
