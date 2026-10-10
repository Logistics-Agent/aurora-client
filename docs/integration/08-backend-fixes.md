# 08 — Backend fixes và contract gates

Phạm vi bổ sung customer + staff/manager: thực hiện thêm **CP-BE01–CP-BE05** trong [13-customer-portal.md](13-customer-portal.md). Đây là gates bắt buộc cho customer identity/membership, customer-scoped projections, quote confirmation, FCM audience/preferences và trusted customer assistant. Không mở customer access bằng cách cấp staff capabilities.

Đường dẫn từ `D:/aurora/aurora-server`. **Chưa sửa BE trong lượt lập plan.** Các mục dưới là work packages; mỗi subtask tối đa khoảng 5 file implementation/test. File test mới là đề xuất; chọn đúng test project hiện hữu khi bắt đầu, không ghi vào generated code. Điều kiện phát hành UI tương ứng là regression tests đạt, không chỉ đổi source.

## BE-01 — Auth session và route collision (P0)

Files sửa: `src/dotnet/BFF/Staff.Bff/Controllers/AuthController.cs`, `src/dotnet/BFF/BuildingBlocks.BFF/Controllers/AuthController.cs`, `src/dotnet/BFF/BuildingBlocks.BFF/Extensions/MvcExtensions.cs` nếu cần tách registration. Test đề xuất trong test project BFF: `AuthEndpointTests.cs`, `AuthSessionTests.cs`.

- Shared và Staff đều POST logout; Swagger deployed cũng expose `/Auth/logout` và `/auth/logout`. Kiểm tra endpoint selection case-insensitive/versioning; chọn một JSON logout cho staff, Hosted UI logout dùng route không xung đột. Không test logout production bằng tài khoản người dùng để chứng minh collision.
- Refresh đang chỉ set raw token cookies trong Staff action, trong khi Hybrid chọn `.Aurora.Auth` trước. Trace ticket expiry/refresh middleware registration; renew cookie ticket/principal nhất quán, không refresh raw cookie rồi để ticket vẫn expired. IamTenant RefreshToken đã có implementation: không kết luận missing vì comment cũ.
- Xóa cookies với đúng Domain + Path lúc set; logout idempotent cho session hết hạn, không để FCM lỗi chặn revoke.
- Invitation contract cần error code/challenge rõ; không mọi PermissionDenied đều 409 invitation. Validate returnUrl phía BE và FE; không nhận arbitrary Referer làm redirect target.

Acceptance/tests: endpoint discovery không ambiguous; login → me → expiry → refresh → me; invitation sai challenge; logout clears cookies trên configured domain; open redirect bị từ chối. Không trả token/secret cho JS để né vấn đề session.

## BE-02 — BFF auth và capability enforcement (P0)

Sửa `src/dotnet/BFF/BuildingBlocks.BFF/Extensions/AuthExtensions.cs`; trace `src/dotnet/BFF/BuildingBlocks.BFF/Attributes/RequirePermissionAttribute.cs`, Staff ComplianceController/ApprovalsController và current-user middleware. Tách hai subtasks: JWT validation + tests; permission scopes + tests.

- Source hiện có custom SignatureValidator chỉ decode, issuer/audience disabled. Thay bằng xác minh ký/issuer/token_use/client theo Cognito pool thực tế, fail closed; hỗ trợ tenant pool qua trusted resolver, không chọn issuer từ token không tin cậy tùy ý.
- Compliance base chỉ Authorize, action không RequirePermission trong source audit. Xác nhận downstream enforcement rồi bổ sung capability phù hợp PermissionConstants, tránh tạo tên quyền tùy ý. Test legacy approval aliases không cho staff bypass manager capability.
- BFF → service metadata phải là trusted identity, không nhận tenant header browser tùy ý; kiểm tra CORS/CSRF trên cookie mutations theo deployment trước mở cross-origin. Không nới origin wildcard để “fix CORS”.

Acceptance: JWT giả chữ ký/issuer/tenant bị reject; authenticated thiếu capability 403; tenant A không đọc/mutate ID tenant B, kể cả gọi thẳng BFF URL.

## BE-03 — Realtime authentication/room authorization (P0, chặn X02)

Không phải dependency của notification FCM. Đây là rủi ro service realtime đã phát hiện; chặn việc mở X02 nếu sau này cần streaming nghiệp vụ, không yêu cầu client thêm Socket.IO để nhận thông báo.

Sửa `src/nestjs/realtime-hub-service/src/common/guards/ws-jwt.guard.ts`, `src/nestjs/realtime-hub-service/src/gateway/events.gateway.ts`; tạo colocated guard/gateway `*.spec.ts` và sửa config auth hiện hữu khi chốt handshake.

- Bỏ missing-token/mock-token acceptance và default tenant/user/secret trong đường chạy thật. Identity thiếu claim bắt buộc phải reject.
- Chốt BFF session-compatible handshake: verified cookie proxy hoặc short-lived scoped realtime ticket do BFF cấp. Đây là contract cần thiết kế/kiểm tra riêng, không endpoint đã có; không truyền access_token qua URL query.
- Join shipment verify tenant ownership + visibility; ACK chỉ được user/connection nhận msgId xác nhận; CORS allowlist, expiry/disconnect, replay dedupe.

Acceptance: anonymous connection reject; unknown shipment/sai tenant không join; user khác không ack message; token hết hạn mất quyền. FE chỉ tích hợp khi đạt.

## BE-04 — Event bridge và reliability (P1)

Sửa `src/nestjs/realtime-hub-service/src/messaging/mq-consumer.service.ts`, `src/nestjs/realtime-hub-service/src/gateway/events.gateway.ts`; tạo `src/nestjs/realtime-hub-service/src/messaging/mq-consumer.service.spec.ts`. Trace producer outbox qua `src/dotnet/ShipmentWorkflow/Infrastructure/BackgroundJobs/ShipmentIntegrationEventTypeRegistry.cs` và service event publishers trước thêm mapping.

- Consumer hiện bind `logistics_events` billing/negotiation/shipment/financial; event name strip prefix/uppercase không khớp cookbook. Không thấy mail/GPS/OCR bindings ở consumer này.
- Đối chiếu MassTransit envelope/CloudEvent/raw JSON, exchange/routing key/casing/tenant path. Contract mapping explicit, unknown payload không broadcast default tenant. Chỉ ACK broker sau xử lý thành công; poison message vào DLQ, retry bounded.
- Kiểm tra offline buffer TTL, message ownership, idempotent replay; event là invalidate hint, GET vẫn source of truth.

Acceptance: test thực qua broker cho shipment status, mail claim, OCR, GPS, invoice, negotiation; mỗi producer có một fixture bắt được và validated consumer. Docs event matrix cập nhật theo test, không nhãn verified chỉ từ tên class.

## BE-05 — Shipment ↔ route/customer và approval stale (P1, chặn association)

Files hiện hữu: `src/dotnet/BFF/Staff.Bff/Controllers/ShipmentsController.cs`, `protos/shipment_workflow.proto`, `src/dotnet/ShipmentWorkflow/Domain/Shipment.cs`, `src/dotnet/ShipmentWorkflow/GrpcServices/ShipmentGrpcService.cs`; command mới đề xuất `src/dotnet/ShipmentWorkflow/Application/Commands/Shipments/AssignShipmentRouteCommand.cs`.

Domain có RouteId/CustomerId nhưng BFF create/update bodies chưa expose. Trace command/state-machine hiện có; reuse nếu có, không thêm state mutation bypass. Cần association command được tenant validate, route Ready/capacity/version hợp lệ; customer ID phải resolve thật chứ không customerName. Chốt proto field/HTTP request sau trace, rồi S/R/B dùng chung IDs.

Subtask approval: sửa `src/dotnet/RoutePlanningAgent/Infrastructure/Services/ApprovalService.cs`; cập nhật `RoutePlanningAgent.Tests/Services/ApprovalServiceTests.cs`, `RoutePlanningAgent.Tests/Commands/ApproveRejectRouteCommandTests.cs`. Service LoadPending đã đọc chỉ check pending, chưa so RouteVersion/PolicyVersion tại đó; xác minh các lớp khác rồi thêm stale validation/concurrency nếu thiếu.

Acceptance: pending approval route version cũ không duyệt route mới, hai manager xử lý cùng ticket không cùng thành công; shipment assignment persist, tenant/capacity/status được enforce. Test domain + BFF + cross-service contract; FE không viết trực tiếp DB.

## BE-06 — Billing proto/tenant/payment/POD (P0 tiền & isolation; P1 exposure)

Subtask contract: sửa `protos/billing.proto`, `src/nestjs/billing-service/src/interface/dto/billing.dto.ts`, `src/nestjs/billing-service/src/interface/controllers/billing.controller.ts`, `src/dotnet/BFF/Staff.Bff/Controllers/BillingController.cs`; thêm contract integration test trong test project sở hữu. Generate qua build chuẩn, không edit generated stubs.

RecordPayment handler tồn tại nhưng proto chưa có RPC, BFF chưa có action; expose ledger operation sau test auth/idempotency. Tên route/body mới là đề xuất cho đến khi code+OpenAPI được chốt. Không dùng UpdateInvoiceStatus để giả payment.

Subtask isolation/transaction: sửa `src/nestjs/billing-service/src/application/services/billing.service.ts`, `src/nestjs/billing-service/src/common/interceptors/tenant.interceptor.ts` nếu cần; thêm service tests. Kiểm tra Prisma scope trước kết luận exploit: query đã đọc dùng id-only, service có tenant fallback. Bỏ tenant mặc định, derive từ trusted metadata; filter toàn bộ invoice/wallet read/write, transaction payment kiểm soát concurrent balance và idempotency. Không tính tiền bằng số giả hoặc default customer.

Subtask POD: sửa `src/nestjs/billing-service/src/infrastructure/messaging/event-handlers/shipment-completed.handler.ts`, messaging rabbitmq service và producer ở ShipmentWorkflow theo trace; thêm event contract test. Handler đang skip thiếu POD và fallback `CUST-001`/port/weight. Thay bằng snapshot đầy đủ hoặc resolve authoritative shipment; missing data phải retry/reject có quan sát, không tạo invoice sai. Unique/idempotent constraint bảo vệ concurrent event replay, không chỉ findFirst rồi create.

Acceptance: RPC được proto load thật; tenant A không get/pay wallet/invoice B; partial/full/duplicate/concurrent payment đúng ledger; event POD từ producer thật tạo đúng một invoice đúng customer/currency. Chỉ sandbox/test money.

## BE-07 — Mail missing actions/lookups và negotiation HTTP (P1)

Subtask lookup/action: sửa `src/dotnet/BFF/Staff.Bff/Controllers/MailController.cs`, `src/dotnet/BFF/BuildingBlocks.BFF/Mail/Models/MailDtos.cs`, `protos/mail_platform.proto` nếu cần; thêm handler/test tại MailService sau trace existing capabilities.

Client cần allowed mailboxes/sender + assignable staff scoped; không dùng admin provisioning directory. Resolve/priority/update-draft chỉ expose nếu domain supports và có audit/concurrency; nếu chưa làm, UI disable. Không gửi expectedVersion khi contract chưa expose. Dùng atomic claim handler hiện có, không thay bằng read-then-write ở FE.

Subtask negotiation: sửa `src/dotnet/BFF/Staff.Bff/Controllers/NegotiationsController.cs`; đối chiếu `protos/negotiation.proto` và persisted Java negotiation handlers trước thêm list/detail/offer/suggestion endpoints cần UI. Tạo DTO BFF typed + controller tests. Giữ human review invariant: suggestion → draft → human Send; resolve source message recipient thất bại không tự chọn email mẫu.

Acceptance: staff không query toàn tenant directory ngoài scope; priority/resolve persisted; stale draft conflict; negotiation HTTP trả session/thread/message IDs thật, duplicate draft request không nhân bản.

## BE-08 — Upload/OCR/compliance lifecycle (P1)

Subtask upload: sửa `src/dotnet/BFF/Staff.Bff/Controllers/DocumentsController.cs`; trace `src/dotnet/DocumentOcr/Application/Providers/DocumentInputPolicy.cs` và storage adapter hiện có, rồi thiết kế upload-init/complete hoặc server upload contract. Endpoint mới chưa có trong Swagger audit; không tự coi submit OCR là multipart. Tenant ownership, allowed storage reference, content validation, limits, signed preview và orphan cleanup phải có test.

Subtask lifecycle: trace `src/dotnet/DocumentOcr/Application/Jobs/DocumentOcrJobService.cs`, shipment document command/outbox và RegulatoryCompliance handlers. Chốt externalDocumentId vs OCR job id; OCR review update shipment snapshot đúng một lần. Findings resolve/evaluation history chỉ expose khi persistence và authorization có thật, không client-only state.

CustomsHold auto-evaluate đang được docs ghi gap; audit này chưa chứng minh consumer chain đầy đủ. Nếu yêu cầu tự động, thêm registered consumer/idempotency/snapshot version test sau khi trace producer; nếu chưa, UI thể hiện explicit evaluation và pending/stale, không ghi “auto-compliant”.

Acceptance: upload → attached document → OCR review → compliance cùng shipmentId/tenant; correction retry không nhân bản; unauthorized storage URL bị chặn; service chết có retry/error state quan sát được.
