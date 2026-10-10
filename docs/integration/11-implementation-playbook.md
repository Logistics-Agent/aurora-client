# 11 — Hướng dẫn triển khai toàn bộ integration theo từng bước

Tài liệu này bổ sung **cách implement** cho các task trong file 01–09, không thay đổi contract đã audit. Chưa triển khai application code. Tên hàm mới bên dưới là interface dự kiến của client, không phải RPC/HTTP đã tồn tại. Mỗi nhóm file là một subtask S/M; không gom tất cả thành một lần sửa.

Phạm vi chốt: **customer + staff/manager**; notification Firebase FCM; map hai marker đầu/cuối + đường nối minh họa. Không routing engine, GPS streaming, Socket.IO hay admin. Giữ light/dark và UI hiện tại. Customer portal bắt buộc triển khai theo [13-customer-portal.md](13-customer-portal.md), gồm contract gates và CP01–CP09 bổ sung cho playbook này.

## 1. Quy trình áp dụng cho từng slice

1. Đọc controller, DTO, proto được load và handler của action sắp làm. So với Swagger deployment; ghi lại revision mới, không coi snapshot audit 2026-09-09 là vĩnh viễn đúng.
2. Viết fixture HTTP đã redact + test request/response trước. Nếu Swagger chỉ ghi 200 không schema, thêm BFF serialization test thay vì đoán shape từ mock.
3. Implement service parse `unknown`, root query/mutation, rồi feature composition. Chỉ chuyển một flow sang API thật khi cả success/error được xử lý; không bật mock fallback khi request lỗi.
4. Kiểm tra reload/deep-link, quyền và lỗi giữa chừng. Ghi task/subtask ID cùng kết quả vào implementation status; không đánh dấu done vì đã có service method.

### Contract/state chung cần viết

| Owner | Logic cụ thể |
|---|---|
| `src/configs/api.ts` | Controller path theo domain, một prefix duy nhất; không URL rải trong JSX |
| `src/dto/<domain>/*.dto.ts` | Request/response schemas khác nhau; parser null/date/enum/decimal; reject shape sai |
| `src/api/services/*.service.ts` | Object methods, truyền AbortSignal cho reads, trả parsed DTO, không toast/router/local cache |
| `src/api/query-keys/*.keys.ts` | `all`, tenant-scoped list/detail; filter/cursor/id thuộc key; không chứa token |
| `src/hooks/queries/<domain>` | `enabled` chỉ khi có session/quyền/id; paginated data đúng contract; fetch/error/refetch |
| `src/hooks/mutations/<domain>` | pending, response authoritative, invalidation; không chuyển màn hình nếu mutation thất bại |
| Feature composition | selectedId/form/panel local; server entities lấy từ Query; view model là pure mapping |

UI phân biệt `loading`, `success-empty`, `success-data`, `error`, `forbidden`, `not-found`, `unsupported`. Các tên này là trạng thái UI, không thay enum nghiệp vụ BE. Khi lỗi, giữ dữ liệu cũ chỉ nếu cùng session/resource và có nhãn stale.

Mutation quy tắc: pending → await service → parse response → cập nhật/invalidate query → toast/điều hướng. Catch giữ form và báo lỗi. Timeout mutation là **chưa biết kết quả**, không tự coi failed rồi POST lần nữa; reconcile qua GET hoặc cùng idempotency key nếu BE bảo đảm.

## 2. Auth và session — F01–F04

### F01.a — Shared HTTP (4 file)

Sửa `src/lib/api.ts`, `src/lib/api-error.ts`, `src/configs/api.ts`; tạo `src/lib/api.test.ts`.

Implement refresh promise dùng chung, danh sách auth actions không refresh, retry GET tối đa một lần sau refresh cookie. Refresh trả success session, không `data.accessToken`. Không gắn bearer customer legacy lên request staff. ApiError giữ HTTP status, business code nếu có và correlation ID; abort không hiện toast.

Test 10 GET đồng thời 401 chỉ một refresh; refresh 401 dừng; 403 không refresh; POST timeout không auto replay. Dependency BE-01/02; HTTP tests có thể viết trước, runtime gate chờ BE fix.

### F02.a — Bootstrap identity (5 file)

Sửa auth DTO/service, current-user query, permission hook và `src/api/services/auth.service.test.ts` theo file 01. `getCurrentUser()` chỉ map 401 thành anonymous; 500/offline là error. Bootstrap `/me` trước mở domain queries. Không lấy role label để cấp quyền; fail closed khi permissions thiếu.

Acceptance: không flash dữ liệu staff trước auth; test anonymous/forbidden/offline riêng, user A logout rồi B login không còn entity của A.

### F03.a — Login/invitation (4 file)

Sửa `src/features/auth/login/index.tsx`, `src/features/auth/login/login.test.tsx`; tạo `src/hooks/mutations/auth/use-auth-login.ts`, `src/hooks/mutations/auth/use-auth-login.test.tsx`.

Submit email/password → identify → login → parse invitation challenge nếu đúng code → invitation form → complete invitation → refetch `/me` → điều hướng local returnUrl. Không redirect trước `/me` thành công. Reset password fields khi xong, không persist password/challenge trong localStorage. Business error khác invitation không mở form đặt mật khẩu.

### F03.b/F04 — Logout và trang phụ

F03.b sửa logout hook/test hiện có và auth-storage nếu cần (3 file): unregister device best-effort với timeout hữu hạn; gọi logout dù unregister lỗi; cancel queries/clear tenant caches; báo server logout chưa xác nhận nếu request lỗi. Không gọi clear cache rồi để response cũ ghi vào session mới.

F04 sửa forgot-password, select-tenant, settings và navigation config; tạo auth-access test (5 file). Forgot-password/tenant-switch chưa có contract thì disabled/explanation, không mock success. Settings chỉ local preference khi không có profile update API. Direct URL dùng cùng capability với navigation, không chỉ ẩn menu.

Checkpoint F: login → refresh → logout → login user khác, không leak cache; `pnpm exec vitest run src/api/services/auth.service.test.ts src/hooks/queries/auth src/hooks/mutations/auth src/features/auth`.

## 3. Shipment — S01–S04

### S01/S02 — Read slice trước (theo nhóm file 02)

Service methods dự kiến: `listShipments`, `getShipment`, `getTimeline`, `createShipment`, `updateShipment`, `addLocation`, `submitShipment`, `cancelShipment`, `importShipments`. Mỗi method map đúng request riêng; không POST create payload vào PUT update.

Table giữ filter/page ở URL hoặc local filter state; đổi filter reset page; key chứa filter. Render shipmentNo nhưng link bằng id. Detail query theo route UUID, timeline query tách riêng để lỗi timeline không làm mất detail. Mapper không tạo customer/ETA mặc định.

Test dùng id `UUID-A` và shipmentNo `SHP-001` khác nhau để bắt lỗi link. Load page 2 rồi đổi filter phải request page 1. Không dùng số rows của trang làm tổng toàn bộ.

### S03 — Save draft trước, submit sau

Trong `use-shipment-mutations.ts` tách các action nhỏ, không một hàm catch tất cả rồi success. Form validate cargo + hai locations. Luồng:

```text
createShipment → giữ shipmentId → lưu locations còn thiếu → refetch detail
→ validate khả năng submit theo BE → submitShipment → detail/timeline/list invalidation
```

Nếu create thành công mà addLocation lỗi: dẫn tới draft thật, hiển thị bước chưa xong; khi retry kiểm tra locations hiện có trước, không add trùng. Không tự xóa shipment để rollback. Nếu POST timeout không trả id và BE chưa có idempotency, báo cần kiểm tra kết quả, không tạo lại mù quáng.

Các file/nhóm ≤5 ở S03 file 02. Test mutation partial failure, reload/resume, update invalid status, submit thiếu Pickup/Delivery; không mở nút submit chỉ vì frontend đã điền address text.

### S04 — CSV import có kết quả từng dòng

Source đọc thêm: `src/dotnet/ShipmentWorkflow/Application/Commands/Shipments/ImportShipmentsCommand.cs`, DTO `ImportShipmentsResult.cs`.

Handler đọc CSV text, giới hạn 100 data rows và 256 KiB UTF-8, không cho header tenantId. Các cột được đọc: orderId/customerName/destinationAddress/cargoName/quantity/weightKg/hsCode. FE dùng file.text(), không base64/multipart. Header bắt buộc chính xác chốt theo BuildHeaderIndex trước tạo template.

Response nội bộ có importRequestId/totalRows/successCount/errorCount/rows; mỗi row có rowNumber/success/shipmentId/shipmentNo/error. Test BFF serialization để chốt HTTP casing/shape. Render riêng dòng thành công và lỗi; partial success không yêu cầu import lại nguyên file.

**Điểm chặn:** đoạn handler đọc hiện chỉ echo importRequestId, chưa thấy dedupe trong Handle. Trace middleware trước; nếu không có, thêm BE dedupe theo tenant + requestId + content hash và persist kết quả trong transaction. Cùng key khác nội dung phải conflict. Trước khi có guarantee này tắt auto retry. Test CSV duplicate/concurrent upload, Unicode byte limit, row lỗi không mất rows đã thành công.

Checkpoint S: `pnpm exec vitest run src/api/services/shipment.service.test.ts src/hooks/mutations/shipments src/features/shipment`; manual create → resume → submit → reload cùng UUID.

## 4. Upload, OCR và compliance — D01–D03/C01–C02

### D01/D02 — Queue/detail/review

DTO map item.id/documentType, fields.name/value. Hook review enabled theo documentId thật; queue rỗng không dereference selected.id. Detail route phải query ID trực tiếp, không chỉ find trong page đầu của queue.

Sửa thêm wiring trong `src/features/documents/ocr-review/index.tsx`, `src/features/documents/document-center/index.tsx`, `src/features/documents/upload-document/index.tsx`, `src/features/documents/index.tsx` theo subtask D02.b (4 file). Bỏ badge hardcoded NEEDS_REVIEW, render trạng thái BE. Entry composition giữ trách nhiệm page, route adapter chỉ truyền param.

CONFIRM/CORRECT/REJECT mutation giữ field names đúng; normalize giá trị thành kiểu request yêu cầu, không stringify mọi object tùy tiện. 409 refetch review và báo conflict, không auto gửi correction cũ. Poll chỉ RECEIVED/PROCESSING; NEEDS_REVIEW chờ người dùng; terminal không poll vô hạn.

### D03 — Upload orchestrator

Nhóm files D03/root mutations đã chỉ trong file 03. Local hook chỉ orchestration các root mutation, không service HTTP trực tiếp. State UI: selecting → uploading → attaching → submitting-ocr → completed; bất kỳ lỗi giữ object reference/IDs đã được server xác nhận để resume.

BE-08 quyết định upload contract; FE chỉ gọi URL được server cấp, validate storage ownership server-side. Upload thành công chưa có nghĩa OCR thành công. Attach trả externalDocumentId, submit OCR dùng đúng ID đó, lưu jobId riêng. Nếu BE không trả đủ linkage, sửa BFF DTO trước; không dùng random externalDocumentId thay document đã attach.

Nếu tab đóng giữa workflow, reload lấy persisted attachment/job trạng thái BE; không dựa vào File object trong memory để phục hồi. Orphan file cleanup do backend policy, không FE tự xóa đối tượng tùy ý.

### C01/C02 — Evaluation có context thật

`build-compliance-snapshot.ts` nhận parsed shipment detail + documents READY/review state; trả request hoặc missing-input list. Không tự chọn US/VN/OCEAN. Người dùng bấm Evaluate, mutation gửi idempotency key ổn định theo lần đánh giá; giữ evaluationId trả về và invalidate query evaluation.

Subtask C02.b (3 file): sửa `src/features/compliance/compliance-detail/index.tsx`, `src/features/compliance/index.tsx`; tạo `src/features/compliance/compliance-detail/compliance-detail.test.tsx`. Route hiện gọi param findingId, **không coi findingId là evaluationId** nếu BE chưa có mapping. Chốt projection lookup hoặc route contract trước deep-link; không tìm mock finding để lấp chỗ trống.

BE cần lưu/lookup evaluation theo shipment để reload; nếu API hiện chỉ GET evaluationId, bổ sung read projection có tenant scope thay vì dùng localStorage làm lịch sử. Finding resolve là mutation riêng cần BE, không tự PATCH shipment status sau evaluation.

Test: direct document deep-link không nằm page đầu, OCR correction conflict, upload partial error, evaluation missing input/AI unavailable và finding/evaluation ID khác nhau. Checkpoint D/C: cùng shipment UUID đi qua attachment → OCR review → evaluation; reload đọc kết quả lưu thật.

## 5. Route, approval và bản đồ — R01–R03/T01–T02

### R01/R02 — Route data thay fixture

Chuyển fetchLiveBackendData khỏi Zustand: `use-routes-query` + shipments query cấp data cho composition; store chỉ selectedId/camera/form. `createRoute` giữ returned id, optimize dùng response thật, recommendation hiển thị governance decision; loading là request state, không thêm vào route status enum.

Không gán route cho shipment khi chỉ create route thành công. Không PATCH Approved từ nút Accept. Nếu association BE chưa có, nút Assign disabled; BE-05 phải validate tenant, lifecycle/capacity trước persist routeId.

### R03 — Manager action và stale review

Pending list giữ approvalId riêng routeId/version; modal lấy đúng ticket. Approve/comment và reject/reason dùng approval mutation; response success invalidate pending + route detail. Nếu conflict do route đã sửa/ticket đã xử lý, tải lại và yêu cầu người dùng xem bản mới. Không tự retry approve.

Task BE-05 chia contract/handler và test riêng, không để FE quyết định Ready. After assignment response, refetch shipment và route; nếu read side eventual consistency thì pending sync/retry GET hữu hạn, không overwrite bằng local status vĩnh viễn.

### T01/T02 — Hai marker + một đường nối

`map-endpoints.ts` là pure mapper locations/stops → origin/destination có position và label. Chọn theo type/sequence authoritative, không theo index mảng ngẫu nhiên. Nếu không biết semantics nhiều pickup, cần contract quyết định, không tự đoán bằng tên địa điểm.

Common map nhận hai markers và geometry minh họa từ cùng hai tọa độ. Không routing API, không GPS polling/WebSocket. Thiếu một tọa độ thì chỉ marker hợp lệ + thông báo thiếu; hai điểm trùng không vẽ đường giả. Bounds thay theo selection; khi đổi shipment không giữ line A với markers B. Với tọa độ qua kinh tuyến 180°, xử lý world wrap theo common map, không vẽ đường vòng sai chỉ vì longitude đổi dấu.

Wiring T02 theo file 04; thêm subtask T02.b sửa `src/features/command-center/index.tsx` + test hiện có để overview cùng quy tắc. Giữ map renderer hiện có, không dựng thêm lifecycle map trong mỗi page.

Checkpoint R/T: tests approvalId≠routeId, stale review, assign/reload, selection/cross-dateline/invalid coords; manual hai marker + đường nối trên các màn hình, không cần GPS feed.

## 6. Mail — M01–M03

### M01/M02 — Queue, detail và owner

Service typed parse list `{threads,nextPageToken,hasMore}` và detail đầy đủ. Queue scope/filter thuộc key; đổi mailbox reset cursor. Thread detail/history không fabricate từ summary. Current user lấy userId/name, không anonymous fallback.

Repository hiện tại chuyển dần thành pure adapter rồi ngừng dùng làm source state: không cache riêng, không try/catch returning fake-success. Reuse `src/features/mail/types/index.ts` cho feature contract, không import interface từ mock folder.

### M03.a — Claim/reassign/unassign (≤5 file)

Tạo root mutation hook/test; sửa workspace hook, reassign dialog và return-to-queue dialog. Pending disable đúng action, không khóa cả inbox. Reassign body targetUserId/reason; allowed staff lấy từ scoped BE lookup. Claim 409 tải lại owner; reassign 403 giữ modal báo thiếu quyền; success invalidate queues/detail/history.

### M03.b — Draft editor (4 file)

Sửa `src/features/mail/composer/components/reply-composer.tsx`, `src/features/mail/composer/types/index.ts`, `src/features/mail/composer/utils/validate-mail-draft.ts`, `src/features/mail/composer/composer.test.tsx`.

Load draftId thật → form values. Giữ dirty fields khi query refetch; không overwrite người dùng đang nhập. Save draft cần revision contract: nếu chưa có update API đúng nghĩa, BE-07 phải thêm/confirm handler, không POST create vô hạn để giả autosave. Error giữ text, revision conflict cho reload/compare, không force overwrite.

### M03.c — Send và deep-link (4 file)

Sửa `src/features/mail/index.tsx`, `src/features/mail/thread/index.tsx`, `src/features/mail/hooks/use-mail-workspace.ts`, `src/features/mail/thread/thread-workflows.test.tsx`.

Composer nhận draftId qua query param đề xuất trên route mail hiện có; validate rồi GET draft từ service, kiểm tra thread linkage. Send payload lấy sender mailbox được phép, recipients thật, threadId/replyToMessageId/draftRootId chính xác. Dùng một idempotency key cho cùng send intent; đổi nội dung trước một lần gửi mới thì key mới, không reuse gây cache kết quả cũ.

Outbound success chỉ là submitted/queued với processedMessageId, không delivered. Timeout giữ trạng thái chưa xác nhận, reconcile message qua BE. Permission/ownership phải được BE enforce kể cả UI không hiện nút. Priority/resolve chưa có API thì unsupported, không local-only.

Checkpoint M: hai staff claim cạnh tranh, draft save fail giữ text, duplicate send không hai mail, reload đọc thread/message thật. Tests `src/api/services/mail.service.test.ts`, root mutations/mail và feature mail; SMTP sandbox với recipient được phép.

## 7. Negotiation — N01/N02 và BE-07

Mục tiêu: staff xem thương lượng giá của shipment → đọc đề xuất → tạo draft → tự review/send. `ACCEPT` của AI không phải đã thanh toán hoặc đã ký giao dịch; không tự approve route hay generate invoice từ label này.

### N00 — Chốt read/offer contract BE (chặn list/detail UI)

Proto hiện có SubmitOffer/GetSessionHistory/GetDraftSuggestion, **không có ListSessions** trong proto đã đọc. BFF hiện expose mail-draft, không coi list/detail/submit offer là đã có HTTP. Nhóm BE-07.a: sửa `protos/negotiation.proto` khi cần list projection, `Staff.Bff/Controllers/NegotiationsController.cs`, thêm typed BFF DTO và contract tests (≤4 file trước downstream task riêng).

Trước thêm RPC, tìm service/repository negotiation thật để implement tenant-filtered list + pagination; file downstream phải được ghi cụ thể trong task sau discovery, không đặt tên file Java theo suy đoán. Không build list từ cached SubmitOffer responses vì reload mất session cũ.

SubmitOffer RPC nhận shipment/customer/offer/list/bottom price/tier/session/source IDs. Browser không được tự quyết bottomPrice/customerTier hay tenant. BFF/domain resolve giá sàn/tier từ nguồn được phép; response không expose giá sàn cho persona thiếu quyền. Currency request hiện chưa có trong proto này; không mở multi-currency form trước khi chốt semantics BE.

### N01 — Service/query/mutation

Nhóm 5 file N01 ở file 05: parser history, suggestion, draft response riêng; service method `createMailDraft` dùng endpoint đã có. Các methods `listSessions/getSession/submitOffer` chỉ nối sau N00, không hardcode URL dự kiến như API đã deploy.

History có sessionId/shipmentId/customerId/status/currentRound/maxRounds/messages; sourceThreadId/sourceMessageId lấy từ suggestion contract khi history không có. Không nhập nhằng message RFC ID với processedMessageId nếu lookup BE yêu cầu khác; BE phải resolve canonical ID trước create draft.

### N02.a — List/detail/offers

Nhóm 5 file N02 ở file 05. List click bằng sessionId; detail route truyền cùng ID. Show current round, offer, currency, decision, message history; loading/error/no suggestion/hand-off khác nhau. Form submit chỉ enabled khi phiên còn nhận offer theo BE; giá hiển thị theo currency, validate số dương nhưng BE tính quyết định.

Sau submit success invalidate detail/list/suggestion, không tự append giả lời AI. AI unavailable/fallback phải hiển thị cờ từ response. Handoff chỉ hiển thị cần người xử lý khi BE chưa có action manager chính thức, không tự tạo approval ticket khác domain.

### N02.b — Chuyển draft sang mail (3 file)

Sửa negotiation-detail composition, `src/hooks/mutations/negotiations/use-negotiation-mail-draft.ts`, `src/features/commercial/negotiation-detail/negotiation-mail-flow.test.tsx`.

Staff chọn mailbox hợp lệ → POST mail-draft → nhận draftId/draftRootId/threadId → invalidate mail draft/thread → navigate mail composer (không import UI mail vào commercial). Nếu source recipient unresolved, không cho send với address mẫu; hiển thị yêu cầu kiểm tra recipient đúng quyền.

Server default idempotency theo tenant/session có thể trả draft cũ khi session sang vòng mới: test new-round behavior, không tự thêm random key để né idempotency. Nếu cần draft mỗi suggestion revision, sửa contract/key policy BE có version rồi FE dùng theo policy đó.

Checkpoint N: phiên thật → persisted suggestion → tạo draft hai lần không duplicate → sửa draft → human send; không automatic send/AI regeneration khi chỉ mở preview. Test currency/round/source IDs/tenant mismatch và thiếu suggestion.

## 8. Financial, invoice, payment, escrow — B01–B04

### B01 — Estimate form

Files nhóm B01/B01b ở file 06. Build request từ shipment và input bổ sung: units trọng lượng/kích thước, ports/countries/mode/currency; missing required input hiện lỗi field, không fake default corridor. Mutation estimate giữ snapshot request; thay input khiến kết quả trước stale. Cost breakdown từ response, không compute lại công thức BE ở client.

### B02 — Invoice read và generate

Invoice detail GET bằng invoiceId, list filters/paging theo controller. Summary phải từ aggregate đúng phạm vi, không sum một page. Generate dùng shipmentId/customerId thật sau BE lifecycle gate; duplicate generation phải BE enforce. Không lấy customerName làm id, không mark PAID bằng PATCH để né ledger.

Sửa thêm invoice-detail test và billing test ở subtask B02.c (2 file mới). Test summary unavailable khác zero, GET invoice B sau click không còn line items invoice A, server rejects status giữ error.

### B03 — Payment ledger (BE-06 trước)

BE subtasks: expose RPC trong proto + HTTP typed DTO; tenant enforcement; transaction/idempotency riêng. Không chỉ thêm controller gọi handler: phải kiểm tra query invoice/wallet đúng tenant, balance calculated trong transaction an toàn concurrent, unique payment identity.

FE payment form chọn invoice đang mở, submit amount/currency/method/reference theo contract đã chốt. Disable repeat trong pending; success dùng returned balance/status, invalidate invoice/list/credit/wallet khi có tác động. 409 duplicate reconcile GET; network timeout không tự gửi key mới. Partial payment hiển thị remaining, không tất cả success đều PAID.

Checkpoint B03: hai payment concurrent + repeated same key, insufficient/overpayment policy, currency mismatch, cancelled invoice, tenant B invoice đều được test BE; FE không recorded=true trong catch. Không dùng tiền thật.

### B04 — Escrow read và POD auto invoice

Wallet read bằng walletId được BE cấp, không fixture. Lock/release/refund unsupported cho tới HTTP contract chính thức; không tự thêm vì gRPC nội bộ có.

POD → event → billing handler phải có shipment/customer/currency/storage linkage thật. BE cần idempotent transaction/unique guard; missing payload không fallback CUST-001 hoặc default weight. FE không gọi generate thêm chỉ vì FCM chưa tới; refetch invoice list theo shipment để reconcile.

Checkpoint B: estimate → shipment context → invoice → payment → reload balance; document/POD retry không tạo invoice trùng.

## 9. Firebase FCM và notification center — X01

### X01.a — Token/device lifecycle (4 file hiện hữu)

Sửa `src/features/notifications/lib/fcm-registration.ts`, test cùng tên, `src/features/notifications/hooks/use-fcm-notification.ts`, test cùng tên.

Sau authenticated user bật push: support check → permission từ user gesture → service worker → getToken(VAPID) → registerDevice API → giữ returned device ID scoped session. Reuse các trạng thái timeout/unsupported/registration-failed đã có, không viết bootstrap khác. Token thay đổi thì sync registration đúng user; logout/remove device không xóa thông báo đã lưu.

### X01.b — Foreground/background (4 file hiện hữu)

Sửa `src/features/notifications/popup/components/notification-fcm-bootstrap.tsx`, `src/features/notifications/lib/firebase-service-worker.ts` và hai test tương ứng.

Foreground onMessage validate payload → dedupe notification identity → popup → invalidate list/unread/linked entity. Background service worker hiển thị push theo payload strategy BE (tránh auto notification + showNotification trùng); click focus/open local allowed URL; app load lại GET authoritative. Không dùng arbitrary payload URL dẫn ra site ngoài.

### X01.c — Read và feature invalidation (4 file)

Sửa notification payload utility và test; tạo `src/lib/query-invalidation.ts`, test cùng tên. Mapping domain/entity IDs theo payload BE thực có; thiếu linkage chỉ refetch notification list/unread, không đoán shipmentId từ title. Invalidate các key đã khai báo, không import feature UI.

PATCH read/read-all success mới phản ánh authoritative count, optimistic nếu có phải rollback. Không tăng count trực tiếp mỗi lần FCM nhận: push có thể duplicate/out-of-order. Không coi FCM là nguồn duy nhất, refetch khi app focus để bù push miss.

Checkpoint X: test foreground/background/click, permission denied, token timeout, register fail, duplicate payload, logout/login user khác. Chứng minh Notification service persist → Firebase gửi → client nhận → list/read; **không cần RealtimeHub**.

## 10. Overview, assistant, search, settings — O01/A01/A02/F04

### O01 — Card data composition

Dashboard service parse đúng summary của BE; Query tách dashboard/shipments/alerts theo capability. Mỗi card có loading/error/empty riêng. UI không cấp thêm quyền chỉ để tất cả card có dữ liệu. Alerts resolve nếu hiện có phải dùng root mutation await response, không fire-and-forget.

Map overview theo T01/T02, hai endpoints + connector, không GPS/trail. Aggregate card thiếu API thì nhãn chưa có dữ liệu, không số mẫu. Test 1 card fail + các card khác vẫn render, zero count đúng, filter scope không thay nghĩa metric.

### A01 — Grounded assistant

`use-assistant-query` mutation giữ request mới nhất; disable double submit hoặc ignore response request cũ khi có lượt mới. Service parse citations/conflicts/missingInformation/governance; render từng phần thay vì chỉ answer string. InsufficientEvidence là kết quả hợp lệ, không lỗi network; 403/412 khác unavailable.

Không attach shipmentId ngoài request contract, không hứa chatbot biết shipment chỉ vì page đang selected shipment. Nếu cần context logistics riêng, thêm BE contract có authorization trước. AI answer không được trực tiếp kích hoạt mail/payment/approval.

### A02 — Evidence search

Service POST search theo DTO SearchController, UI filter supported facets, render grouped evidence và nguồn. Query text thay đổi không tự POST mỗi keystroke không giới hạn; explicit submit hoặc debounce có abort. Link citations validate allowed protocols. Không dùng endpoint này làm shipment directory search.

### Settings/auth pages và deferred items

Theme mặc định light, light/dark giữ cơ chế hiện có; preference local không toast “saved to server”. Profile `/me` readonly nếu chưa có update API. Forgot-password và select-tenant disabled/explained cho đến contract thật, không mock send/switch.

A03 chat staff tùy chọn và X02 streaming deferred; admin portal ngoài scope. **Customer portal và customer persisted assistant nằm trong scope**, triển khai CP01–CP09 ở file 13. Không xóa file cũ khi chưa được yêu cầu.

Checkpoint O/A: `pnpm exec vitest run src/features/command-center src/api/services/assistant.service.test.ts src/api/services/search.service.test.ts`; thêm component tests cho no evidence/governance denial/stale response khi triển khai.

## 11. Backlog BE theo thứ tự thực thi

| Thứ tự | Task gốc | Cách chia implementation | Gate FE |
|---|---|---|---|
| 1 | BE-01/02 | Auth route/refresh regression → fix session → JWT/tenant/capability tests và fix | F và mọi data thật |
| 2 | S04 bổ sung | Trace import middleware → persisted dedupe nếu thiếu → duplicate/concurrency tests | Retry import |
| 3 | BE-05 | Association contract → command scoped tenant/lifecycle → approval version/concurrency tests | Assign route/customer linkage |
| 4 | BE-08 | Storage ownership/upload contract → attach/job correlation → review/evaluation read projection | Upload và reload compliance |
| 5 | BE-07 | Scoped mailbox/staff lookup → draft revision/actions → negotiation list/read/offer exposure | Mail actions/N list-detail |
| 6 | BE-06 | Proto exposure → tenant+transaction+idempotency → POD event payload/replay tests | Payment/auto-invoice |
| Riêng | Notification service | Registered business consumer → persistence → FCM delivery/retry invalid-token handling | X01 runtime |
| Deferred | BE-03/04 | RealtimeHub findings giữ backlog; không dependency map/FCM | Không mở X02 |

File BE cụ thể đã liệt kê trong [08-backend-fixes.md](08-backend-fixes.md). Trước sửa file ngoài client cần quyền ghi workspace. Nếu cần migration: task riêng ≤5 file, thiết kế backward compatibility + migration test trước; không edit generated stubs hay sync schema bằng lệnh phá dữ liệu.

## 12. Checklist bàn giao mỗi feature

- [ ] Contract đang deploy tương thích; endpoint chưa có không được gọi như đã tồn tại.
- [ ] Mỗi action đi qua root hook → service → shared HTTP; DTO validated; không duplicate server cache.
- [ ] Loading/error/403/409/timeout/empty có test; mutation lỗi không báo thành công.
- [ ] Ít nhất một test đổi response API để chứng minh UI bỏ fixture; direct URL và reload đúng ID.
- [ ] Cross-feature invalidation theo file 09, không import UI feature khác và không invent business event.
- [ ] Relevant tests đạt; checkpoint chạy `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` và ghi output/lỗi nền. Không chạy build để chứng minh tài liệu-only thay đổi đúng.
- [ ] Không commit/deploy/email thật/payment thật tự động; runtime dùng test tenant và tài khoản được phép.

Thứ tự đề nghị: F → S read/create/submit → T map → D/C → R/approval → M → N → B → O/A, X01 chạy sau F và bổ sung entity invalidation theo từng slice. Sau mỗi 2–3 subtasks làm checkpoint, giữ feature đang mở hoạt động; phần còn blocked phải hiện rõ, không lấy mock làm cầu nối.
