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
- Duyệt, từ chối, đánh dấu vi phạm.
- Quản lý danh sách người dùng quản trị.
- Xử lý liên hệ hỗ trợ từ candidate/recruiter.
- Theo dõi log hoạt động và dữ liệu quản trị.

## 3. Cấu trúc thư mục

```text
JobPortalPlatform-main/
├── assets/
│   └── images/
├── controllers/
│   ├── admin.js
│   ├── auth.js
│   ├── candidate.js
│   ├── cv.js
│   ├── job.js
│   └── recruiter.js
├── Data/
│   └── data-init.js
└── pages/
        ├── admin.html
        ├── candidate.html
        ├── debug.html
        ├── index.html
        ├── login.html
        ├── recruiter.html
        └── register.html
```

## 4. Công nghệ sử dụng

- HTML5.
- CSS3.
- JavaScript (Vanilla JS).
- localStorage, sessionStorage.
- Tailwind CDN dùng ở trang xác thực.
- Font Awesome dùng ở giao diện recruiter.

## 5. Cách chạy dự án

### Cách 1: Chạy nhanh bằng mở file
1. Mở thư mục dự án trên máy.
2. Mở trang pages/index.html bằng trình duyệt.

### Cách 2: Chạy bằng local server (khuyến nghị)
1. Mở terminal tại thư mục dự án.
2. Chạy một trong hai lệnh:

```bash
python -m http.server 8000
```

hoặc

```bash
npx http-server
```

3. Truy cập địa chỉ server local hiển thị trên terminal.

## 6. Hướng dẫn sử dụng theo luồng

### 6.1. Luồng người dùng mới
1. Truy cập trang đăng ký.
2. Chọn loại tài khoản Candidate hoặc Recruiter.
3. Nhập đầy đủ thông tin bắt buộc.
4. Đăng nhập.
5. Hệ thống tự điều hướng sang màn hình phù hợp theo vai trò.

### 6.2. Luồng Candidate
1. Vào dashboard candidate.
2. Xem danh sách job.
3. Mở modal để xem chi tiết.
4. Ứng tuyển công việc phù hợp.
5. Vào khu vực CV để tạo mới hoặc upload.
6. Theo dõi trạng thái hồ sơ đã nộp.

### 6.3. Luồng Recruiter
1. Vào dashboard recruiter.
2. Tạo tin tuyển dụng mới.
3. Cập nhật tin khi cần.
4. Vào phần hồ sơ ứng viên để xử lý.
5. Vào phần ví để theo dõi số dư và giao dịch.
6. Gửi liên hệ khi cần hỗ trợ từ admin.

### 6.4. Luồng Admin
1. Vào dashboard admin.
2. Kiểm tra job pending.
3. Duyệt hoặc từ chối theo nội dung.
4. Theo dõi liên hệ hỗ trợ.
5. Quản lý người dùng và log hoạt động.

## 7. Dữ liệu và lưu trữ

Hệ thống hiện dùng localStorage/sessionStorage với các nhóm dữ liệu chính:
- Tài khoản người dùng.
- Danh sách công việc.
- Danh sách đơn ứng tuyển.
- Dữ liệu ví và giao dịch.
- Liên hệ hỗ trợ admin.

Đặc điểm vận hành:
- Dữ liệu được seed từ file Data/data-init.js khi cần.
- Một số dữ liệu có cơ chế key shared/legacy để tương thích.
- Có cập nhật gần thời gian thực giữa các tab nhờ storage event.

## 8. Tài khoản kiểm thử nhanh

Bạn có thể dùng tài khoản mẫu trong dữ liệu seed hoặc đăng ký mới trực tiếp từ giao diện.

## 9. Ghi chú vận hành quan trọng

- Đây là frontend-only, chưa có backend API riêng.
- Dữ liệu lưu trên trình duyệt, không đồng bộ theo cloud account.
- Nếu xóa localStorage, dữ liệu sẽ bị reset.
- Ví và giao dịch nội bộ đã tồn tại trong hệ thống frontend.
- Chưa có kênh realtime server-side như WebSocket/SSE.

## 10. Hạn chế hiện tại

- Chưa có database thật.
- Chưa mã hóa mật khẩu ở mức production.
- Chưa có xác minh email/khôi phục mật khẩu đầy đủ theo chuẩn production.
- Chưa upload file CV lên server/cloud thực.

## 11. Định hướng phát triển

### 11.1. Nền tảng backend
- Xây dựng API cho auth, job, application, wallet.
- Kết nối DB thật (SQL hoặc NoSQL).

### 11.2. Bảo mật
- Hash mật khẩu.
- Access token/refresh token.
- Kiểm soát phiên đăng nhập và bảo vệ endpoint.

### 11.3. Trải nghiệm người dùng
- Mở rộng bộ lọc tìm việc.
- Cải thiện thông báo trạng thái rõ hơn.
- Tối ưu giao diện mobile.

### 11.4. Vận hành
- Bổ sung test tự động.
- Chuẩn hóa logging/audit.
- Hoàn thiện quy trình triển khai.

## 12. Tác giả

- Nhóm phát triển Job Portal Platform.
