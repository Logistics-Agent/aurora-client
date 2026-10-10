# Kế hoạch tích hợp Aurora Client ↔ Backend

Ngày đối chiếu: 2026-09-09. Client: `feat/auth`, HEAD `6baa8e6`; backend HEAD `859f49f`. Đây là **plan triển khai**, không phải chứng nhận các service đã chạy end-to-end. Audit dựa trên docs, controller, DTO/proto và các handler liên quan; chưa khởi động stack, chưa kiểm thử với tài khoản thật. Không khẳng định đã đọc mọi file trong backend.

## Phạm vi và cách thực hiện

- Client phục vụ **customer + staff/manager**, phân quyền và resource ownership theo BE; không đưa admin trở lại. Customer portal thuộc phạm vi bắt buộc, dùng customer-safe contracts, không dùng quyền staff để vận hành. Xem [13-customer-portal.md](13-customer-portal.md).
- Giữ UI/theme hiện tại. Không đụng các thay đổi đang có ở `src/app/page.tsx` và `src/components/common/home-earth.tsx` trong công việc lập plan.
- Bản đồ cần hai marker đầu/cuối từ BE và một đường nối minh họa giữa chúng. Không yêu cầu tuyến đường thực tế, stops trung gian, GPS live/history hay routing/streaming.
- Thứ tự bằng chứng: controller được đăng ký + DTO + proto được load + handler/domain → tài liệu technical → catalog BFF → mock/Figma. Nhãn READY trong docs không chứng minh runtime hoạt động.
- Skills sử dụng: `using-agent-skills`, `planning-and-task-breakdown`, `backend-api-engineering`; bổ sung `security-and-hardening` khi phát hiện các điểm chặn auth/tenant/realtime. Mỗi task phải có file, dependency, acceptance và verification.
- BE có thể sửa khi contract/luồng sai; sửa tại service sở hữu dữ liệu, không chữa bằng mock hoặc bypass ở FE. Thay đổi contract phải đồng bộ proto, BFF, consumer và tests. Workspace hiện chỉ cho ghi client; khi thực sự sửa BE phải xin quyền ghi qua cơ chế sandbox.
- Không cần Playwright. Dùng DTO/service/hook/component tests, API integration tests và checklist thao tác thật để người dùng kiểm tra.

## Đọc theo thứ tự

**Khi bắt đầu implement, đọc [11-implementation-playbook.md](11-implementation-playbook.md)**: hướng dẫn theo từng bước cho toàn bộ feature, logic trong mỗi file, recovery/idempotency và checkpoint. File 01–08 giữ contract và danh sách file gốc; playbook chia nhỏ/cụ thể hóa các task đó. API mới vẫn phải chốt BE trước, không tự coi tên method dự kiến là endpoint đã có.

| File | Nội dung |
|---|---|
| [00-source-audit.md](00-source-audit.md) | Nguồn đã đối chiếu, contract khác docs, mức chắc chắn |
| [01-foundation-auth.md](01-foundation-auth.md) | HTTP, session, permission, cache và auth pages |
| [02-shipments.md](02-shipments.md) | Tạo/sửa/import/submit, timeline và định danh |
| [03-documents-compliance.md](03-documents-compliance.md) | Upload → OCR review → compliance gắn shipment |
| [04-routes-approvals-tracking.md](04-routes-approvals-tracking.md) | Planning → manager approval → assignment → bản đồ hai endpoint |
| [05-mail-negotiations.md](05-mail-negotiations.md) | Inbox/claim/draft/send, AI human review |
| [06-commercial.md](06-commercial.md) | Estimate, invoice, ledger payment, escrow |
| [07-notifications-overview-assistant.md](07-notifications-overview-assistant.md) | FCM/realtime, overview, assistant/search/settings |
| [08-backend-fixes.md](08-backend-fixes.md) | BE blockers và các sửa đổi cần thiết theo file |
| [09-verification.md](09-verification.md) | Cache liên feature, kịch bản xuyên service, tiêu chí hoàn tất |
| [10-deployed-swagger.md](10-deployed-swagger.md) | Đối chiếu Swagger công khai đang chạy tại api.humanak.cyou |
| [11-implementation-playbook.md](11-implementation-playbook.md) | Cách implement toàn bộ feature: thuật toán, file/subtask, lỗi, dependency và test |
| [12-expected-output.md](12-expected-output.md) | Đầu ra sau implementation: chức năng, luồng liên feature, source, bằng chứng bàn giao và phần ngoài scope |
| [13-customer-portal.md](13-customer-portal.md) | Customer identity/ownership, từng portal feature, FE/BE tasks và kiểm thử customer ↔ staff |

## Dependency và các checkpoint

```text
BE-01/02 auth + F01..F04
  ├─ S01..S04 shipment ─ D01..D03 OCR ─ C01 compliance
  │                  ├─ R01..R03 routes + approval ─ T01/T02 hai endpoint
  │                  └─ B01/B02 estimate + invoice ─ BE-06 ─ B03 payment
  └─ M01..M03 mail ─ BE-07 ─ N01 negotiation

F + Notification service → X01 Firebase FCM + notification HTTP API
BE-03/04 → X02 transport realtime nghiệp vụ tùy chọn (deferred, không phục vụ notification)
Các feature hoàn tất → O01 dashboard/assistant → V01..V06 kiểm chứng xuyên service
CP-BE01 identity → CP01 portal guard → CP02..CP08 customer features → CP09/V07
```

1. **G0 — Contract/security:** auth hoạt động, không tenant giả, DTO fixture lấy từ HTTP thật hoặc test serialization BFF. Khóa thao tác phụ thuộc BE chưa có.
2. **G1 — Vertical slice shipment:** create → thêm cargo/locations → submit → reload đúng ID và trạng thái.
3. **G2 — Operations:** tài liệu/OCR/compliance, route approval và tracking liên kết cùng shipment thật. Không dựng chuỗi tự động khi event bridge chưa có.
4. **G3 — Communication/commercial:** claim → negotiation draft → human send; invoice → payment ledger; thử lỗi và gửi lặp.
5. **G4 — Cross-feature:** notification/overview cập nhật đúng, hai user/hai tenant độc lập, reload giữ dữ liệu; các gate trong file 09 đạt.
6. **G5 — Customer portal:** CP01–CP09 và các BE gates tương ứng đạt; V07 chứng minh customer A/B cùng tenant được tách dữ liệu, staff/customer nhìn cùng entity đúng projection. Đây là gate bắt buộc, không deferred.

Sau G0, mail và shipment có thể triển khai song song; mỗi nhánh sửa feature riêng. File shared như `src/configs/api.ts`/HTTP client cần một owner tích hợp để tránh chồng chéo. Chỉ đánh dấu task done khi acceptance và tests của task đạt; không dùng số endpoint đã gọi làm tiến độ.

## Quy ước task/file

Trong các file sau: `Sửa` = file đã có; `Tạo` = file dự kiến, chưa được tạo trong lượt lập plan. Đường dẫn FE tính từ repo client, BE từ repo server. Các task nền tảng không được gom thành một PR khổng lồ; tách test cùng implementation theo domain. Không xóa mock files tự động: bỏ import khỏi production composition, giữ fixtures cho test/demo có nhãn rõ.

Các thay đổi auth mới, upload contract mới và chính sách quyền phải được chốt bằng test contract trước khi mở UI. Những mục ghi “đề xuất” không phải API hiện có. Không commit, deploy hoặc sửa secrets trong phạm vi plan.
