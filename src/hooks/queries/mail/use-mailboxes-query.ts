"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";
import type { MailboxListParams } from "@/dto/mail/mail.dto";

export function useMailboxesQuery(params: MailboxListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mailKeys.mailboxes(params),
    queryFn: () => mailService.listMailboxes(params),
    enabled: options?.enabled ?? true,
  });
}
