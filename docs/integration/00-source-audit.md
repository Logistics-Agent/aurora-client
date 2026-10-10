# 00 — Kết quả đối chiếu source

## Nguồn

BE root: `D:/aurora/aurora-server`. Đã đọc/đối chiếu các phần liên quan trong:

- `docs/AUTH_FRONTEND_INTEGRATION_GUIDE.md`; `docs/bff-api/{README,shared-api,staff-api,manager-api,blocked-api}.md`.
- `docs/technical/frontend/FE_FLOW_COOKBOOK.md`, các phần status/auth/realtime trong `FE_INTEGRATION_GUIDE.md`, `IMPLEMENTATION_STATUS.md`.
- Các phần event/RPC/gap trong `docs/technical/SERVICE_INTEGRATION_MATRIX.md`, `INTEGRATION_GAPS.md`; thread/negotiation trong `docs/technical/mail/{THREAD_ASSIGNMENT,NEGOTIATION_FLOW}.md`.
- `src/dotnet/BFF/Staff.Bff/Controllers/*.cs` cho các feature trong plan; `BuildingBlocks.BFF/Controllers/AuthController.cs`, `Extensions/{AuthExtensions,MvcExtensions}.cs`, `Mail/Models/MailDtos.cs`.
- `protos/{billing,shipment_workflow,route-planning-agent}.proto`; DTO ở BFF là chuẩn HTTP, không giả định HTTP serialize y hệt protobuf JSON.
- Shipment submit/outbox helpers; route approval handler/service; Nest billing controller/service/POD handler; realtime gateway, guard và MQ consumer.

Các chi tiết chưa trace hết (đăng ký consumer, migration, generated protobuf, deployment/gateway policy) là **verification task**, không ghi thành đã chạy. Backend không được thực thi hay sửa trong audit này.

## Chênh lệch đã thấy

| Feature | Bằng chứng source | Hệ quả cho integration |
|---|---|---|
| Session | Staff auth POST login/refresh; shared auth có GET me và Hosted UI. HTTP client FE refresh `customer/auth/refresh-token`, chờ `accessToken` | Chuyển sang staff cookie session; không reuse customer refresh |
| Logout | Shared + Staff controller đều khai báo POST logout; shared trả redirect, Staff xóa cookies | Test endpoint discovery/versioning, thống nhất một action, tránh ambiguous routing/response |
| JWT BFF | `AuthExtensions.cs`: `ValidateIssuer=false`, `ValidateAudience=false`, `SignatureValidator` chỉ đọc JWT | Điểm chặn security; phải xác thực chữ ký/issuer/audience đúng mô hình Cognito trước dùng thật |
| Realtime auth | `ws-jwt.guard.ts`: missing token và chuỗi mock-token được nhận làm dev identity | Không mở kết nối production trước BE-03 |
| Realtime events | MQ consumer chỉ bind billing/negotiation/shipment/financial; strip prefix rồi uppercase | Không copy nguyên event catalog trong docs; mail/GPS/OCR chưa được chứng minh bridge vào hub này |
| Shipment | Submit handler yêu cầu cargo + Pickup + Delivery locations | Create form chỉ nhập hai address chưa đủ để submit |
| Shipment ID | Table FE lấy shipmentNo làm id; domain có UUID thật | Detail, GPS, OCR, route, billing phải dùng UUID, shipmentNo chỉ hiển thị |
| OCR | BFF `/documents/shipment-documents`, fields `{name,value}` | FE đang đọc `jobId/sourceType`, `fieldName/fieldValue`; cần parser/mapping đúng |
| OCR upload | Submit nhận JSON `storageReference`, không multipart | Cần upload/storage contract trước; nút mở mock document không phải upload |
| Approvals | GET pending; POST `{approvalId}/approve`; ApprovalService đưa route về Ready | Không PATCH route thành Approved; không dùng routeId thay approvalId |
| Route association | Shipment domain có RouteId/CustomerId nhưng create/update BFF không nhận các trường này | Cần trace/provide command liên kết chính thức; không lưu assignment chỉ trong Zustand |
| Mail | BFF request reassign `{targetUserId,reason}`; list dùng pageToken; DTO không expose version | Không gửi expectedVersion giả hoặc dùng pagination page theo cookbook |
| Mail UI | Repository catch lỗi rồi mutate cache; priority/resolve local-only | Phân biệt API fail và success; action chưa có BE phải disable hoặc thêm contract |
| Negotiation | Staff controller chỉ có POST `{id}/mail-draft` | List/detail/offer/suggestion UI cần HTTP exposure; không suy ra endpoint từ gRPC |
| Billing | Nest có RecordPayment handler nhưng `protos/billing.proto` chưa khai báo RPC; Staff BFF không expose payment | Sửa proto+BFF trước nối payment; không nói Nest chưa implement |
| Invoice status | Nest chặn PAID nếu ledger chưa đủ tiền | Nút FE PATCH PAID rồi catch báo thành công là sai luồng |
| Billing tenant | Service có fallback tenant cố định; get/update theo id không thấy filter tenant tại query đã đọc | Audit interceptor/Prisma scope; thêm tenant isolation tests, chặn expose payment trước khi đạt |
| POD billing | Handler đòi `podDocumentS3Key`, fallback customer/port/weight nếu thiếu | Event “shipment completed” đơn thuần không bảo đảm tạo hóa đơn đúng |
| Compliance | Action không có RequirePermission; base chỉ Authorize | Kiểm tra permission enforcement downstream/global; cần capability + resource-scope tests |

## Client readiness (static)

| Nhóm | Hiện trạng |
|---|---|
| Notifications | Đã có service/DTO/query keys/hooks/FCM tests; cần kiểm chứng auth và event thật |
| Auth | Có gọi API nhưng session refresh/error/logout cần sửa |
| Shipments, documents, tracking, dashboard | Một phần gọi thật, còn fixture/mapping/lifecycle chưa đúng |
| Route planning | Request có nhưng kết quả list/optimize chưa drive UI; store vẫn fixture |
| Mail | Có repository gọi HTTP nhưng che lỗi, fabricate dữ liệu/hành động thành công |
| Commercial | Billing list có request; cost/negotiation/detail còn mock; payment sai semantics |
| Assistant, forgot-password, tenant selection | Chủ yếu local/mock; không coi là completed integration |

Các vấn đề TypeScript từng thấy ở documents/mail/map/route planning cần lập lại baseline ở G0; chưa chạy lại typecheck trong lượt viết tài liệu này. Không gộp lỗi nền vào kết quả validation của plan.
