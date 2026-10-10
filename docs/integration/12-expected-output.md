# 12 — Output khi implement toàn bộ plan

Đây là **đầu ra mục tiêu**, không phải báo cáo đã hoàn thành. Chỉ chuyển thành kết quả bàn giao khi đã implement và có bằng chứng kiểm chứng tương ứng. Task blocked/deferred không được ghi là done.

## 1. Người dùng nhận được gì?

Phạm vi cập nhật: **customer + staff/manager**. Output customer bắt buộc xem [13-customer-portal.md](13-customer-portal.md): portal overview, shipments/detail/timeline/map hai điểm + connector, documents shared preview/download, quotes confirmation persisted, invoices read-only, FCM notification center/preferences theo contract và persisted customer assistant. Customer ownership được enforce ở BE kể cả hai customers cùng tenant; không dùng staff permission.

| Feature | Output hoạt động cần bàn giao | Điều kiện hoàn tất |
|---|---|---|
| Auth | Login, invitation theo BE, refresh session, logout; staff/manager chỉ thấy và dùng thao tác được cấp quyền | Reload/expiry hoạt động; user sau không thấy cache user trước; gọi API trái quyền bị chặn |
| Shipments | Danh sách/filter/pagination, tạo và sửa draft, thêm cargo/locations, submit/cancel theo lifecycle, import CSV và timeline thật | ID từ BE; lưu rồi reload còn dữ liệu; import trả kết quả từng dòng, retry không tạo trùng khi BE đã hỗ trợ idempotency |
| Documents | Chọn file → upload storage → gắn shipment → tạo OCR job; queue và detail theo trạng thái thực | Có storage reference, externalDocumentId và jobId đúng liên kết; lỗi giữa chừng có thể xử lý/resume |
| OCR review | Xem trường đã nhận dạng, sửa/xác nhận/từ chối, retry/cancel khi BE cho phép | Correction được lưu; conflict không ghi đè im lặng; không báo READY khi job còn xử lý |
| Compliance | Đánh giá từ cargo/countries/mode/OCR của shipment, xem evidence/citations và trạng thái đánh giá | Evaluation gắn đúng shipment; reload đọc lại được; dữ liệu đầu vào đổi thì kết quả cũ được nhận diện stale |
| Route planning | Tạo/sửa route, lấy optimize/recommendation thật; gán route qua command BE chính thức | Không dùng fixture hoặc local assignment làm kết quả cuối; shipment và route reload cùng linkage |
| Manager approval | Xem pending ticket, approve/reject với reason/comment đúng contract | Dùng approvalId; kiểm tra quyền/version; route chuyển trạng thái do BE quyết định |
| Bản đồ | Hai marker điểm đầu/cuối và **một đường nối minh họa** từ tọa độ BE | Đổi shipment cập nhật cả marker và đường; thiếu tọa độ có trạng thái rõ; không giả đường đi thực tế |
| Mail | Queue/detail/history, claim/reassign/unassign, lưu draft, human send, xem trạng thái xử lý thật | Ownership và concurrent claim đúng; lỗi không fake success; send accepted không bị ghi thành delivered |
| Negotiation | Danh sách/chi tiết/lịch sử phiên và offer theo HTTP contract đã bổ sung; đề xuất → mail draft → nhân viên review/send | Session/shipment/thread/message/draft liên kết thật; AI không tự gửi hoặc tự chốt giao dịch ngoài contract |
| Cost estimate | Nhập hoặc lấy context shipment, nhận breakdown chi phí từ financial service | Đúng units/currency; thiếu input hoặc service lỗi không fallback chi phí mẫu; estimate khác invoice cuối |
| Billing | Invoice list/detail/create/generate đúng lifecycle; ghi nhận payment qua ledger sau BE-06 | Partial/full payment, balance và status đúng; duplicate/concurrent payment không sai ledger; tenant isolation đạt |
| Escrow | Xem wallet/balance theo quyền và endpoint hiện có | Không hiển thị lock/release/refund như đã hoạt động nếu HTTP chưa expose |
| Notifications | Notification center, unread count, read/read-all; Firebase FCM foreground/background và click mở đúng màn hình | Backend lưu thông báo; token/device đúng session; push trùng không đếm hai lần; từ chối push vẫn dùng center qua API |
| Overview | Cards và map lấy dữ liệu thật theo quyền, từng card có loading/empty/error | Không KPI mẫu, không dùng một trang rows làm tổng toàn hệ thống; thay đổi nghiệp vụ được refetch đúng |
| Assistant/search | Gửi query, hiển thị answer/evidence/citations, thiếu bằng chứng và governance restrictions theo BE | Không trả câu mẫu khi lỗi; không tự thực thi payment/mail/approval từ nội dung AI |
| Settings và auth phụ | Profile theo `/me`, light mặc định và light/dark hoạt động; preference local được ghi đúng bản chất | Forgot-password/tenant-switch không có BE contract thì trạng thái chưa hỗ trợ, không giả gửi email/đổi tenant thành công |

Các action chưa có BE được chia thành hai nhóm: **bắt buộc bổ sung để hoàn tất flow** (ví dụ payment ledger exposure, route assignment, negotiation read APIs) và **chưa thuộc scope** (ví dụ tenant-switch mới, escrow write khi chưa chốt workflow). Nhóm bắt buộc còn thiếu nghĩa là feature chưa hoàn tất, không chỉ disable rồi ghi done.

## 2. Các luồng liên feature phải hoạt động

### Operations

`Login → tạo shipment → cargo + Pickup/Delivery → submit → upload/attach document → OCR review → compliance evaluation → route recommendation → manager approval nếu cần → assign route → xem hai endpoint + đường nối`

Đây là kịch bản kiểm chứng, không có nghĩa mỗi bước luôn tự động kích hoạt bước kế tiếp. Theo đúng lifecycle BE; chỉ thực hiện bước cần thiết cho nghiệp vụ và capability tương ứng. Mọi bước phải nối bằng ID authoritative, không bằng label hoặc mock ID.

### Communication

`Mail thread → staff claim → negotiation session/offer → persisted suggestion → mail draft → staff review → send → trạng thái outbound`

Nếu chưa có automatic inbound → negotiation consumer đã kiểm chứng, giữ thao tác explicit được BE hỗ trợ; không giả chuỗi tự động. Không gửi email thật cho khách hàng khi test.

### Commercial

`Shipment/customer context → cost estimate → invoice theo điều kiện BE → record payment → balance/status cập nhật`

Riêng auto-invoice từ POD: chỉ ghi hoàn tất khi producer → broker → billing consumer → invoice persistence được kiểm chứng; không coi FE gọi generate thủ công là bằng chứng auto-invoice hoạt động.

### Notification

`Business event → Notification service lưu dữ liệu → Firebase FCM → popup/background notification → mở màn hình → API lấy dữ liệu mới → đánh dấu đã đọc`

Không có RealtimeHub/WebSocket trong luồng notification. FCM không thay thế API hoặc persistence; app vẫn refetch khi focus để bù push bị bỏ lỡ.

## 3. Output kỹ thuật trong source

- Route pages là adapter; feature entry giữ composition có ý nghĩa, không import UI của business feature khác để dựng page.
- UI → root Query/mutation hooks → domain service → một shared HTTP client → BFF. DTO parse response bên ngoài; query keys tách tenant/resource/filter.
- TanStack Query quản lý server state; local/Zustand chỉ interaction. Không mirror server entities vào store rồi dùng như database thứ hai.
- Backend sửa các blocker bắt buộc với controller/proto/handler/test tương thích. Không sửa generated code bằng tay hoặc để FE né BFF bằng service nội bộ.
- Không fake-success, không silent mock fallback trong production flow; dữ liệu fixture còn lại chỉ phục vụ test/demo có nhãn.
- API error/timeout/conflict có trạng thái phục hồi; thao tác quan trọng có idempotency/concurrency phù hợp ở BE, không chỉ disable nút ở FE.
- Light/dark và shell hiện có được giữ; map không phát sinh routing/GPS/Socket.IO dependency cho phạm vi hai endpoint + connector.

## 4. Bộ bằng chứng bàn giao

Khi triển khai, tạo/cập nhật `docs/integration/implementation-status.md` với bảng sau. Tài liệu này chưa được tạo như một báo cáo giả trong lượt viết output.

| Trường | Nội dung bắt buộc |
|---|---|
| Task/feature | ID gốc và subtask trong playbook |
| Trạng thái | Not started / In progress / Blocked / Verified / Deferred |
| Code | File FE/BE thực sự đổi, revision tương ứng |
| Contract | Endpoint/schema dùng, khác biệt source với deployment nếu có |
| Kiểm thử | Command, ngày chạy, exit/result và test case liên quan |
| Runtime | Test environment, flow đã thử, request/event trace đã redact và kết quả reload |
| Blocker | Thiếu contract/quyền/env hay lỗi nào, tác động feature nào |

Đầu ra validation: DTO/service tests, hook/component tests, BE regression/contract tests và kịch bản xuyên service trong file 09. Chạy typecheck/lint/test/build tại checkpoint implementation, ghi lỗi nền riêng. Không dùng “build pass” để thay bằng chứng nghiệp vụ hoạt động.

Runtime kiểm tra bằng API tests và thao tác thủ công được phép; không yêu cầu Playwright. Không ghi secrets, auth cookies, FCM token, email khách hàng hoặc dữ liệu thanh toán nhạy cảm vào evidence.

## 5. Không nằm trong output hiện tại

- Tuyến bám đường giao thông thực tế, turn-by-turn directions, routing engine, xe chạy/live GPS, GPS trail và intermediate-stop visualization.
- RealtimeHub/Socket.IO integration. Các phát hiện bảo mật service này là backlog riêng, không dependency của map/FCM hiện tại.
- Admin console, tự động AI gửi email/chốt giao dịch/thanh toán. **Customer portal hoàn chỉnh trong phạm vi CP01–CP09 là output bắt buộc**, không nằm trong danh sách loại trừ.
- Tenant switching/reset password workflow mới, escrow write hoặc chat staff bổ sung nếu chưa chốt scope/contract riêng. Customer persisted assistant nằm trong scope CP08; online checkout customer chưa nằm trong scope invoice read-only.
- Tự deploy production, commit/push, gửi mail thật hoặc sử dụng tiền thật. Việc đó cần yêu cầu/quyền riêng.

## 6. Tiêu chí gọi là hoàn tất toàn bộ plan trong scope

1. Các feature bắt buộc trong mục 1 hoạt động trên BE thật và các blocker tương ứng đã giải quyết; phần deferred ghi rõ.
2. Luồng trong mục 2 có bằng chứng identity, persistence/reload, quyền và xử lý lỗi; không chỉ gọi được API đầu/cuối.
3. Tests và validation có kết quả được ghi nhận, không còn lỗi chưa phân loại ảnh hưởng flow được mở.
4. Handoff nói rõ cái đã verified, cái chưa kiểm chứng và cái ngoài scope. Không khẳng định mọi feature/service đều hoạt động nếu còn gate bắt buộc chưa đạt.
