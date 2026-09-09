# 05 — Mail và negotiation

Dependencies: F; N01 phụ thuộc mail slice + BE-07. Sources: `src/dotnet/BFF/Staff.Bff/Controllers/{Mail,Negotiations}Controller.cs`; `src/dotnet/BFF/BuildingBlocks.BFF/Mail/Models/MailDtos.cs`; docs mail THREAD_ASSIGNMENT/NEGOTIATION_FLOW. Domain concurrency vẫn phải trace handler khi implement, không suy expectedVersion từ mock.

## Contract hiện có

- `/api/v1/mail/threads`: mailboxId/pageSize/pageToken/scope/status/search; `{threads,nextPageToken,hasMore}`. Các scope UNASSIGNED/MY_WORK/ALL cần kiểm tra handler validation và capability; không gửi `department` mặc định từ FE.
- GET threads/{id}, POST claim (không body expectedVersion), POST reassign `{targetUserId,reason}`, POST unassign `{reason}`, GET assignment-history.
- Thread DTO có messages/drafts/participants/primaryAssigneeUserId/status/priority; không expose version trong BFF DTO audit. Conflict từ BE phải refetch, không fabricate version=1.
- POST/GET drafts và GET drafts/{id}. Create `{mailboxId,assignedStaffId,subject,body,sourceType,sourceId,idempotencyKey,to,threadId,replyToMessageId}`; response draftId/draftRootId/revisionNumber/isLatestRevision/contentHash và link fields.
- POST messages/outbound `{senderAddress,recipientAddresses,subject,bodyText,bodyHtml,attachments,idempotencyKey,draftRootId,threadId,replyToMessageId}`; trả processedMessageId/stalwartQueueId/submittedAt. **Accepted/submitted không đồng nghĩa delivered.**
- Processed messages/quarantine list dùng cursor; release là server action có permission, không expose admin purge/provisioning.
- POST `/api/v1/negotiations/{negotiationId}/mail-draft` `{mailboxId,idempotencyKey}` lấy persisted suggestion, gắn source/thread/reply-to; mặc định BE idempotency `neg-draft-{tenantId}-{negotiationId}`. Không tự sinh AI rồi gửi mail.

## M01 — Typed HTTP contract

Sửa `src/api/services/mail.service.ts`, `src/configs/api.ts`; tạo `src/dto/mail/mail.dto.ts`, `src/api/query-keys/mail.keys.ts`, `src/api/services/mail.service.test.ts`.

Acceptance: DTO phản ánh BFF fields, cursor không giả page-number, attachment size/type theo validator BE; idempotency key giữ nguyên cho cùng một lần send retry. Verify request body mapping và 403/409/quarantine errors.

## M02 — Bỏ fake-success repository

Sửa `src/features/mail/index.tsx`, `src/features/mail/services/mail-api-repository.ts`, `src/features/mail/hooks/use-mail-workspace.ts`; tạo `src/hooks/queries/mail/use-mail-threads-query.ts`, `src/hooks/queries/mail/use-mail-thread-query.ts`.

Không import interface nghiệp vụ từ mock repository; đưa view contract về nearest feature types ở task riêng nếu cần. Repository tạm giữ adapter thuần, không một cache server thứ hai. Dùng currentUser.userId/name; bỏ anonymous authenticated fallback và cast role any. List/detail/history lấy response thật; không fabricate ops-sea, sender, timestamp, assignment history.

Acceptance: backend ngắt thì UI báo unavailable, không tự chuyển sang inbox giả. Verify reload/deep-link/thread selection; follow-up tests ở M03.

## M03 — Claim/draft/send và action không được BE hỗ trợ

Tạo `src/hooks/mutations/mail/use-mail-mutations.ts`, `src/hooks/mutations/mail/use-mail-mutations.test.tsx`, `src/features/mail/mail-api-flow.test.tsx`; sửa workspace hook và API repository ở M02.

Claim/reassign/unassign dùng response authoritative; 409 refetch thread và giữ người thắng. Composer giữ text khi save/send lỗi; pending chặn double-click; optimistic UI nếu có phải rollback. Draft editing/revision phải theo handler thực tế; POST create không tự được coi là update cùng draft. Priority/resolve chưa có action trong Staff controller: disable với lý do hoặc BE-07 thêm mutation trước, không local-only.

Mailbox và assignee phải lấy từ resource user được quyền dùng. Nếu chưa có Staff lookup: BE-07 bổ sung projection scoped, không lấy Admin staff/mailbox APIs để lấp chỗ trống. Sender address/assignee quyền do BE enforce.

Acceptance: hai staff claim cùng thread chỉ một người thành công; người không sở hữu không gửi trái phép; send retry không gửi hai email; queue accepted khác delivery status. Verify service/hook tests và mail relay sandbox với người nhận test đã cho phép.

## N01 — Negotiation → human-reviewed mail draft

Tạo `src/api/services/negotiations.service.ts`, `src/dto/negotiations/negotiation.dto.ts`, `src/api/query-keys/negotiations.keys.ts`, `src/hooks/mutations/negotiations/use-negotiation-mail-draft.ts`, `src/api/services/negotiations.service.test.ts`.

N02 sau BE-07: sửa `src/features/commercial/negotiations/index.tsx`, `src/features/commercial/negotiation-detail/index.tsx`, `src/features/commercial/components/negotiation-offers.tsx`; tạo `src/hooks/queries/negotiations/use-negotiation-query.ts`, `src/features/commercial/negotiation-detail/negotiation-mail-flow.test.tsx`.

List/detail/submit offer RPC tồn tại không có nghĩa HTTP đã expose; chốt endpoints trong BE-07 trước nối UI. Từ session thật nhận shipmentId/sourceThreadId/sourceMessageId, create draft rồi điều hướng mail composer bằng draftId thật. Không import UI feature mail vào commercial: dùng navigation/deep-link và data contract. Không tự gửi outbound sau AI ACCEPT/COUNTER_OFFER; staff xem và bấm Send.

Acceptance: suggestion missing/recipient unresolved có trạng thái lỗi, không dùng mock address; double create trả draft existing khi BE hỗ trợ; reload session/draft giữ linkage. Verify toàn chuỗi inbound → persisted suggestion → draft → human send → processed message; AI timeout không tự tạo câu trả lời thành công.
