# 01 — Data foundation và auth

Bổ sung customer theo [13-customer-portal.md](13-customer-portal.md): F01–F04 phải phối hợp CP-BE01/CP01 để bootstrap persona/membership thật, redirect đúng shell và tách cache theo persona/tenant/customer. Auth staff không được dùng làm fallback khi customer chưa có contract. Không xóa token/flow đang dùng bởi customer trước khi thay thế và kiểm chứng session compatibility.

Dependencies: BE-01/02 trong file 08. Auth là gate cho mọi feature, không giả authenticated user khi `/me` lỗi.

## F01 — HTTP/error contract

Sửa từng file:

1. `src/lib/api.ts`: staff cookie flow `withCredentials`; refresh đúng POST `/api/v1/auth/refresh`, không đòi accessToken JSON. Single-flight, retry tối đa một lần; không refresh login/identify/invitation/refresh/logout; không retry vô hạn hoặc tự replay mutation không idempotent. Không để bearer token customer cũ ưu tiên hơn cookie.
2. `src/lib/api-error.ts`: giữ một ApiError; normalize ProblemDetails, `{detail}`, mail `{errors:[]}`, network/abort; giữ status/code/traceId và field errors nếu BE có.
3. `src/configs/api.ts`: bổ sung controllers của từng domain khi domain triển khai; tránh `/api/v1` bị nối hai lần.
4. Tạo `src/lib/api.test.ts`: cookie refresh success/fail, 10 request 401 cùng lúc, 403 không refresh, abort không hiện lỗi hệ thống.

Acceptance: GET đi đúng BFF URL, không localStorage token cho staff, lỗi backend không bị biến thành dữ liệu trống/success. Verify: `pnpm exec vitest run src/lib/api.test.ts` + API session expiry smoke khi BE-01 xong.

## F02 — Identity/permission bootstrap

Sửa `src/dto/auth/auth.dto.ts`, `src/api/services/auth.service.ts`, `src/hooks/queries/auth/use-current-user-query.ts`, `src/hooks/queries/auth/use-permission.ts`; cập nhật `src/api/services/auth.service.test.ts`.

- Parse `/me`: userId, tenantId, role, permissions, name, email, isAuthenticated; không dùng id/displayName tùy ý.
- Service chỉ trả anonymous trên 401; 403/network/5xx là trạng thái khác, không nuốt hết thành null.
- Query key tách session/tenant; đổi session phải clear cache liên quan. Quyền lấy từ BE; không tự cấp manager/admin hoặc permissions mặc định.
- Capability quyết định thao tác; role chỉ phục vụ persona. Các aliases legacy cần test với policy BE, không mở rộng quyền theo suy đoán.

Acceptance: staff/manager quyền khác nhau; permission bị thu hồi không vẫn thao tác nhờ stale cache. Verify service/query/permission tests và 401/403 với hai user thật.

## F03 — Login/invitation/logout

Sửa `src/features/auth/login/index.tsx`, `src/hooks/mutations/auth/use-auth-logout.ts`, `src/hooks/mutations/auth/use-auth-logout.test.tsx`; tạo `src/hooks/mutations/auth/use-auth-login.ts`, `src/hooks/mutations/auth/use-auth-login.test.tsx`.

- Chuyển orchestration login/invitation sang mutation; đúng identify → login → invitation nếu mã lỗi tương ứng → `/me`.
- Phân biệt Cognito challenge/session với confirmation code theo handler; không strip chuỗi detail để đoán contract. BE-01 phải làm rõ response invitation.
- `returnUrl` chỉ local path hợp lệ hoặc origin allowlist thống nhất; không `window.location.assign` arbitrary URL.
- Logout: FCM unregister best-effort, không chặn logout nếu Firebase lỗi; clear toàn bộ tenant-sensitive query cache, đóng subscriptions, xóa staff token legacy. Hiện lỗi nếu server logout không hoàn tất, không giả session đã revoke.

Acceptance: login sai không kích hoạt invitation giả; expiry quay về login; logout rồi user B không thấy cache user A. Verify các mutation tests + HTTP cookie Path/Domain trên trình duyệt do user kiểm tra.

## F04 — Auth pages và navigation boundary

Sửa `src/features/auth/forgot-password/index.tsx`, `src/features/auth/select-tenant/index.tsx`, `src/configs/navigation.config.ts`, `src/features/settings/index.tsx`; tạo `src/features/auth/auth-access.test.tsx`.

- Forgot password: chưa thấy Staff BFF reset API trong controller đã audit. Không báo “đã gửi” khi chỉ set local state; dùng trạng thái chưa hỗ trợ hoặc thêm flow BE được kiểm chứng riêng, không hardcode email tenant mẫu.
- Tenant selection: không chọn tenant mock rồi đổi client-only identity. Identify hiện resolve tenant theo email; chỉ mở tenant switch khi có BE contract validate membership + issue session mới. Không tự xây multi-tenant login khác BE.
- Settings: profile dùng `/me`, light/dark và ngôn ngữ là preference local nếu BE chưa có persistence. Không hiển thị save server giả.
- Staff shell route guard và navigation dùng cùng capability mapping; customer routes không được tiếp cận staff data chỉ vì đã login. Không xóa customer files trong task này.

Acceptance: không còn fake success ở hai auth pages, route guard và nút hành động nhất quán. Verify access tests, direct URL và reload bằng staff/manager.

## Quy tắc áp dụng cho mọi domain bên dưới

DTO mới dùng Zod parse `unknown`; query keys có `all`, tenant + filter + identifier; query/mutation ở root `src/hooks`, không gọi service trực tiếp trong component. Mỗi domain có `*.service.test.ts` với fixture serialize từ BFF; các mock UI không được sử dụng để bù khi HTTP lỗi. Không ép mọi API chung một pagination: shipment dùng page/limit, OCR page/pageSize, mail pageToken. Date/enum/decimal/null phải theo HTTP serialization đã kiểm chứng.
