# 09 — Chứng minh luồng hoạt động

## Identity graph bắt buộc

| Dữ liệu          | Khóa liên kết authoritative                                                           | Không được thay bằng                                       |
| ---------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Session          | userId + tenantId + capabilities từ BE                                                | anonymous fixture, tenant client chọn tùy ý                |
| Shipment         | shipment.id; shipmentNo chỉ display                                                   | shipmentNo làm resource UUID                               |
| Document/OCR     | shipmentId → externalDocumentId → OCR job id; review trả documentId/jobId             | file.name, storage URL hoặc giả định mọi id là cùng entity |
| Route/approval   | routeId + version → approvalId + routeVersion/policyVersion                           | routeId gửi vào approval action, status Approved tự gán    |
| Negotiation/mail | sessionId → sourceThreadId/sourceMessageId → draftId/draftRootId → processedMessageId | UUID random/local cache id                                 |
| Invoice/payment  | shipmentId + customerId → invoiceId → payment/ledger identity                         | customerName, first invoice trong list                     |
| GPS/notification | shipmentId + tenant scope + timestamp/event identity                                  | fixture marker hoặc tenant fallback                        |

## Invalidation map

Các tên dưới là nhóm query, không bắt buộc event name. Dedupe bằng event/message ID nếu contract cung cấp; thiếu ID thì refetch có debounce, không tự tăng count.

| Mutation/event được xác thực            | Query cần invalidate/refetch                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| Create/update/submit shipment           | shipment list/detail/timeline, dashboard, route-planning shipment pool                 |
| Attach/OCR/review                       | document queue/review/detail, shipment documents; đánh dấu compliance snapshot stale   |
| Compliance evaluated                    | evaluation detail và shipment context; không tự viết status shipment                   |
| Route optimize/recommend/approve/reject | route list/detail, pending approvals; assignment thực sự đổi mới invalidate shipment   |
| Persist route assignment                | route detail/capacity, shipment detail/list/timeline, map                              |
| Mail claim/reassign/unassign            | các queue mail, thread detail/history, workload summary nếu BE có                      |
| Draft/send                              | draft/detail/thread/messages; unread chỉ theo BE, send accepted chưa delivered         |
| Negotiation suggestion/draft            | session detail/list, draft/thread liên quan                                            |
| Invoice/payment                         | invoice detail/list, wallet/credit nếu nghiệp vụ tác động, dashboard metrics liên quan |
| GPS/alert resolve                       | tracking current/history/alerts và dashboard; giữ recordedAt để bỏ event cũ            |
| Read notification                       | notification list + unread count                                                       |
| Logout/session/tenant change            | cancel in-flight, clear toàn bộ tenant-sensitive caches, disconnect transport          |

## V01 — Baseline và contract tests

Trước implementation ghi branch/commit cả hai repo, endpoint/schema Swagger đang deploy, package/test commands và lỗi nền. Chạy client `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` khi triển khai; kiểm tra output từng lệnh, không khẳng định pass khi chưa chạy. Không sửa lỗi UI ngoài scope chỉ để che baseline; ghi file/test liên quan.

Mỗi domain thêm DTO/service tests đã liệt kê; fixture lấy từ BFF serialization test hoặc HTTP thật đã redact, không copy view mock. OpenAPI nhiều endpoint thiếu response schema: bổ sung ProducesResponseType/DTO ở BFF và serialization test trước codegen. Test null/date/enum/decimal/paging/error contracts; 200 có response sai shape phải báo contract error, không fabricate.

## V02 — Auth/tenant/permission

Môi trường test có staff A, staff B, manager cùng tenant và user tenant thứ hai; tài khoản do người vận hành cung cấp, không ghi credential vào docs. Test valid/invalid login, invitation, expiry/refresh, logout khi FCM lỗi, revoked capability; tampered JWT và cross-tenant ID bị chặn. Open redirect, CSRF/cross-origin, websocket no-token và room ownership phải kiểm tra trong test environment.

## V03 — Shipment → document → compliance → route → tracking

1. Staff tạo shipment, bổ sung cargo/Pickup/Delivery; submit; đọc lại list/detail/timeline cùng UUID.
2. Upload file test → attach → OCR; poll NEEDS_REVIEW → correction → READY; reload còn correction và link shipment.
3. Evaluate compliance với snapshot thật; render citations/missing evidence; sửa cargo khiến evaluation cũ stale. Nếu yêu cầu auto orchestration, chứng minh producer/consumer thật, không chỉ FE gọi hai API liên tiếp.
4. Create route/optimize/recommendation; policy cần manager thì chỉ sinh pending ticket, không auto assign.
5. Manager approve đúng approvalId/version; route Ready; assign shipment qua BE command; hai tab reload đều cùng routeId. Reject/stale/concurrent review có test riêng.
6. Bản đồ hiển thị đúng hai marker đầu/cuối từ shipment/route BE và một đường nối minh họa giữa chúng; đổi shipment và reload cập nhật cả marker lẫn đường nối. Test thiếu tọa độ, tọa độ lỗi, hai điểm trùng và thứ tự locations đảo; không vẽ đường khi thiếu endpoint hợp lệ. Không cần GPS feed, tuyến đường thực tế, intermediate stops, geofence visualization hay WebSocket để đạt gate này.

Pass: HTTP/DB/event evidence nối đúng tenant và IDs. Fail ở một bước phải có pending/error/resume rõ, không báo cả workflow completed.

## V04 — Mail → negotiation → human send

Inbox test ingestion tạo thread; A/B claim cùng lúc chỉ một thắng; manager reassign có history. Persisted negotiation suggestion tạo mail draft có source/thread/reply-to đúng; người dùng review rồi gửi tới mailbox test được phép. Double-click/retry không tạo hai outbound; SMTP fail không hiển thị delivered. Reload đọc trạng thái thật. Không gửi email thật tới khách hàng trong verification tự động.

## V05 — POD → invoice → payment

POD event thật đúng tenant/shipment/customer/storage key đi qua broker tới billing. Duplicate và concurrent event chỉ một invoice. Thiếu POD/customer phải trạng thái lỗi/chờ đúng, không fallback hàng mẫu. Partial/full payment test ledger và balance; duplicate key/retry không nhân đôi; currency mismatch, cancelled invoice và tenant khác bị chặn. Kiểm tra UI list/detail/summary sau event và reload. Chỉ dùng môi trường thanh toán giả lập.

## V06 — Resilience/cross-feature

Ngắt từng service trong test environment: HTTP timeout hiển thị lỗi đúng domain; không silent success hoặc mock fallback. Broker down/outbox retry không mất event; DLQ poison event; reconnect refetch state authoritative. FCM bị từ chối vẫn dùng notification center bình thường. Đăng xuất/đổi user khi request đang bay không ghi dữ liệu tenant cũ vào session mới.

Assistant trả insufficient evidence/quota/governance denied không thay bằng canned answer và không thực thi action nhạy cảm. Dashboard partial failure không hiển thị KPI mẫu. Người dùng kiểm tra UI map/forms light/dark bằng tay, không yêu cầu Playwright.

Notification gate riêng: business event → Notification service persistence → Firebase FCM → foreground popup/background service worker → click deep-link → HTTP list/unread/read cập nhật đúng. Test register/remove device, token lifecycle và dedupe bằng notification identity. Không cần RealtimeHub cho gate này; các websocket tests ở V02 chỉ áp dụng nếu triển khai X02 riêng.

## Completion gate và evidence log

Tạo `docs/integration/implementation-status.md` **khi bắt đầu implementation**, ghi từng task ID, files, command, result, backend/client revision, test environment và blocker. Ghi task deferred/blocked rõ, không tính completed.

- [ ] BE security/session gates đạt trước data thật.
- [ ] Feature tests + contract tests đạt, không có mock fallback production.
- [ ] Typecheck/lint/relevant tests/full tests/build có output kiểm chứng; lỗi nền được phân loại minh bạch.
- [ ] V02–V06 đạt cho feature được mở; event chains có bằng chứng broker/handler, không chỉ docs.
- [ ] Mọi thao tác lưu có server persistence và reload proof; không hidden local success.
- [ ] Swagger/docs source cập nhật cho contract đã đổi; deployed revision tương thích FE.
- [ ] Unsupported actions ghi rõ; không exposure admin; customer portal đạt CP01–CP09 và V07 ở file 13, không cấp quyền staff để bypass.

Chưa chạy các gate này trong lượt viết plan. Chỉ validation tài liệu và đọc OpenAPI công khai được thực hiện.

### AI/RAG corpus completion status (2026-09-13)

- Implemented on isolated BE/FE branches from `origin/stagging-prod` and `origin/develop` respectively.
- Automated non-integration verification is green for the RegulatoryCompliance, DocumentOcr, BFF, corpus upload, compliance handoff, and assistant slices.
- Full FE typecheck still reports six pre-existing errors outside these slices; local DocumentOcr/RegulatoryCompliance integration tests need PostgreSQL/RabbitMQ.
- Staging deployment, real R2/OCR/embedding E2E, and merge into shared branches are intentionally pending until the administrator confirms Key Vault wiring and a deployable revision is available.

## V07 — Customer portal bắt buộc

Áp dụng toàn bộ checklist V07 tại [13-customer-portal.md](13-customer-portal.md): staff gán shipment/share document/phát hành quote/ghi payment → customer thấy projection được phép; quote confirmation ngược lại persisted cho staff; FCM đúng audience và customer assistant không vượt ownership. Test hai customer cùng tenant, customer khác tenant, direct ID/download/conversation/tool lookup, revoked sharing và logout/login đổi persona. Customer invoices read-only không được dùng staff RecordPayment. V07 là gate của toàn bộ plan, không còn deferred.
