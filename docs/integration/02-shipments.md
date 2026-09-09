# 02 — Shipments

Dependencies: F01–F04. BE chuẩn: `src/dotnet/BFF/Staff.Bff/Controllers/ShipmentsController.cs`; `src/dotnet/ShipmentWorkflow/Application/Commands/Shipments/SubmitShipmentCommand.cs`, `ShipmentCommandHelpers.cs`, `Domain/Shipment.cs`.

## Contract hiện có

Prefix `/api/v1/shipments`: GET/POST collection, GET/PUT/DELETE `/{id}`, POST `/{id}/submit`, PATCH `/{id}/status`, POST `/{id}/cancel`, POST `/import`; cargo/locations CRUD nested, documents add/delete, milestones POST và **GET `/{id}/timeline`**.

- List: page/limit/status/shipmentNo/customerName/createdFrom/createdTo.
- Create body: orderId, customerName, originAddress, destinationAddress, originCountry, destinationCountry, cargoItems `{name,quantity,weightKg,hsCode}`.
- Update body: customerName, destinationAddress, priority, transportMode, notes. Không phải full create payload.
- Location: type/name/address/sequence/latitude/longitude/contactName/contactPhone. Submit yêu cầu cargo và ít nhất Pickup + Delivery; lấy giá trị enum đúng từ DTO/domain, không dùng label UI.
- Import: JSON `{fileName,content,importRequestId}`, content là CSV text; handler đọc thêm giới hạn 100 dòng/256 KiB UTF-8 và cấm header tenantId. Không multipart/base64. RequestId trong response chưa tự chứng minh BE dedupe; xem S04 trong playbook trước bật retry.
- ID API là `id`, không phải `shipmentNo`. CustomerId và RouteId cần BE-05 trước khi dùng làm liên kết nghiệp vụ.

## S01 — Typed data layer

Tạo `src/dto/shipments/shipment.dto.ts`, `src/api/query-keys/shipments.keys.ts`, `src/api/services/shipment.service.test.ts`; sửa `src/api/services/shipment.service.ts`, `src/configs/api.ts`.

Parse list/detail/create/timeline riêng; bổ sung các method còn thiếu, không tạo thêm shipment service trong route-planning. Unit tests request query/body/URL và validation response, kể cả 400/403/404/409. Acceptance: không `any`, không fabricate ETA/customer/status; missing dữ liệu hiển thị “chưa có”.

## S02 — List/detail server state

Tạo `src/hooks/queries/shipments/use-shipments-query.ts`, `src/hooks/queries/shipments/use-shipment-query.ts`, `src/hooks/queries/shipments/use-shipment-timeline-query.ts`; sửa `src/features/shipment/components/shipment-table.tsx`, `src/features/shipment/shipment-detail/index.tsx`.

List/filter/pagination dùng server, detail dùng UUID. Tách loading/empty/error/not-found. Gắn timeline/documents/tracking theo cùng shipmentId, bỏ dữ liệu giả trong các tab; tab BE chưa support có empty/unsupported rõ. Không fetch một trang rồi coi là tổng số shipments toàn hệ thống.

Acceptance: click shipmentNo mở đúng UUID, refresh/deep-link giữ detail; filter chuyển trang đúng và không lộ tenant cũ. Verify service tests + component test tại S04.

## S03 — Create/update/submit theo state machine

Tạo `src/hooks/mutations/shipments/use-shipment-mutations.ts`, `src/features/shipment/create-shipment/utils/validate-shipment.ts`, `src/hooks/mutations/shipments/use-shipment-mutations.test.tsx`; sửa `src/features/shipment/create-shipment/index.tsx`, `src/features/shipment/shipment-detail/index.tsx`.

Create lưu ID BE; thêm locations/cargo qua contract chính thức trước submit. Một bước lỗi thì giữ draft đã tạo, cho resume, không submit tiếp; không tạo lại shipment mỗi lần retry nếu đã có ID. UI chỉ cung cấp transition được domain cho phép; từ chối invalid transition phải hiển thị lỗi. Mỗi mutation invalidate detail/list/timeline/dashboard tương ứng.

Acceptance: address-only không được thông báo submit thành công; payload đúng các trường create/update khác nhau. Test partial failure create-success/location-fail, retry, invalid status và reload persisted draft.

## S04 — Import + regression slice

Sửa `src/features/shipment/import-shipments/index.tsx`; tạo `src/hooks/mutations/shipments/use-import-shipments.ts`, `src/features/shipment/import-shipments/types/import.types.ts`, `src/features/shipment/import-shipments/import-shipments.test.tsx`, `src/features/shipment/shipment-integration.test.tsx`.

Đọc import handler/parser thực tế trước encode; hiển thị kết quả từng dòng, rejected rows, requestId; cùng lần import retry dùng cùng importRequestId. Không giả số lượng đã import. Giữ input an toàn, giới hạn size theo BE, không log raw customer data.

Verification: `pnpm exec vitest run src/api/services/shipment.service.test.ts src/hooks/mutations/shipments src/features/shipment`. Runtime G1: tạo → locations → submit → list/detail/timeline cùng ID; import duplicate không nhân đôi dữ liệu.
