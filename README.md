# Job Portal Platform

Nền tảng tuyển dụng frontend kết nối 3 nhóm người dùng: Ứng viên, Nhà tuyển dụng, Quản trị viên.

Tài liệu này tập trung vào 2 mục tiêu chính:
- Giới thiệu chính xác hệ thống đang có trong mã nguồn.
- Hướng dẫn chạy và sử dụng dự án theo luồng nghiệp vụ thực tế.

## 1. Tổng quan dự án

Job Portal Platform là ứng dụng web xây dựng bằng HTML, CSS, JavaScript thuần.
Phiên bản hiện tại chưa có backend riêng, toàn bộ dữ liệu chạy trên trình duyệt thông qua localStorage/sessionStorage.

Hệ thống đã có các khối nghiệp vụ chính:
- Đăng ký/đăng nhập và điều hướng theo vai trò.
- Candidate xem job, ứng tuyển, quản lý CV.
- Recruiter đăng job, xử lý hồ sơ ứng viên, quản lý ví và giao dịch.
- Admin duyệt job, xử lý liên hệ hỗ trợ và giám sát dữ liệu quản trị.

## 2. Vai trò và phạm vi chức năng

### 2.1. Candidate
- Xem danh sách việc làm.
- Xem chi tiết công việc qua modal.
- Ứng tuyển vào job.
- Quản lý CV:
    - Tạo bản ghi CV mới.
    - Upload CV định dạng .pdf/.docx.
    - Giới hạn kích thước file tối đa 5MB.
- Theo dõi trạng thái đơn ứng tuyển.
- Xem thông báo liên quan từ phía admin.

### 2.2. Recruiter
- Đăng tin tuyển dụng mới.
- Chỉnh sửa, xóa tin đã đăng.
- Quản lý trạng thái job.
- Xem danh sách hồ sơ ứng tuyển theo job.
- Cập nhật trạng thái ứng viên.
- Quản lý ví:
    - Xem số dư.
    - Xem lịch sử giao dịch.
    - Thao tác nạp theo luồng nội bộ hiện có.
- Gửi liên hệ hỗ trợ đến admin.

### 2.3. Admin
- Quản lý danh sách job chờ duyệt.
# Job Portal Platform


Job Portal Platform là một ứng dụng frontend tuyển dụng (HTML/CSS/Vanilla JS) mô phỏng đầy đủ luồng nghiệp vụ cho 3 vai trò chính: Candidate (ứng viên), Recruiter (nhà tuyển dụng) và Admin (quản trị).

**Lưu ý mới:**
- Hệ thống sử dụng xác thực OTP 6 số ngẫu nhiên cho các thao tác đăng ký và quên mật khẩu. Mỗi lần gửi, OTP sẽ được sinh tự động, không còn dùng mã mặc định.

Lưu ý: ứng dụng hiện hoạt động hoàn toàn trên client — dữ liệu được lưu trong `localStorage` / `sessionStorage`. Đây là môi trường demo / prototyping chứ không phải production-ready.

## Tính năng chính (hiện có)

- Authentication & role routing: đăng ký/đăng nhập và điều hướng theo vai trò, sử dụng xác thực OTP 6 số ngẫu nhiên (OTP sẽ được sinh tự động mỗi lần gửi, không còn dùng mã mặc định).
- Candidate
    - Duyệt danh sách công việc, tìm kiếm, lọc.
    - Xem chi tiết công việc qua modal (mô tả, yêu cầu, hình thức làm việc, ngày đăng).
    - Ứng tuyển (chọn CV, gửi lời nhắn).
    - Quản lý CV: tạo, upload (client-side), đặt CV mặc định.
    - Xem lịch sử ứng tuyển và trạng thái phản hồi.
- Recruiter
    - Tạo/Chỉnh sửa/Xóa tin tuyển dụng (modal tạo tin có trường `Hình thức làm việc`).
    - Quản lý hồ sơ ứng viên theo job, mời phỏng vấn, xử lý trạng thái.
    - Quản lý ví nội bộ (số dư, giao dịch, QR nạp tiền).
    - Ghim/nổi bật tin đăng (tùy chỉnh phí khi đăng tin).
- Admin
    - Duyệt / từ chối job, quản lý user, xử lý contact/support.
    - Công cụ xuất nhập dữ liệu và thao tác quản trị (đã tách một số chức năng thành module trong mã nguồn).
    - Quản lý xác thực OTP random 6 số cho các thao tác đăng ký, quên mật khẩu.
- Công cụ hỗ trợ phát triển
    - Trang debug: `pages/debug.html` — xem/backup/restore `localStorage`, gọi `persistAll()`, `syncUsersToAuthStore()`, chạy snippets JS nhanh.
    - Tài liệu debug chi tiết: `READDEBUG.md` và `READBUG.md` chứa các snippet và hướng dẫn vận hành.

## Các thay đổi gần đây đáng chú ý

- Đã chuyển toàn bộ xác thực OTP sang mã 6 số ngẫu nhiên, không còn dùng mã mặc định. Khi đăng ký hoặc quên mật khẩu, người dùng sẽ nhận được một mã OTP gồm 6 chữ số ngẫu nhiên để xác thực thao tác.
- Job card và candidate job list được nâng cấp (avatar/logo, status pill, tags, action buttons).
- Modal chi tiết công việc cải tiến — layout 2 cột, highlight trường `Mô tả` và `Yêu cầu`.
- Thêm trường `type` / `Hình thức làm việc` cho job (values: `fulltime`, `parttime`, `remote`, `hybrid`, `intern`) và đã được lưu trong `JOBS_DATA`.
- Debug page và README debug được thêm vào để hỗ trợ dev/support.

## Cấu trúc thư mục (chủ yếu)

```
JobPortalPlatform-main/
├─ assets/
├─ controllers/      # các controller core (auth, job, admin, ...)
├─ modules/          # modules chức năng (candidate, recruiter, admin...)
├─ pages/            # giao diện HTML (index, candidate, recruiter, admin, debug)
├─ css/              # styles
└─ Data/             # file seed (data-init.js)
```

## Cách chạy nhanh

Phương pháp đơn giản:

```bash
# từ thư mục dự án
python -m http.server 8000
# hoặc
npx http-server

# sau đó mở http://localhost:8000/pages/index.html
```

## Hướng dẫn ngắn cho debug (quick)

- Mở `pages/debug.html` để: xem toàn bộ `localStorage`, export JSON, restore từ payload, chạy JS snippets an toàn.
- Xem `READDEBUG.md` và `READBUG.md` để các examples cụ thể (xóa demo users, fix missing ids, gọi persist/sync, v.v.).

## API nội bộ / helpers

Project có nhiều helper global để tiện thao tác trong client:
- `JobModule.createJobFromForm(payload)` — tạo job từ form (được recruiter call).
- `persistAll()` / `AdminModules.storage.persistAll()` — ghi lại trạng thái admin nếu định nghĩa.
- `syncUsersToAuthStore()` — đồng bộ users giữa admin store và auth store (nếu định nghĩa).

## Lưu trữ dữ liệu

- Các key chính trong `localStorage`: `users`, `JOBS_DATA`, `APPLICATIONS_DATA`, `ALL_TRANSACTIONS_DATA`, ...
- Project giữ cơ chế `shared/legacy` để tương thích các key cũ (ví dụ: `JOBS_DATA` + `jobs`).

## Gợi ý phát triển tiếp theo

- Bảo vệ trang debug bằng xác thực (chỉ staging/dev).
- Thêm export/download backup button trên debug page.
- Tách tiếp `controllers/admin.js` thành nhiều module nhỏ (đã có đề xuất trong README gốc).

## Liên hệ

Thông tin trong repo — tác giả/nhóm phát triển.


### 13.7. Kết luận

- Bạn hoàn toàn có thể chia nhỏ file này.
- Nên tách theo từng cụm nghiệp vụ thay vì tách một lần toàn bộ.
- Nếu làm đúng thứ tự, rủi ro thấp và code sẽ dễ mở rộng hơn nhiều.
