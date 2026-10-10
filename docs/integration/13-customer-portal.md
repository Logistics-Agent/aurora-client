# 13 — Customer portal: phạm vi, contract và implementation

## Quyết định phạm vi

Repo client phục vụ **customer + staff/manager**, không có admin console. Customer portal là phần bắt buộc của integration, không còn deferred. Kế hoạch này thay thế các ghi chú staff-only/customer-out-of-scope trước đây. Chỉ cập nhật plan; chưa cấp quyền customer, sửa BE hoặc nối API.

Skills: using-agent-skills định tuyến sang PLAN; planning-and-task-breakdown chia slice theo file/dependency/test; backend-api-engineering dùng để kiểm tra trust boundary, contract và persistence. Giữ UI/light-dark; notification FCM; map hai endpoint + đường nối minh họa, không GPS streaming.

### Nguồn đã đọc và mức chắc chắn

- FE `src/app/(customer)/layout.tsx`, các route `/portal`; `src/features/customer-portal` và store/tests: các page chính còn fixtures. Quote confirmation local-only; invoice hiện read-only; document preview chưa download thật; notification read/preferences nằm trong Zustand; assistant chỉ bật câu trả lời mock.
- BE `src/dotnet/shared/Constants/RoleConstants.cs`: hiện liệt kê SYSTEM_ADMIN/TENANT_ADMIN/MANAGER/STAFF, không CUSTOMER. Đây là gap trong lớp identity đã đọc, không kết luận mọi hệ thống auth customer đều vắng mặt.
- `src/dotnet/BFF/Staff.Bff/Controllers/ChatController.cs` forward actor STAFF; không dùng action này nguyên trạng cho customer.
- `src/nestjs/customer-assistant-service/src/interface/dto/create-conversation.dto.ts`: preferredLanguage optional; `send-message.dto.ts`: message string bắt buộc. Guard của service có customerId/actorType nhưng decode JWT payload chưa xác minh chữ ký tại hàm đó, có dev fallback; phải kiểm tra trust chain và fix trước customer runtime.
- Swagger đã audit ở file 10 là **Staff BFF**, không phải bằng chứng customer có quyền trên các endpoints đó. Chưa xác nhận customer API deployment. Các HTTP route customer đề xuất dưới đây **chưa phải API tồn tại**.

## 1. Boundary và dữ liệu được phép

Identity tối thiểu cần xác nhận server-side: `userId + tenantId + customerId + actor/persona + capabilities`. customerId là tài khoản/tổ chức khách hàng được liên kết với user đã xác thực, không lấy từ query/body/localStorage. Một tenant có thể phục vụ nhiều customer: lọc tenant thôi **chưa đủ**.

| Resource/action | Customer | Staff/manager |
|---|---|---|
| Shipment/list/detail/timeline | Chỉ shipment được liên kết và các milestone công khai | Theo capability và phạm vi vận hành |
| Route/map | Hai endpoint công khai + connector; không cần lịch sử xe hoặc dữ liệu khách khác | Planning/approval riêng theo plan gốc |
| Documents | Chỉ file được share với customer; preview/download kiểm tra ownership lại | Upload/OCR/review theo quyền vận hành |
| Quote | Xem báo giá đã phát hành cho mình, confirm version còn hiệu lực | Soạn/negotiation/phát hành theo lifecycle BE |
| Invoice | Customer-safe amount/currency/items/status của mình | Generate/payment ledger theo quyền; không cấp customer quyền RecordPayment |
| Notification | Thông báo thuộc user/audience được phép; mark read của mình | Không chia sẻ unread cache giữa personas |
| Assistant | Conversation của user/customer; tools chỉ truy cập resource customer được phép | Không dùng STAFF actor để chạy hộ customer |

Không trả internal margin/bottomPrice, OCR raw payload nhạy cảm, staff assignment notes, carrier settlement, raw storage reference hoặc dữ liệu tenant-wide rồi ẩn bằng JSX. BE phải tạo projection allowlist fields và kiểm tra từng resource ID. Policy visibility document/milestone/quote phải explicit; dữ liệu cũ chưa có ownership/share state mặc định không expose.

## 2. Contract gate — CP-BE01 đến CP-BE05

Chọn route customer riêng trong BFF/gateway hiện có nếu phù hợp conventions; **không bắt buộc tạo service Customer.Bff mới**. Nếu tái sử dụng endpoint hiện hữu, chỉ làm khi nó enforce customer scope và response projection đã có regression test. Prefix đề xuất để chốt: `/api/v1/customer`; chưa thêm vào client config trước contract merge.

| API cần cho UI | Contract đề xuất cần chốt BE | Tests bắt buộc |
|---|---|---|
| Customer session | `/me` hiện hữu mở rộng hoặc customer session endpoint; verified customer membership | Missing customerId fail closed, role không fallback STAFF |
| Overview | GET customer overview hoặc server aggregate customer-scoped | Count không gồm customer B; zero khác unavailable |
| Shipments | GET list, GET id, GET id/timeline; paging/filter typed | Direct id tenant/customer khác không trả dữ liệu |
| Documents | GET list/detail và cấp URL preview/download ngắn hạn | Customer A không xin URL file B, revoked share không cấp link mới |
| Quotes | GET list/detail, POST id/confirm với version/idempotency | Expired/revised/already confirmed và concurrent confirm |
| Invoices | GET list/detail, download nếu artifact có thật | Không lộ nội bộ, không customer PATCH PAID |
| Notifications | Reuse API nếu user/audience authorization đúng; device/read/subscription | Không subscribe shipment không sở hữu, không mark read user khác |
| Preferences | GET/update preference nếu giữ controls email/in-app hiện có | Lưu preference tác động delivery đúng; không hứa email delivery chỉ do toggle UI |
| Assistant | Create/list/detail conversation + send message, actor CUSTOMER | Conversation/tool/document retrieval đều enforce customer scope |

Tất cả list phải lọc trên BE **trước pagination/aggregate**. Không dùng list staff rồi filter trên client. HTTP DTO errors/status/currency/date/null phải chốt từ source+serialization tests; không suy từ view types hiện tại.

### CP-BE01 — Customer auth/membership (gate P0)

Subtask a: trace `src/dotnet/BFF/BuildingBlocks.BFF/Controllers/AuthController.cs`, Staff auth controller, `RoleConstants.cs`, `protos/auth.proto`, `src/dotnet/IamTenant/GrpcServices/AuthGrpcService.cs` (5 file đọc/sửa nếu thực sự cần). Chốt customer auth provider, membership source và session issuance; không chỉ thêm CUSTOMER vào enum rồi cho phép mọi API. Không mặc định email domain đồng nghĩa customer account trong tenant.

Subtask b: implement trusted customer identity resolver tại owner IAM/security thực tế sau discovery; thêm schema/migration chỉ nếu membership chưa được lưu. Ghi path entity/repository/test thật vào task trước code. Không tự dựng bảng customer trùng domain billing/shipment. Backfill ownership phải có nguồn xác thực, thiếu mapping thì quarantined/unavailable, không customer mẫu.

Acceptance: customer login/refresh/me/logout, staff/manager vẫn giữ flow; spoof header customerId/actor và thiếu membership bị từ chối. Verify auth integration tests với customer A/B cùng tenant + C khác tenant.

### CP-BE02 — Read projections/authorization (gate P0)

Subtask a theo domain (mỗi lần ≤5 file): `ShipmentsController.cs`/shipment query handler/projection/test; tiếp DocumentsController/document query/projection/test; tiếp BillingController/billing query/projection/test. Path controller nằm `src/dotnet/BFF/Staff.Bff/Controllers`; nếu cần route customer riêng tạo controller phù hợp, không mở rộng RequirePermission staff vô điều kiện.

Lookup constraint phải truyền trusted customer context tới service; GET bằng id, download, aggregate, conversation tool đều enforce, không chỉ list. Dùng contract customer-safe DTO riêng, không trộn staff payload với optional sensitive fields.

Acceptance: same-tenant customer B cũng bị chặn, không lộ existence/metadata qua error; response snapshot tests không chứa trường nội bộ. Verify shipment/customer mapping persistence và visibility share/revoke.

### CP-BE03 — Quote confirmation lifecycle

Trace `protos/negotiation.proto`, NegotiationsController và owner persisted quote/offer trong BE trước chọn entity. **QuoteId không mặc định là negotiationSessionId**; AI decision ACCEPT không phải customer confirmation. Nếu thiếu published quote model/lookup, bổ sung domain contract trước UI.

Chốt fields quoteId/customerId/shipmentId/version/amount/currency/expiresAt/status và thao tác confirm atomic. BFF derive confirmer từ session; kiểm tra audience/version/expiry; persist audit/confirmation và idempotency. Nếu confirmation phát sinh order/booking, phải theo domain đã có và test event, không tự create invoice/charge tiền.

Acceptance: confirm → reload vẫn confirmed; double-click/retry/concurrent confirm không hai giao dịch; quote revision cũ trả conflict. Test staff nhìn thấy confirmation cùng quoteId và customer không biết giá sàn nội bộ.

### CP-BE04 — FCM audience/preferences

Trace `src/dotnet/BFF/Staff.Bff/Controllers/NotificationsController.cs` và consumers trong `src/dotnet/Notification/Infrastructure/Messaging/Consumers`. Reuse Notification service, không RealtimeHub. Chốt recipients user vs customer organization và message visibility; register/remove device phải gắn đúng session/persona, không tenant-wide broadcast dữ liệu nhạy cảm.

Preference controls hiện có chỉ triển khai khi có persistence và delivery policy; nếu email channel chưa support thì disabled rõ nhưng task chưa hoàn tất tương ứng, không giả save. Test shipment subscription ownership, recipient dedupe, background click revoked access, logout token unregister failure.

### CP-BE05 — Customer assistant trusted proxy

Subtask a (≤4 file): sửa ChatController hoặc customer chat controller riêng; `src/nestjs/customer-assistant-service/src/infrastructure/security/auth.guard.ts`, `auth.guard.spec.ts`; thêm proxy integration test tại BFF test owner.

Xác minh JWT bằng trusted verifier, không chỉ decode; internal identity headers chỉ nhận từ BFF đã authenticate service, không public browser. Không fallback customer/tenant/secret trong production flow. Derive actor CUSTOMER và customerId từ verified membership; kiểm tra configuration handler có inject internal headers trước kết luận proxy thiếu auth.

Subtask b: trace conversation repository và assistant tool/data retrieval handlers; thêm customer scoping và tool tests theo nhóm riêng ≤5 file. Chỉ scope conversation table là chưa đủ: shipment/invoice/document lookup mà AI gọi cũng phải scope. Prompt không phải security boundary.

Acceptance: customer không đọc conversation khác hoặc yêu cầu AI bypass shipment ownership; no-evidence/timeout trả trạng thái thật; persisted chat history reload được.

## 3. File-level FE tasks

Quy ước: paths dưới `src/` từ client. Files mới là đề xuất; giữ shared HTTP client, không clone client Axios cho portal. Service/DTO customer riêng vì contract projection khác; Query keys phải chứa persona + tenantId + customerId + resource/filter. Root auth bootstrap key không đòi customerId trước `/me`; domain queries chỉ enabled sau identity xác nhận.

### CP01 — Session và shell (sau CP-BE01)

CP01a: sửa `src/dto/auth/auth.dto.ts`, `src/api/services/auth.service.ts`, `src/hooks/queries/auth/use-current-user-query.ts`, `src/api/query-keys/auth.keys.ts`, auth service test. Parser chấp nhận persona theo contract chính thức, không coerce CUSTOMER thành STAFF hoặc anonymous có quyền. Session đổi hủy queries/caches persona cũ.

CP01b: sửa `src/app/(customer)/layout.tsx`, `src/app/(customer)/layout.test.tsx`, `src/components/layout/customer-shell.tsx`, `src/configs/navigation.config.ts`, `src/features/auth/login/index.tsx`. Portal guard customer membership; staff route guard không dùng default login redirect vào portal và ngược lại. User có nhiều personas chỉ switch khi BE cung cấp session context hợp lệ; không tự xây switch bằng localStorage.

Verify: login customer → `/portal`; direct URL staff bị chặn theo policy; customer B sau logout A không có cache/FCM notification A. Tests layout/auth/current-user, manual reload/expiry.

### CP02 — Overview/list shipments (sau CP01 + CP-BE02)

CP02a tạo `src/dto/customer-shipments/customer-shipment.dto.ts`, `src/api/services/customer-shipments.service.ts`, `src/api/query-keys/customer-shipments.keys.ts`, `src/hooks/queries/customer-shipments/use-customer-shipments-query.ts`, `src/api/services/customer-shipments.service.test.ts`.

CP02b sửa `src/features/customer-portal/shipments/index.tsx`, `overview/index.tsx`, `components/customer-shipment-card.tsx`, `customer-primary-pages.test.tsx`; sửa `src/configs/api.ts` (5 file). Card link id thật, shipmentNo display; filters reset page, response stale cùng resource có nhãn; không sum page đầu làm KPI.

CP02c tạo customer overview DTO/service/query/keys/test (5 files, lần lượt `src/dto/customer-overview/customer-overview.dto.ts`, `src/api/services/customer-overview.service.ts`, `src/hooks/queries/customer-overview/use-customer-overview-query.ts`, `src/api/query-keys/customer-overview.keys.ts`, `src/api/services/customer-overview.service.test.ts`). Nối composition overview ở subtask sau nếu vượt 5 files. Backend thiếu aggregate thì unavailable, không dùng customerKpis fixture.

Verify: empty/403/500 khác nhau; list customer A không chứa B, changing API response thay UI; reload và pagination đúng. Không tạo shipment/cancel cho customer chỉ vì staff API có.

### CP03 — Shipment detail/timeline/map

CP03a tạo `src/hooks/queries/customer-shipments/use-customer-shipment-query.ts`, `use-customer-shipment-timeline-query.ts` cùng thư mục; sửa customer shipment DTO/service và service test (5 file).

CP03b sửa `src/features/customer-portal/shipment-detail/index.tsx`, `tracking/index.tsx`, `types/index.ts`, `customer-shipment-context.test.tsx`, `utils/customer-portal-utils.ts`. Route param bắt buộc id thật, bỏ default SHP-2026 fixture; detail query trực tiếp không find trong list page. Timeline chỉ customer-visible events, không hardcode corridor/status.

Map hai markers + connector, thiếu coords hiện partial state, không cần GPS. Mapper T01 hiện nằm feature route-tracking: **không import business feature đó vào portal**. CP03c tạo shared pure `src/lib/map-endpoints.ts` và test; sửa mapper staff thành wrapper hoặc chuyển consumers trong subtask ≤5 file, giữ compatibility (không rename/delete khi chưa được phép). Shared renderer hiện có dùng lại, customer/staff DTO mapping riêng.

Verify: same id across overview/detail/map; deep-link shipment B denied; public milestones only; đổi selection cập nhật cả hai marker và connector. Test hai điểm trùng/thiếu/cross-dateline, no GPS requests.

### CP04 — Documents shared với customer

CP04a tạo `src/dto/customer-documents/customer-document.dto.ts`, `src/api/services/customer-documents.service.ts`, `src/api/query-keys/customer-documents.keys.ts`, `src/hooks/queries/customer-documents/use-customer-documents-query.ts`, service test cùng domain.

CP04b sửa `src/features/customer-portal/documents/index.tsx`, `customer-commercial-documents.test.tsx`; tạo `src/hooks/mutations/customer-documents/use-customer-document-access.ts` và test (4 file). Open → request authorized preview/download → URL có hạn → render/download; không dùng object path raw hoặc fixture preview. Không fetch resource URL tùy ý từ text input. Khi URL hết hạn, xin lại access qua BE, không làm public bucket.

Scope hiện có là list/preview/download, không cấp customer quyền OCR correction hoặc upload vào shipment staff khi chưa yêu cầu workflow đó. Staff share/revoke phải persist BE; cần UI share riêng nếu chưa có, chia subtask Documents owner theo contract sau CP-BE02, không auto share mọi file.

Verify: A không preview/download file B dù biết ID; revoked share không cấp link mới, signed URL cũ tuân TTL/revocation policy đã chốt; fetch fail không báo downloaded. Link document ↔ shipment giữ customer scope.

### CP05 — Quotes và customer confirm

CP05a tạo `src/dto/customer-quotes/customer-quote.dto.ts`, `src/api/services/customer-quotes.service.ts`, `src/api/query-keys/customer-quotes.keys.ts`, `src/hooks/queries/customer-quotes/use-customer-quotes-query.ts`, service test.

CP05b sửa `src/features/customer-portal/quotes/index.tsx`, `customer-commercial-documents.test.tsx`; tạo `src/hooks/mutations/customer-quotes/use-confirm-customer-quote.ts` và test. Form xác nhận hiển thị đúng amount/currency/version/expiry, chỉ action từ BE policy; idempotency giữ cho một confirmation intent. Success invalidate quote/list/overview liên quan; timeout reconcile GET, không đổi Confirmed local.

Dependency CP-BE03 là bắt buộc, không lấy negotiation session status để thay quote confirmation. Customer read projection không có bottomPrice/margin/AI internal traces. Test expired/stale/duplicate/concurrent/cross-customer; reload staff và customer thấy cùng confirmation persisted.

### CP06 — Invoices read-only của customer

CP06a tạo `src/dto/customer-invoices/customer-invoice.dto.ts`, `src/api/services/customer-invoices.service.ts`, `src/api/query-keys/customer-invoices.keys.ts`, `src/hooks/queries/customer-invoices/use-customer-invoices-query.ts`, service test.

CP06b tạo `src/hooks/queries/customer-invoices/use-customer-invoice-query.ts`; sửa `src/features/customer-portal/invoices/index.tsx`, `customer-commercial-documents.test.tsx`. Detail GET theo invoiceId, không find fixture; returned amount/currency/status/balance đúng snapshot và visibility; không lộ ledger/internal costs ngoài projection.

Dependency CP-BE02 và billing tenant/customer linkage. Customer invoice **read-only như UI hiện tại**; staff RecordPayment không trở thành nút Pay customer. Online checkout/payment gateway là scope riêng chưa được yêu cầu. Staff ghi payment → customer refetch thấy balance/status mới; FCM chỉ thông báo, không tự ghi balance.

Verify: invoice A/B cùng tenant bị tách; detail không nằm page đầu vẫn mở; staff payment partial/full reflected sau reload; export/download chỉ nếu artifact endpoint được authorize.

### CP07 — Notification FCM + preferences

CP07a sửa `src/features/customer-portal/notifications/index.tsx`, `stores/use-customer-portal-store.ts`, `customer-communication.test.tsx`; sửa root notification hooks/keys nếu CP-BE04 xác nhận API reuse đúng projection (tối đa 5 file mỗi subtask). Bỏ notification server list/read khỏi Zustand; reuse domain hooks, không import staff notification page để dựng portal.

CP07b sửa `src/features/notifications/hooks/use-fcm-notification.ts`, test tương ứng, popup bootstrap/test (4 file). FCM bootstrap duy nhất, scope device/current user; deep-link theo audience customer `/portal/...`, không đưa customer vào staff route; revoke/session change clear in-flight và kiểm tra quyền lại lúc click.

CP07c khi preference contract có: tạo `src/dto/customer-notification-preferences/customer-notification-preferences.dto.ts`, `src/api/services/customer-notification-preferences.service.ts`, root query/mutation hooks tương ứng và service test (5 file); wiring controls/test 2 file riêng. Mutation rollback lỗi; không bật email toggle nếu backend chưa deliver channel đó. Local setting nếu có phải ghi rõ không phải server subscription.

Verify: list/unread/read user A không ảnh hưởng B; customer không subscribe shipment B; foreground/background dedupe; denied permission vẫn dùng center; save preference reload và delivery policy đúng. Không có Socket.IO.

### CP08 — Persisted customer assistant (không còn deferred)

CP08a tạo `src/dto/customer-chat/customer-chat.dto.ts`, `src/api/services/customer-chat.service.ts`, `src/api/query-keys/customer-chat.keys.ts`, `src/hooks/queries/customer-chat/use-customer-conversation-query.ts`, service test.

CP08b tạo `src/hooks/mutations/customer-chat/use-customer-chat-mutations.ts`, test; sửa `src/features/customer-portal/assistant/index.tsx`, `stores/use-customer-portal-store.ts`, `customer-communication.test.tsx`. CreateConversation preferredLanguage và SendMessage message là body đã thấy ở downstream; HTTP response schema phải chốt qua proxy test trước parser. Giữ conversationId server, GET history khi reload, pending send giữ text khi lỗi; không set questionAsked để hiện customerAssistantMock.

CP08c list conversation query + test nếu UI cần history selector (2 file); UI wiring riêng. Human-review/request-support button hiện local không được giả đã tạo ticket: trace BE support handoff command, chốt owner+contract+tests rồi tích hợp, nếu chưa có hiện unavailable và ghi task blocked riêng. Không biến câu trả lời AI thành booking/payment/confirmation.

Verify: customer conversation A inaccessible B; prompt đòi shipment B không trả dữ liệu qua tools; AI timeout/error/no evidence không canned answer; reload history đúng. CP-BE05 là gate bắt buộc.

### CP09 — Entry/routes và cleanup mock dependencies

Sửa `src/features/customer-portal/index.tsx`, `types/index.ts`, `utils/customer-portal-utils.ts`, `customer-portal-page.test.tsx`, `customer-primary-pages.test.tsx` theo nhóm ≤5 file. Route pages giữ thin adapters; không file chỉ re-export thụ động làm composition. Kiểm tra mọi route đã có giữ params/deep-links, không tự rename URL.

Bỏ import mock trong production composition; giữ fixtures test, không xóa files. Shared utilities thật sự pure mới reuse; các helper confirm/read server state cũ không được coi là domain command. Zustand chỉ UI selection/draft nếu cần; không notification list/conversation history từ BE.

Verify toàn bộ `pnpm exec vitest run src/features/customer-portal 'src/app/(customer)'` và các service/hooks domain mới; typecheck/lint/tests/build ở checkpoint. Không dùng số tests mock cũ pass làm bằng chứng integration.

## 4. Dependency, checkpoint và cross-persona flow

```text
CP-BE01 → CP01 → CP-BE02 → CP02/CP03/CP04/CP06
                           CP-BE03 → CP05 quotes
CP01 + CP-BE04 → CP07 FCM/preferences
CP01 + CP-BE05 → CP08 customer assistant
CP02..CP08 → CP09 → customer/staff cross-persona verification
```

Sau mỗi 2–3 subtasks kiểm tra tests/contract/reload trước mở action tiếp. Customer safe read slices có thể làm song song sau CP01 và contract gates; file shared auth/API/config/notification cần một owner tích hợp. Backend security findings không thể giải quyết bằng chỉ thêm frontend filter.

### V07 — Customer ↔ staff/manager

1. Staff tạo/gán shipment cho customer A bằng canonical customerId; A thấy, B cùng tenant và C khác tenant không thấy. Không tự gán theo customerName.
2. Staff đổi public milestone/route endpoints → A refetch thấy hai điểm + connector/timeline đúng; internal note không ra payload.
3. Staff share document → A download được; B bị chặn; revoke → không cấp access mới. Test signed URL expiration/revocation semantics, không hứa thu hồi file người dùng đã tải.
4. Staff phát hành quote → A xem/confirm version đúng → staff thấy confirmation; duplicate/stale không hai giao dịch. Quote expiry/price do BE quyết định.
5. Staff tạo invoice/record payment sandbox → A read-only thấy invoice/balance mới; A không được gọi RecordPayment/PAID patch.
6. Business event → Notification persistence → FCM đúng customer recipient → deep-link portal → GET đúng resource. Customer B không nhận nhầm push hoặc đọc notification A.
7. A chat về shipment được phép → answer/history persisted; B không đọc conversation A; AI retrieval không vượt customer boundary.
8. Logout A/login B hoặc staff trên cùng browser: query cache, device registration, notifications và conversation không trộn personas. 401/403 và permission revoke giữ fail-closed.

Fixtures tối thiểu: staff + manager, hai customers cùng tenant, một customer tenant khác, cùng user/persona switch chỉ nếu membership BE hỗ trợ. Mọi test chạy môi trường test, không gửi mail/thu tiền thật. Record evidence từng CP task ở implementation-status; contract chưa có thì blocked, không ghi portal completed.

## 5. Output sau triển khai

Tất cả route hiện có `/portal`, shipments/detail/tracking, documents, quotes, invoices, notifications và assistant dùng dữ liệu BE customer-safe; quote confirmation/history/read-state lưu thật và reload đúng. Bản đồ hai endpoint + connector, FCM foreground/background, invoice read-only và assistant scoped customer. Không admin console, không online checkout tự phát, không quyền staff trá hình. Staff/manager flow và customer flow liên kết bằng IDs thật nhưng tách permissions/projections/cache.
