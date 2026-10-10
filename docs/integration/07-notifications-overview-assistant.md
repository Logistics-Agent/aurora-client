# 07 — Notifications, realtime, overview, assistant và settings

Dependencies: F; các projection phụ thuộc feature tương ứng. **Notification dùng Firebase Cloud Messaging (FCM), không dùng WebSocket/Socket.IO.** X01 không phụ thuộc RealtimeHub hay BE-03/04. Nếu người dùng từ chối push, notification center vẫn đọc dữ liệu qua HTTP.

Luồng notification: business event → backend Notification service lưu thông báo và gửi Firebase FCM → client nhận foreground hoặc service worker nhận background → mở đúng màn hình và refetch HTTP. HTTP API là nguồn danh sách, unread count và read/read-all; FCM là kênh push, không thay thế persistence.

## X01 — Giữ notification data layer, nối invalidation

Sửa `src/features/notifications/hooks/use-fcm-notification.ts`, `src/features/notifications/utils/fcm-payload.ts`, `src/features/notifications/popup/components/notification-fcm-bootstrap.tsx`; tạo `src/lib/query-invalidation.ts`, `src/lib/query-invalidation.test.ts`.

Reuse `src/api/services/notifications.service.ts`, notification DTO/keys/root hooks hiện có. HTTP hiện expose register/remove device, subscribe shipment, list, unread count, PATCH read/read-all. FCM payload validate trước dùng; deep-link phải local/allowlist và có permission. Event chỉ là hint invalidate authoritative query, không ghi dữ liệu untrusted trực tiếp vào mọi cache.

Acceptance: popup/list/unread không đếm hai lần, permission denied/unsupported không chặn app hoặc logout. Verify existing notification tests + invalidation tests; không gửi push thật tới user ngoài test scope.

Kiểm chứng thêm vòng đời FCM token/register device/remove device theo session; foreground popup, background service worker, click deep-link, token hết hiệu lực và dedupe cùng notification. Reuse Firebase bootstrap/service worker hiện có, không tạo thêm kênh notification Socket.IO song song.

## X02 — Realtime nghiệp vụ tùy chọn (deferred, không thuộc notification)

Với phạm vi bản đồ chỉ có điểm đầu/cuối đã chốt, X02 không cần triển khai. Không thêm dependency/socket provider chỉ để phục vụ bản đồ; phần dưới chỉ là ghi chú cho nhu cầu streaming nếu được yêu cầu riêng sau này.

Tạo `src/lib/realtime-client.ts`, `src/dto/realtime/realtime.dto.ts`, `src/providers/realtime-provider.tsx`, `src/lib/realtime-client.test.ts`; sửa `src/providers/app-provider.tsx`.

Không triển khai X02 trong slice notification. Chỉ xem xét riêng nếu GPS hoặc dữ liệu nghiệp vụ cần streaming và được chốt scope; HTTP polling vẫn dùng được. Khi đó phải hoàn tất BE-03/04 trước, không copy HttpOnly JWT vào JS/localStorage và không dùng secret hardcode của guard hiện tại.

Gateway hiện tự join tenant/user khi handshake; shipment dùng `join_shipment`/`leave_shipment`, không có `join:tenant`/`join:user` như cookbook. Ack msgId cần ownership check BE; reconnect refetch, resubscribe shipment hiện chọn, dedupe events; logout disconnect. Event names phải lấy từ bridge mapping đã sửa/test, không đoán GPS_POSITION_UPDATED từ docs.

Acceptance nếu mở X02: thiếu token bị reject, sai tenant không join/read room; offline rồi reconnect không apply event nghiệp vụ trùng, state converge qua HTTP. Không phát notification toast từ transport này; notification push vẫn chỉ dùng FCM.

## O01 — Overview đúng dữ liệu

Sửa `src/api/services/dashboard.service.ts`, `src/features/command-center/index.tsx`; tạo `src/dto/dashboard/dashboard.dto.ts`, `src/hooks/queries/dashboard/use-dashboard-query.ts`, `src/features/command-center/command-center.test.tsx`.

Task O01b: tạo `src/api/query-keys/dashboard.keys.ts`, `src/api/services/dashboard.service.test.ts`; sửa `src/configs/api.ts`, `src/features/command-center/index.tsx`.

GET `/api/v1/Dashboard/summary` có route-planning read permission; đọc response tổng hợp đúng nghĩa của BE, không đoán là tất cả metrics logistics. Shipments/alerts/map lấy từ domain queries; bỏ initial counts 142/28/97.4%/3 khi không có dữ liệu. Partial failure hiển thị từng card, không tổng KPI từ trang dữ liệu đầu tiên.

Acceptance: zero thật khác unavailable; resolve alert chỉ giảm số sau server success; filters và timezone nhất quán. Verify mixed success/failure response tests, cùng shipment mới xuất hiện ở list/map/dashboard.

## A01 — Grounded assistant/search

Tạo `src/api/services/assistant.service.ts`, `src/dto/assistant/assistant.dto.ts`, `src/hooks/mutations/assistant/use-assistant-query.ts`, `src/api/services/assistant.service.test.ts`; sửa `src/features/ai-assistant/index.tsx`.

POST `/api/v1/assistant/query`: query, mode, jurisdictionCode, effectiveAt, regulationTypes, categories, topK, minimumScore. Response có answer/regulatoryCitations/knowledgeReferences/conflicts/insufficientEvidence/missingInformation/governance/retrievalTraceId. Không nhét shipmentId vào body khi contract chưa hỗ trợ. Nếu muốn assistant hành động trên shipment, cần extension BE được authorize, không coi free text là command.

Task A02: tạo `src/api/services/search.service.ts`, `src/dto/search/search.dto.ts`, `src/hooks/mutations/search/use-unified-search.ts`, `src/api/services/search.service.test.ts`; sửa `src/features/ai-assistant/index.tsx` để nối evidence search nếu UI cần.

POST `/api/v1/search` là unified evidence search theo SearchController, không mặc định search shipment toàn cục. Hiển thị source/citations, insufficient evidence và governance block/approval. Không canned answer khi quota/AI service lỗi; không tự gửi mail/approve route dựa trên answer.

Acceptance: response khác fixture thì UI đổi theo response, citation source an toàn, 403/412 có trạng thái đúng. Verify no-evidence/conflicting-evidence/governance tests.

## A03 — Conversation persistence (chỉ nếu mở workflow chat)

Tạo `src/api/services/chat.service.ts`, `src/dto/chat/chat.dto.ts`, `src/api/query-keys/chat.keys.ts`, `src/hooks/queries/chat/use-conversation-query.ts`, `src/hooks/mutations/chat/use-send-message.ts`.

Staff BFF expose POST/GET `/api/v1/chat/conversations`, GET `/{id}`, POST `/{id}/messages`, forward tenant/user và actor STAFF. Phải đọc downstream customer-assistant DTO/ownership guards trước implement parser và UI; audit hiện chưa chốt chat payload. Không trộn grounded assistant query với persisted chat như cùng một endpoint. Nếu chưa scope workflow chat thì giữ A03 deferred, không tạo folder/files rỗng.

Settings/auth preferences theo F04. Customer portal và persisted customer assistant thuộc scope bắt buộc tại [13-customer-portal.md](13-customer-portal.md), CP07/CP08; không tạo fake customer identity hoặc reuse STAFF proxy. A03 ở trên là chat staff tùy chọn, không phải lý do defer customer assistant.
