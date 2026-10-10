# 04 — Routes, manager approvals và tracking

## Phạm vi bản đồ đã chốt

Theo yêu cầu người dùng: **hai marker đầu/cuối và một đường nối minh họa giữa hai điểm** của shipment/tuyến được chọn. Đường nối đơn giản lấy từ tọa độ hai endpoint, không cần routing API và không được trình bày như đường đi thực tế. Không yêu cầu stops trung gian, routing engine, marker xe chạy, GPS history hay streaming. Các nghiệp vụ planning/approval vẫn theo contract BE, độc lập với mức chi tiết hiển thị bản đồ.

Dependencies: F, S; BE-05 cho assignment xuyên service. Sources: `src/dotnet/BFF/Staff.Bff/Controllers/{Routes,Approvals,Tracking}Controller.cs`; `src/dotnet/RoutePlanningAgent/Infrastructure/Services/ApprovalService.cs`, `Application/Commands/Routes/{RequestRouteRecommendationCommand,ApproveRouteCommand}.cs`.

## Route contract

`/api/v1/routes`: GET/POST, GET/PUT/DELETE `/{id}`, PATCH `/{id}/status` body `{newStatus}`, POST `/{id}/optimize`, POST `/{id}/recommendation`. Create/update: name, description, routeType, maxWeightKg, maxVolumeM3, estimatedDistanceKm, estimatedDurationMinutes, stops. Stop: sequence, stopType, locationName, address, latitude, longitude, estimatedArrivalMinutes, serviceDurationMinutes.

Không thấy add-stop/dispatch endpoint trong controller này. Stops được gửi theo create/update contract. Không phát minh `/dispatch` chỉ vì docs có.

`/api/v1/approvals/pending?page=&limit=`; POST `/{approvalId}/approve` `{comment}`, POST `/{approvalId}/reject` `{reason,comment}`. Approve handler dùng approvalId; service Approved ticket → route **Ready**, reject → route **Draft**. Phải check routeVersion/policyVersion để không duyệt recommendation cũ (BE-05).

## R01 — Data layer routes/approvals

Sửa `src/api/services/route-planning.service.ts`; tạo `src/dto/routes/route.dto.ts`, `src/api/query-keys/routes.keys.ts`, `src/api/services/route-planning.service.test.ts`; sửa `src/configs/api.ts`.

Tiếp R01b: tạo `src/api/services/approvals.service.ts`, `src/dto/approvals/approval.dto.ts`, `src/api/query-keys/approvals.keys.ts`, `src/hooks/queries/approvals/use-pending-approvals-query.ts`, `src/api/services/approvals.service.test.ts`.

Acceptance: không duplicate shipment CRUD trong route service; parse recommendation/governance thực tế, không tự gán ready sau timeout. Verify HTTP mapping, serialized enums, error statuses và approvalId ≠ routeId fixture.

## R02 — Planning UI lấy kết quả thật

Tạo `src/hooks/queries/routes/use-routes-query.ts`, `src/hooks/mutations/routes/use-route-mutations.ts`, `src/features/route-tracking/route-planning/route-planning.test.tsx`; sửa `src/features/route-tracking/route-planning/index.tsx`, `src/features/route-tracking/route-planning/stores/use-route-planning-store.ts`.

Server routes/shipments nằm trong Query; store chỉ selection, camera và input chưa lưu. Bỏ fixture initialization khỏi production path; dùng create response id và recommendation decision/approval info. Bản đồ lấy hai endpoint từ BE để dựng đường nối minh họa; không cần geometry đường đi hay intermediate stops từ optimize response. Capacity/timing/risk warning theo BE; không auto accept từ AI. Không nuốt exception khi create/update.

Acceptance: reload có route vừa tạo, optimize fail không đổi route thành ready; hai request đảo thứ tự không ghi đè selection mới. Verify tests mock HTTP responses thay đổi để chứng minh UI thật sự dùng response.

## R03 — Manager review và persisted assignment

Tạo `src/features/route-tracking/approvals/index.tsx`, `src/features/route-tracking/approvals/components/approval-review.tsx`, `src/hooks/mutations/approvals/use-approval-mutations.ts`, `src/features/route-tracking/approvals/approval-review.test.tsx`, `src/app/(staff)/route-tracking/approvals/page.tsx` (route mới **đề xuất**).

Task R03b sau BE-05: sửa `src/configs/navigation.config.ts`, `src/api/services/shipment.service.ts`, `src/hooks/mutations/shipments/use-shipment-mutations.ts`, `src/features/route-tracking/route-planning/index.tsx`; tạo `src/features/route-tracking/route-planning/route-assignment.test.tsx`.

Quyền approval lấy từ BE; không coi route_planning:update tự động đồng nghĩa manager approve nếu policy không cho. Show route version, risk, summary; reject bắt buộc reason. Assign shipment phải gọi command chính thức, invalidate cả route và shipment; không PATCH Approved như code cũ. Chưa có command association thì disable Accept/Assign dù route create đã hoạt động.

Acceptance: staff bị 403 khi gọi trực tiếp approval không có capability; stale ticket conflict; manager approve cập nhật route Ready; reload shipment vẫn có routeId chính xác. Verify BE concurrency/tenant tests + FE rejection/retry tests.

## T01 — Mapping điểm đầu/cuối từ BE

Tạo `src/features/route-tracking/utils/map-endpoints.ts`, `src/features/route-tracking/utils/map-endpoints.test.ts`; sửa `src/features/route-tracking/live-map/hooks/use-live-map-page.ts`.

Reuse shipment/route queries từ S/R, không gọi GPS current/history để lấy endpoint. Chọn Pickup/Delivery bằng type và sequence nghiệp vụ của BE, không lấy phần tử đầu/cuối mảng chưa sắp xếp. Nếu nhiều pickup/delivery, map endpoint theo thứ tự tuyến được chọn và test quy tắc này. Validate latitude/longitude; thiếu tọa độ thì báo chưa có điểm tương ứng, không bù fixture hoặc tọa độ mặc định. Backend vẫn có thể lưu nhiều stops, UI không cần vẽ chúng.

Acceptance: mapper trả tối đa hai endpoint có nhãn rõ, đúng shipmentId; tọa độ 0 hợp lệ không bị coi là thiếu. Verify thứ tự mảng đảo, nhiều stops, thiếu một/hai điểm, tọa độ lỗi và hai endpoint trùng vị trí.

## T02 — Hai marker nhất quán trên các màn hình

Sửa `src/features/route-tracking/shipment-tracking/index.tsx`, `src/features/shipment/shipment-detail/index.tsx`, `src/features/route-tracking/route-planning/index.tsx`; tạo `src/features/route-tracking/live-map/live-map-data.test.tsx`.

Reuse common map và mapper T01, marker dùng `position`; fit bounds vào hai điểm có thật và vẽ một đường nối minh họa giữa chúng. Chỉ vẽ đường khi đủ hai tọa độ hợp lệ; hai điểm trùng nhau không tạo đường giả. Không vẽ vehicle marker, intermediate stops hoặc GPS trail; bỏ GPS polling khỏi composition bản đồ nếu chỉ phục vụ các lớp này. Không xóa backend endpoints hoặc service dùng ở workflow khác. Overview map cũng dùng hai endpoint và đường nối từ BE coordinates, không dùng commandMapMock để vẽ hành trình. Test đường nối cập nhật cùng marker khi đổi shipment, không giữ đường của selection cũ.

Acceptance: chọn shipment A/B đổi đúng hai điểm; reload giữ tọa độ BE; thiếu điểm có empty/partial state rõ; không gọi routing service/GPS polling/WebSocket chỉ để hiển thị bản đồ. Verify component tests và người dùng kiểm tra bằng tay, không Playwright. GPS/history/geofence visualization nằm ngoài phạm vi hiện tại.
