
CAN-18 | Job không tồn tại | ID sai | Trang trắng | Báo lỗi | White Box | Fail

Phản hồi (từ đội phát triển):
- Trạng thái: Đã nhận và xác thực.
- Nguyên nhân: ID không hợp lệ/không tồn tại dẫn tới truy vấn trả về rỗng và gây lỗi hiển thị (trang trắng).
- Hành động đã thực hiện: Thêm kiểm tra tồn tại `job` trước khi truy vấn chi tiết; xử lý ngoại lệ và trả về thông báo lỗi rõ ràng cho người dùng.
- Bước tiếp theo: Yêu cầu test case (ID mẫu) từ người báo lỗi để tái hiện; nếu cần, sẽ thêm log chi tiết và fix trong API.
- Người phụ trách: Dev team. Ưu tiên: Cao.

**Đánh giá & Xử lý sự cố**

- Mô tả hiện tượng: Khi truy cập chi tiết `job` với một `ID` không hợp lệ hoặc không tồn tại, ứng dụng trả về trang trắng (blank page) và test đánh giá là Fail.
- Nguyên nhân gốc rễ: Thiếu kiểm tra tồn tại `job` trước khi render; ngoại lệ từ tầng dữ liệu (null/undefined) không được bắt, dẫn tới lỗi JavaScript ở frontend hoặc lỗi server không được xử lý.
- Các bước tái hiện (reproduction):
	1. Gọi endpoint chi tiết job với `id` không tồn tại (ví dụ: `id=0` hoặc `id=abc`).
	2. Quan sát response (200/500/404) và UI (trang trắng hoặc thông báo lỗi).
	3. Kiểm tra console trình duyệt và log server để tìm stack trace.
- Hành động tạm thời (workaround): Khi không tìm thấy job, trả về trang thông báo lỗi rõ ràng (ví dụ: "Job không tồn tại") hoặc chuyển hướng về trang danh sách.
- Giải pháp đề xuất (fix):
	1. Backend: Thêm kiểm tra tồn tại `job` và trả mã 404 với payload rõ ràng nếu không tìm thấy; đảm bảo không ném exception thô.
	2. Frontend: Kiểm tra dữ liệu trước khi render, hiển thị thông báo lỗi người dùng thay vì crash UI.
	3. Thêm log chi tiết (request id, job id, timestamp) khi xảy ra lỗi để dễ debug.
- Kiểm thử & xác minh: Thêm unit/integration tests cho trường hợp `job not found`; chạy manual test với các ID hợp lệ và không hợp lệ; xác nhận UI không còn trang trắng.
- Yêu cầu từ người báo lỗi: Cung cấp `ID mẫu` và thời điểm xảy ra (timestamp) để tái hiện và kiểm tra log.
- Người phụ trách & timeline: Dev team chịu trách nhiệm, ưu tiên Cao; plan fix trong sprint tiếp theo hoặc hotfix nếu có ảnh hưởng lớn.

**Bug Fixes (Tóm tắt 2 vấn đề)**

1) Vấn đề: Giao diện danh sách job hiển thị không ổn / khoảng trắng lớn hoặc card không đều.
	- Nguyên nhân: Grid CSS sử dụng cấu hình không phù hợp (auto-fit/min-width nhỏ) và một số card thiếu giới hạn chiều rộng/chiều cao dẫn tới bố cục lệch trên các viewport khác nhau.
	- Giải pháp: Thay đổi CSS grid sang `auto-fill` với `minmax(300px, 1fr)`, đảm bảo `.job-card` có `max-width:100%` và `align-items: start`; thêm media queries nếu cần để điều chỉnh padding và min-height.
	- Người phụ trách: Frontend. Ưu tiên: Trung bình.

2) Vấn đề: Chi tiết `job` gây trang trắng khi `ID` sai/không tồn tại.
	- Nguyên nhân: Thiếu kiểm tra tồn tại `job` (null/undefined) và ngoại lệ không được bắt ở backend hoặc frontend; dẫn tới lỗi runtime làm dừng rendering (blank page).
	- Giải pháp: Backend trả `404` với payload rõ ràng khi không tìm thấy; Frontend kiểm tra dữ liệu trước khi render, bắt lỗi và hiển thị thông báo người dùng ("Job không tồn tại"); thêm log chi tiết và unit/integration test cho trường hợp này.
	- Người phụ trách: Backend + Frontend. Ưu tiên: Cao.


**Kế hoạch Đào tạo & Triển khai (Training & Rollout)**

Mục tiêu: Đảm bảo QA, Recruiter và Candidate hiểu các thay đổi (fix UI danh sách job và đồng bộ xem CV), có thể tái hiện lỗi, kiểm tra và xác minh fix, và triển khai an toàn.

- Phạm vi: Frontend (giao diện job list, modal CV), Backend (API trả 404 cho job không tồn tại, lưu `cvId` trong application).
- Đối tượng: QA lead, 2 frontend dev, 1 backend dev, 2 recruiter power-users, 1 product owner.
- Tài liệu & chuẩn bị: Cập nhật `CHECKLIST.md` (test-cases CV/Job), thêm CHANGELOG ngắn, tạo hướng dẫn reset seed data (`Data/data-init.js`).
- Nội dung đào tạo (90 phút tổng):
	1) Giới thiệu & nguyên nhân (15 phút): dev trình bày bug, root cause, và thay đổi chính trong code.
	2) Demo (15 phút): so sánh trước/sau, demo apply + recruiter xem CV, demo job-not-found xử lý.
	3) Thực hành QA (40 phút): chạy các test-case trong `CHECKLIST.md` (tạo CV, đặt mặc định, apply, recruiter xem CV, thử id không tồn tại) và ghi nhận kết quả.
	4) Hướng dẫn rollback & báo cáo (20 phút): cách xem logs, rollback localStorage seed, reporting bug.
- Lịch triển khai (gợi ý):
	- Ngày -1 (Chuẩn bị): cập nhật tài liệu, test-cases, đánh giá rủi ro.
	- Ngày 0: Đào tạo dev + QA, dry-run trên staging/local.
	- Ngày 1: QA thực thi checklist; dev xử lý issue nhỏ nếu có.
	- Ngày 2: Đào tạo recruiter power-users; thu feedback.
	- Ngày 3: Triển khai chính thức (merge + release) và giám sát 48 giờ.
- Triển khai & hậu kiểm:
	- Pre-release: tạo branch, PR kèm checklist, code review bởi QA.
	- Release: merge và deploy; nếu không có pipeline, hướng dẫn deploy thủ công và hướng dẫn người dùng clear cache.
	- Monitoring: theo dõi logs, localStorage errors, và feedback từ recruiter trong 48 giờ; rollback nếu xuất hiện lỗi nghiêm trọng.
- Tiêu chí thành công: QA pass toàn bộ test-case liên quan, recruiter xác nhận CV hiển thị chính xác, không có báo lỗi mới trong 48 giờ sau release.

**Kế hoạch (Ngắn gọn cho slide)**

- **Slide 1 — Tiêu đề & Mục tiêu:** Giới thiệu tính năng CV (upload, lưu base64, preview recruiter); tiêu chí thành công: CV hiển thị chính xác, upload ≤ 5MB.
- **Slide 2 — Phạm vi:** Người dùng: Candidate + Recruiter; Thành phần: `pages/candidate.html`, `controllers/cv.js`, `modules/recruiter/recruiter.dashboard.js`.
- **Slide 3 — Nội dung đào tạo (tóm tắt):** 1) Upload CV (pdf/docx) và giới hạn 5MB; 2) Quản lý CV ở Candidate; 3) Recruiter xem/ tải CV (iframe PDF / download DOCX).
- **Slide 4 — Quy trình triển khai:** Chuẩn bị môi trường → Demo & training (30–45 phút) → Pilot (1 ngày) → Triển khai toàn hệ thống.
- **Slide 5 — Lịch & thời lượng:** Chuẩn bị tài liệu (1 ngày); Training chính (45 phút); Hỗ trợ pilot (1 ngày); Rollout + giám sát (2 ngày).
- **Slide 6 — Vai trò:** **Owner:** Dev lead; **Trainer:** Dev engineer; **Support:** kỹ thuật viên 48–72h; **Tester:** QA (5 test-case chính).
- **Slide 7 — Test-case & Tiêu chí chấp nhận:** 1) Upload PDF <5MB → hiển thị; 2) Upload DOCX <5MB → tải về; 3) Cập nhật CV → recruiter thấy phiên bản mới; 4) File >5MB/định dạng khác → thông báo lỗi; 5) Kiểm tra `currentUser.cvFile` trong localStorage.
- **Slide 8 — Tài liệu & Hỗ trợ:** Link README, hướng dẫn 1-page, contact support; thu feedback & plan hotfix/rollback nếu cần.



