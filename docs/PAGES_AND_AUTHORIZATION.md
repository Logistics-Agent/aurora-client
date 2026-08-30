# Aurora Client — Page và Authorization Matrix

Tài liệu này là bản đồ các route hiện có trong `src/app`, shell của từng route
group và tình trạng authorization ở frontend. Permission mục tiêu được đối
chiếu với các tài liệu IAM authoritative của server:

- `aurora-server/docs/technical/iam/AUTHORIZATION_MODEL.md`
- `aurora-server/docs/technical/iam/FE_AUTHORIZATION_GUIDE.md`
- `aurora-server/docs/technical/frontend/ROLE_PERMISSION_API_MATRIX.md`

## Nguyên tắc authorization bắt buộc

Aurora dùng mô hình:

```text
Authentication → Direct capability permission → Resource scope → Business governance
```

Base role không phải là authority. Role chỉ mô tả persona, shell và dashboard
mặc định. Quyền thực thi phải được kiểm tra bằng permission token trong
`UserProfile.permissions`.

Các role canonical hiện có trong FE:

```text
SYSTEM_ADMIN | TENANT_ADMIN | MANAGER | STAFF
```

Ví dụ:

```ts
hasPermission(user, "route_planning:approve")
```

Không được suy ra quyền từ:

```ts
user.role === "MANAGER"
```

## Authorization hiện đang được implement ở đâu?

| Khu vực | Hiện trạng |
| --- | --- |
| User context | `GET /api/v1/auth/me` được đọc qua `useCurrentUserQuery` |
| Permission helper | `src/types/auth.types.ts` có `hasPermission(user, permission)` |
| Session transport | Axios dùng cookie với `withCredentials: true` |
| 401 handling | API client redirect về auth login khi request nhận 401 |
| Notification bell/panel | Có check `notifications:access` trước khi đọc unread count; click bell mở panel Sheet bên trái |
| Notification center | Có check `notifications:access` trước khi query danh sách |
| FCM popup/bootstrap | Chỉ bootstrap nếu user có `notifications:access` |
| Shipment notification subscription | Ẩn control nếu thiếu `notifications:access` |
| Route-level guard | Chưa có middleware hoặc guard chung |
| Page-level permission | Phần lớn page chưa check permission |
| Navigation permission | Field `capability` đã có trong type nhưng `AppSidebar` chưa dùng; admin item hiện bị filter bằng label |
| Customer authorization | `CustomerShell` và customer pages hiện chưa gọi current-user/permission guard |
| Declarative PermissionGate | Chưa có component dùng chung đang được nối vào toàn bộ app |

> Vì vậy, việc một link xuất hiện hoặc một page render được hiện chưa chứng
> minh user có quyền gọi API. Backend vẫn phải là enforcement cuối cùng.

## Route groups

| Route group | Shell | Đối tượng | Tình trạng hiện tại |
| --- | --- | --- | --- |
| `(auth)` | Root layout | Người chưa đăng nhập hoặc đang xử lý session | Không có dashboard shell |
| `(customer)` | `CustomerShell` | Customer portal | Shell tĩnh, chưa có customer auth model/guard đầy đủ |
| `(dashboard)` | `AppShell` + `NotificationPopup` | Staff/manager/admin operations | Sidebar trái thu gọn, hover/focus để mở rộng; chưa có route guard theo capability |

## 1. Auth pages — `(auth)`

| Route | Page composition | Mục đích | Permission |
| --- | --- | --- | --- |
| `/login` | `LoginPage` | Bắt đầu login và return về URL trước đó | Public / anonymous |
| `/forgot-password` | `ForgotPasswordPage` | Khởi động flow quên mật khẩu | Public / anonymous |
| `/select-tenant` | `SelectTenantPage` | Chọn tenant sau login | Cần authenticated session; FE hiện chưa guard |

Auth route adapter nằm tại `src/app/(auth)`. Hiện chưa có `(auth)/layout.tsx`
riêng và chưa có middleware chặn truy cập trực tiếp vào `/select-tenant`.

## 2. Customer pages — `(customer)`

Customer pages dùng `CustomerShell` và navigation riêng. Hiện UI đang hiển thị
account fixture `Acme Trading Ltd.`; FE `UserRole` chưa có role customer
riêng. Do đó phần dưới là phân loại UI hiện tại, còn permission cần chốt thêm
với customer identity/resource-scope model của backend.

| Route | Mục đích | Dữ liệu/UI hiện tại | Permission mục tiêu | FE check hiện tại |
| --- | --- | --- | --- | --- |
| `/portal` | Customer overview, shipment health, attention items | Fixture | Customer shipment read | Chưa có |
| `/portal/shipments` | Danh sách shipment của customer | Fixture | `shipments:read` + customer scope | Chưa có |
| `/portal/shipments/[shipmentId]` | Chi tiết shipment | Fixture | `shipments:read` + ownership/customer scope | Chưa có |
| `/portal/shipments/[shipmentId]/tracking` | Theo dõi shipment và milestone | Legacy `LogisticsMap`, customer-safe | `shipments:read` + customer scope | Chưa có |
| `/portal/documents` | Danh sách document customer được phép xem | Fixture | Document read/scope | Chưa có |
| `/portal/quotes` | Xem quote và trạng thái quote | Fixture | Quote capability cần BE xác định | Chưa có |
| `/portal/invoices` | Xem invoice customer | Fixture | `billing_settlement:read` + customer scope | Chưa có |
| `/portal/assistant` | Customer-facing AI assistant | Fixture | Capability cần BE xác định | Chưa có |
| `/portal/notifications` | Customer notification center | Fixture | `notifications:access` + customer scope | Chưa có |

Customer tracking hiện còn dùng `LogisticsMap` SVG/CSS thay vì
`LogisticsGeoMap`. Chi tiết map nằm trong
[MAP_PAGES.md](./MAP_PAGES.md).

## 3. Dashboard pages — `(dashboard)`

Tất cả route dưới đây đi qua `AppShell`. Các permission trong cột “mục tiêu”
là permission cần dùng ở page/action level; hiện phần lớn chưa được FE enforce.

### Operations, shipment và tracking

| Route | Mục đích | Permission mục tiêu | FE hiện tại |
| --- | --- | --- | --- |
| `/overview` | Command center: KPI, network overview, exceptions | `shipments:read`, tracking read theo shipment scope | Chưa có page guard; map data còn fixture |
| `/shipments` | Danh sách shipment | `shipments:read` | Chưa có |
| `/shipments/new` | Tạo shipment | `shipments:create` | Chưa có |
| `/shipments/import` | Import nhiều shipment | `shipments:import` | Chưa có |
| `/shipments/[shipmentId]` | Shipment detail, route, cargo, documents, timeline | `shipments:read`; action riêng dùng update/cancel/delete | Chưa có |
| `/shipments/[shipmentId]/tracking` | Theo dõi một shipment, last-known GPS, deviation | `shipments:read`; geofence action nếu có | Chưa có |
| `/live-map` | Theo dõi nhiều shipment/GPS | `shipments:read` | Chưa có; realtime vẫn là fixture |
| `/route-planning` | Tạo/optimize/review/approve route | `route_planning:read`, `route_planning:create`, `route_planning:optimize`, `route_planning:approve`, `route_planning:reject` | Chưa có |
| `/notifications` | Danh sách notification và browser permission | `notifications:access` | Có check `notifications:access` |

Các action phải kiểm tra riêng, không chỉ kiểm tra quyền đọc page:

| Action | Permission |
| --- | --- |
| Create shipment | `shipments:create` |
| Update shipment | `shipments:update` |
| Submit shipment | `shipments:submit` |
| Cancel shipment | `shipments:cancel` |
| Delete shipment | `shipments:delete` |
| Import shipment | `shipments:import` |
| Optimize route | `route_planning:optimize` |
| Approve route | `route_planning:approve` |
| Reject route | `route_planning:reject` |

### Documents, OCR và compliance

| Route | Mục đích | Permission mục tiêu | FE hiện tại |
| --- | --- | --- | --- |
| `/documents` | Document center | `documents:manage` hoặc read scope | Chưa có |
| `/documents/upload` | Upload document vào pipeline | `documents:ingest` | Chưa có |
| `/documents/[documentId]/ocr` | Review/correct/reject OCR | `ocr:review` | Chưa có |
| `/compliance` | Compliance findings và evaluation | Read/evaluate capability cần chốt theo endpoint | Chưa có |
| `/compliance/[findingId]` | Chi tiết finding và action | `compliance:override` khi override | Chưa có |

OCR action phải tách rõ:

- Xem kết quả OCR: document/shipment read scope.
- Confirm, Correct, Reject: `ocr:review`.
- Retry/cancel: permission document/shipment tương ứng theo backend contract.

### Mail, AI và commercial

| Route | Mục đích | Permission mục tiêu | FE hiện tại |
| --- | --- | --- | --- |
| `/email-agent` | Inbox/thread triage | `mail:read` | Chưa có |
| `/email-agent/[emailId]` | Thread detail, draft, send, assignment | `mail:read`, `mail:draft:create`, `mail:send`, reassign/unassign tương ứng | Chưa có |
| `/assistant` | Internal AI assistant | Permission cụ thể chưa có trong matrix hiện tại | Chưa có |
| `/billing` | Billing/settlement workspace | `billing_settlement:read`; sensitive action cần settlement permission | Chưa có |
| `/invoices/[invoiceId]` | Invoice detail | `billing_settlement:read`; update/create tùy action | Chưa có |
| `/cost-estimate` | Cost và customs estimate | `financial_tax:calculate` | Chưa có |
| `/negotiations` | Danh sách negotiation | Permission cụ thể cần BE xác định | Chưa có |
| `/negotiations/[negotiationId]` | Negotiation detail | Permission cụ thể cần BE xác định | Chưa có |

### Administration

| Route | Mục đích | Permission mục tiêu | FE hiện tại |
| --- | --- | --- | --- |
| `/admin/users` | User lifecycle và danh sách staff | `iam:user:read`, `iam:user:invite`, `iam:user:update` | Route tồn tại nhưng navigation đang ẩn |
| `/admin/roles` | Role catalog và permission matrix | `iam:role:read`, `iam:role:manage`, `iam:permission:manage` | Route tồn tại nhưng navigation đang ẩn |
| `/admin/tenant` | Tenant settings | Tenant/IAM/mail management tùy action | Route tồn tại nhưng navigation đang ẩn |
| `/admin/audit` | Audit records | Audit permission cần map theo module | Route tồn tại nhưng navigation đang ẩn |
| `/admin/ai-operations` | AI execution operations | Permission cụ thể cần BE xác định | Route tồn tại nhưng navigation đang ẩn |
| `/admin/ai-operations/[executionId]` | AI execution detail | Permission cụ thể cần BE xác định | Route tồn tại nhưng navigation đang ẩn |

Các route admin vẫn có thể truy cập bằng URL nếu không có backend/frontend guard.
Việc ẩn link trong sidebar không phải authorization.

## Navigation hiện tại

Staff navigation đang khai báo các mục:

```text
Overview
Shipments
Live Map
Route Planning
Documents
Compliance
AI Assistant
Administration
Users & Roles
AI Operations
```

Customer navigation đang khai báo:

```text
Overview
My Shipments
Documents
Quotes
Invoices
AI Assistant
Notifications
```

Vấn đề cần xử lý:

1. `NavigationItem.capability` đã tồn tại nhưng `AppSidebar` chưa check
   permission.
2. `Users & Roles` và `AI Operations` bị loại bằng label thay vì capability.
3. Không có route-level `PermissionGate` cho page hoặc action.
4. Customer navigation chưa gắn identity và resource scope.
5. Role trong FE hiện chỉ dùng để parse profile; chưa dùng để chọn shell/dashboard
   theo target architecture.
6. UI permission không thay thế backend `[Authorize]`,
   `[RequirePermission]`, tenant isolation hoặc business governance.

## Definition of done cho authorization FE

Trước khi coi authorization hoàn tất, cần có:

- [ ] Auth bootstrap rõ ràng cho cả dashboard và customer shell.
- [ ] Route guard xử lý unauthenticated và forbidden.
- [ ] PermissionGate dùng được cho page section và action button.
- [ ] Navigation filter theo direct permission, không filter bằng label.
- [ ] Mapping page/action → permission được chốt với từng BFF endpoint.
- [ ] Customer identity/tenant/resource scope được định nghĩa riêng nếu không dùng
      bốn internal base roles.
- [ ] 401/403/404/422 được hiển thị đúng UX.
- [ ] Backend vẫn enforce authentication, permission, scope và governance.
- [ ] Test từng role/permission matrix, bao gồm user có role nhưng thiếu direct
      permission.
- [ ] Không hiển thị dữ liệu fixture như dữ liệu production-live.

## Kết luận hiện tại

Các page và shell đã tồn tại khá đầy đủ về mặt UI. Tuy nhiên authorization FE
mới hoàn thiện cho notification flow. Phần còn thiếu lớn nhất là route/action
permission gating và customer authorization model; cần hoàn thiện trước khi
coi các page dashboard/admin/customer đã được bảo vệ đầy đủ.
