# CHECKLIST - Job Portal Platform

Tài liệu gồm 2 phần chính:
- Checklist phát triển: đối chiếu chức năng đã có và hạng mục cần hoàn thiện.
- Checklist kiểm thử: danh sách test case chi tiết theo luồng nghiệp vụ thực tế.

## 1. Checklist phát triển

## 1.1. Chức năng đã có (xác nhận từ code)

### A. Xác thực và phân quyền
- [x] Đăng ký tài khoản Candidate.
- [x] Đăng ký tài khoản Recruiter.
- [x] Kiểm tra trùng email khi đăng ký.
- [x] Đăng nhập bằng email/mật khẩu.
- [x] Lưu phiên hiện tại bằng sessionStorage.
- [x] Điều hướng theo vai trò sau đăng nhập.
- [x] Chặn truy cập sai vai trò ở các trang dashboard.
- [x] Đăng xuất và xóa phiên đăng nhập.

### B. Candidate
- [x] Hiển thị danh sách job.
- [x] Mở modal chi tiết công việc.
- [x] Ứng tuyển job.
- [x] Xem danh sách job đã ứng tuyển.
- [x] Theo dõi trạng thái ứng tuyển.
- [x] Tạo bản ghi CV mới.
- [x] Upload CV (giới hạn định dạng và dung lượng).
- [x] Cập nhật giao diện khi danh sách CV thay đổi.
- [x] Xem thông báo từ admin.

### C. Recruiter
- [x] Tạo tin tuyển dụng mới.
- [x] Cập nhật tin tuyển dụng đã đăng.
- [x] Xóa tin tuyển dụng.
- [x] Hiển thị danh sách ứng viên theo job.
- [x] Cập nhật trạng thái hồ sơ ứng viên.
- [x] Quản lý ví (balance + lịch sử giao dịch).
- [x] Tạo và lưu giao dịch nội bộ.
- [x] Gửi liên hệ hỗ trợ đến admin.

### D. Admin
- [x] Xem danh sách job chờ xử lý.
- [x] Duyệt/từ chối/đánh dấu vi phạm job.
- [x] Xem danh sách người dùng quản trị.
- [x] Xử lý ticket liên hệ hỗ trợ.
- [x] Theo dõi lịch sử hoạt động quản trị.
- [x] Duyệt giao dịch nạp để cập nhật số dư recruiter.

## E. Thanh toán và ví
- [x] Tích hợp cổng thanh toán thực tế.
- [x] Đồng bộ trạng thái giao dịch .
- [x] Cơ chế đối soát giao dịch và chống sai lệch số dư.

### F. Real-time và trải nghiệm
- [x]thông báo thời gian thực server-side.
- [x]Tối ưu mobile layout và khả năng truy cập.
- [x] Chuẩn hóa thông báo lỗi theo từng form.

### I. Dữ liệu và đồng bộ
- [x] Khởi tạo dữ liệu mẫu.
- [x] Lưu dữ liệu qua localStorage.
- [x] Có cơ chế key shared/legacy cho một số collection.
- [x] Có cập nhật gần thời gian thực giữa các tab bằng storage event.

## 1.2. Việc cần làm tiếp (ưu tiên triển khai)

### A. Backend và database
- [ ] Thiết kế API cho auth, jobs, applications.
- [ ] Tách lớp service/controller khỏi logic UI hiện tại.
- [ ] Kết nối cơ sở dữ liệu thật.
- [ ] Đồng bộ dữ liệu đa thiết bị theo tài khoản.

### B. Bảo mật
- [ ] Hash mật khẩu trước khi lưu.
- [ ] Triển khai xác minh email đăng ký.
- [ ] Triển khai refresh token và vòng đời phiên.
- [ ] Hardening input validation phía server.

### C. Tệp và tài nguyên
- [ ] Upload CV lên server/cloud storage.
- [ ] Quản lý vòng đời file CV (xem, tải, xóa).
- [ ] Kiểm soát mime-type và scan file nâng cao.

### E. Kiểm thử và vận hành
- [ ] Viết unit test cho helper logic quan trọng.
- [ ] Viết integration test cho luồng auth/job/apply.
- [ ] Thiết lập regression checklist theo mỗi release.
- [ ] Bổ sung logging/audit chi tiết.

## 2. Checklist kiểm thử

## 2.1. Cách dùng checklist này

- Mỗi test case có mã TC để dễ trace bug.
- Khi chạy test, điền thêm vào từng case:
	- Kết quả thực tế.
	- Trạng thái: Pass hoặc Fail.
	- Bug ID (nếu Fail).

Mẫu ghi nhanh cho mỗi test case:

```text
Kết quả thực tế: ...
Trạng thái: [ ] Pass  [ ] Fail
Bug ID: ...
```

## 2.2. Tiền điều kiện chung trước khi test

- [ ] Đã mở project bằng local server.
- [ ] Đã xóa cache cũ nếu cần: localStorage và sessionStorage.
- [ ] Đã chuẩn bị 3 loại tài khoản: candidate, recruiter, admin.
- [ ] Đã có dữ liệu seed hoặc dữ liệu test tối thiểu để kiểm tra.
- [ ] Đã mở DevTools để theo dõi lỗi console khi cần.

## 2.3. Nhóm test xác thực và phiên đăng nhập

### TC-AUTH-01 Đăng ký Candidate hợp lệ
- Mục tiêu: tạo mới tài khoản candidate thành công.
- Dữ liệu test: họ tên, email mới, mật khẩu, ngày sinh >= 16 tuổi, địa điểm.
- Bước test:
	1. Mở trang register.
	2. Chọn tab Candidate.
	3. Nhập đủ dữ liệu hợp lệ.
	4. Bấm Đăng ký.
- Kỳ vọng:
	- Hiển thị thông báo thành công.
	- Tài khoản được lưu vào localStorage.

### TC-AUTH-02 Đăng ký Recruiter hợp lệ
- Mục tiêu: tạo mới tài khoản recruiter.
- Dữ liệu test: tên công ty, email mới, số điện thoại, mật khẩu.
- Bước test:
	1. Mở trang register.
	2. Chọn tab Recruiter.
	3. Nhập đầy đủ dữ liệu.
	4. Bấm Đăng ký.
- Kỳ vọng:
	- Tạo user role recruiter.
	- Có thể đăng nhập bằng tài khoản vừa tạo.

### TC-AUTH-03 Đăng ký email trùng
- Mục tiêu: chặn tạo user trùng email.
- Bước test:
	1. Dùng email đã tồn tại trong hệ thống.
	2. Nhập đủ các trường còn lại.
	3. Bấm Đăng ký.
- Kỳ vọng:
	- Báo lỗi email đã tồn tại.
	- Không thêm user mới.

### TC-AUTH-04 Đăng ký thiếu trường bắt buộc
- Mục tiêu: kiểm tra required validation.
- Bước test:
	1. Để trống 1 trường bắt buộc.
	2. Bấm Đăng ký.
- Kỳ vọng:
	- Hiển thị lỗi yêu cầu nhập đủ thông tin.
	- Không submit dữ liệu.

### TC-AUTH-05 Đăng nhập thành công
- Mục tiêu: xác thực đúng tài khoản/mật khẩu.
- Bước test:
	1. Mở login.
	2. Nhập tài khoản hợp lệ.
	3. Bấm Đăng nhập.
- Kỳ vọng:
	- Lưu currentUser vào sessionStorage.
	- Điều hướng theo đúng role.

### TC-AUTH-06 Đăng nhập sai mật khẩu
- Mục tiêu: kiểm tra xử lý password sai.
- Bước test:
	1. Nhập email đúng.
	2. Nhập mật khẩu sai.
	3. Bấm Đăng nhập.
- Kỳ vọng:
	- Báo lỗi sai mật khẩu.
	- Không chuyển trang dashboard.

### TC-AUTH-07 Đăng nhập email không tồn tại
- Mục tiêu: chặn đăng nhập tài khoản không có.
- Bước test:
	1. Nhập email chưa đăng ký.
	2. Nhập mật khẩu bất kỳ.
	3. Bấm Đăng nhập.
- Kỳ vọng:
	- Báo lỗi email không tồn tại.

### TC-AUTH-08 Đăng xuất
- Mục tiêu: kết thúc phiên đăng nhập.
- Bước test:
	1. Đăng nhập vào dashboard bất kỳ.
	2. Bấm Logout.
- Kỳ vọng:
	- Xóa currentUser trong sessionStorage.
	- Quay về login.

## 2.4. Nhóm test điều hướng và phân quyền

### TC-NAV-01 Điều hướng trang public
- Bước test:
	1. Mở index.
	2. Bấm link login/register.
- Kỳ vọng: mở đúng trang tương ứng.

### TC-NAV-02 Điều hướng theo role sau login
- Bước test:
	1. Login bằng candidate.
	2. Logout, login bằng recruiter.
	3. Logout, login bằng admin.
- Kỳ vọng: mỗi role vào đúng dashboard.

### TC-NAV-03 Chặn truy cập sai quyền
- Bước test:
	1. Login candidate.
	2. Gõ trực tiếp URL recruiter/admin.
- Kỳ vọng: hệ thống chặn và điều hướng lại hợp lệ.

### TC-NAV-04 Điều hướng menu sidebar
- Bước test:
	1. Vào dashboard.
	2. Bấm từng mục menu.
- Kỳ vọng: đúng section được mở, không lệch nội dung.

## 2.5. Nhóm test Candidate

### TC-CAN-01 Xem danh sách job
- Bước test:
	1. Login candidate.
	2. Vào khu vực jobs.
- Kỳ vọng: hiển thị danh sách job từ dữ liệu hiện tại.

### TC-CAN-02 Xem modal chi tiết job
- Bước test:
	1. Chọn 1 job bất kỳ.
	2. Mở modal chi tiết.
- Kỳ vọng: hiển thị title, company, salary, location, type, description, requirements.

### TC-CAN-03 Ứng tuyển job
- Bước test:
	1. Mở chi tiết 1 job chưa apply.
	2. Bấm Ứng tuyển.
- Kỳ vọng: tạo application record thành công.

### TC-CAN-04 Không apply trùng (nếu có rule)
- Bước test:
	1. Apply cùng một job lần 2.
- Kỳ vọng: hệ thống xử lý đúng theo rule hiện tại, không tạo dữ liệu sai.

### TC-CAN-05 Tạo CV mới
- Bước test:
	1. Nhập tên CV mới.
	2. Bấm tạo CV.
- Kỳ vọng: xuất hiện trong danh sách CV.

### TC-CAN-06 Upload CV hợp lệ
- Dữ liệu test: file .pdf hoặc .docx <= 5MB.
- Bước test:
	1. Chọn file hợp lệ.
	2. Upload.
- Kỳ vọng: thông báo thành công, lưu record CV.

### TC-CAN-07 Upload CV sai định dạng
- Dữ liệu test: file .png hoặc .txt.
- Bước test:
	1. Upload file sai định dạng.
- Kỳ vọng: báo lỗi định dạng không hợp lệ.

### TC-CAN-08 Upload CV quá dung lượng
- Dữ liệu test: file .pdf > 5MB.
- Bước test:
	1. Upload file quá lớn.
- Kỳ vọng: báo lỗi vượt giới hạn dung lượng.

### TC-CAN-09 Kiểm tra đơn ứng tuyển
- Bước test:
	1. Vào mục đơn đã ứng tuyển.
- Kỳ vọng: hiển thị đúng danh sách và trạng thái.

### TC-CAN-10 Kiểm tra thông báo từ admin
- Bước test:
	1. Vào mục thông báo.
- Kỳ vọng: hiển thị đúng nội dung, badge cập nhật đúng số chưa đọc.

## 2.6. Nhóm test Recruiter

### TC-REC-01 Tạo job mới
- Bước test:
	1. Mở form tạo job.
	2. Nhập đủ field bắt buộc.
	3. Submit.
- Kỳ vọng: job mới xuất hiện trong danh sách quản lý.

### TC-REC-02 Validation khi thiếu field job
- Bước test:
	1. Để trống ít nhất 1 field bắt buộc.
	2. Submit form.
- Kỳ vọng: báo lỗi, không tạo job.

### TC-REC-03 Sửa job
- Bước test:
	1. Chọn 1 job đã có.
	2. Chỉnh sửa nội dung.
	3. Lưu.
- Kỳ vọng: danh sách cập nhật theo dữ liệu mới.

### TC-REC-04 Xóa job
- Bước test:
	1. Chọn 1 job.
	2. Bấm xóa và xác nhận.
- Kỳ vọng: job không còn xuất hiện.

### TC-REC-05 Xử lý hồ sơ ứng viên
- Bước test:
	1. Mở danh sách applicants.
	2. Chọn 1 hồ sơ và đổi trạng thái.
- Kỳ vọng: trạng thái lưu đúng và hiển thị đúng.

### TC-REC-06 Kiểm tra ví
- Bước test:
	1. Mở modal ví.
	2. Kiểm tra balance, lịch sử giao dịch.
- Kỳ vọng: dữ liệu hiển thị đúng theo localStorage.

### TC-REC-07 Tạo giao dịch nạp nội bộ
- Bước test:
	1. Thực hiện thao tác nạp theo luồng hiện tại.
- Kỳ vọng: tạo bản ghi giao dịch chờ duyệt và hiển thị lịch sử.

### TC-REC-08 Gửi liên hệ hỗ trợ
- Bước test:
	1. Nhập tiêu đề và nội dung liên hệ.
	2. Gửi.
- Kỳ vọng: ticket được lưu, hiển thị thông báo thành công.

## 2.7. Nhóm test Admin

### TC-ADM-01 Xem danh sách pending jobs
- Bước test:
	1. Login admin.
	2. Mở khu vực pending jobs.
- Kỳ vọng: hiển thị đúng danh sách theo trạng thái.

### TC-ADM-02 Duyệt job
- Bước test:
	1. Chọn 1 pending job.
	2. Bấm duyệt.
- Kỳ vọng: trạng thái job cập nhật đúng.

### TC-ADM-03 Từ chối/vi phạm job
- Bước test:
	1. Chọn job cần xử lý.
	2. Bấm từ chối hoặc đánh dấu vi phạm.
- Kỳ vọng: trạng thái đổi đúng, dữ liệu được lưu.

### TC-ADM-04 Quản lý user
- Bước test:
	1. Mở danh sách user.
	2. Thực hiện thao tác quản trị được hỗ trợ.
- Kỳ vọng: dữ liệu user cập nhật đúng.

### TC-ADM-05 Xử lý ticket hỗ trợ
- Bước test:
	1. Mở danh sách liên hệ.
	2. Cập nhật trạng thái/ghi chú phản hồi.
- Kỳ vọng: ticket cập nhật đúng và có lịch sử xử lý.

### TC-ADM-06 Duyệt giao dịch nạp
- Bước test:
	1. Mở danh sách giao dịch chờ duyệt.
	2. Duyệt 1 giao dịch.
- Kỳ vọng: số dư recruiter tăng đúng, giao dịch đổi trạng thái.

## 2.8. Nhóm test đồng bộ dữ liệu

### TC-SYNC-01 Đồng bộ 2 tab cùng trình duyệt
- Bước test:
	1. Mở tab A và tab B cùng user.
	2. Tab A thay đổi dữ liệu (ví dụ tạo job/cập nhật trạng thái).
	3. Quan sát tab B.
- Kỳ vọng: tab B nhận cập nhật gần thời gian thực qua storage event.

### TC-SYNC-02 Persist sau refresh
- Bước test:
	1. Tạo hoặc sửa dữ liệu.
	2. F5 refresh trang.
- Kỳ vọng: dữ liệu vẫn được giữ đúng.

### TC-SYNC-03 Reset dữ liệu local
- Bước test:
	1. Xóa localStorage.
	2. Tải lại hệ thống.
- Kỳ vọng: dữ liệu seed khởi tạo lại theo logic hiện tại.

## 2.9. Nhóm test edge cases

### TC-EDGE-01 Chuỗi dài
- Bước test: nhập title/mô tả rất dài.
- Kỳ vọng: không crash, UI không vỡ nghiêm trọng.

### TC-EDGE-02 Ký tự đặc biệt và Unicode
- Bước test: nhập dữ liệu có dấu tiếng Việt, ký tự đặc biệt.
- Kỳ vọng: lưu và hiển thị đúng encoding.

### TC-EDGE-03 localStorage JSON lỗi
- Bước test: sửa thủ công key thành JSON lỗi.
- Kỳ vọng: ứng dụng fallback an toàn, không treo màn hình.

### TC-EDGE-04 Dung lượng localStorage giới hạn
- Bước test: giả lập lưu dữ liệu lớn liên tục.
- Kỳ vọng: xử lý lỗi ghi dữ liệu rõ ràng, không mất ổn định toàn app.

## 2.10. Bảng tổng hợp kết quả test cho mỗi đợt

| Hạng mục | Giá trị |
|---|---|
| Người test | |
| Ngày test | |
| Môi trường test | |
| Tổng số test case | |
| Số Pass | |
| Số Fail | |
| Tỷ lệ Pass | |
| Ghi chú | |

## 2.11. Danh sách bug phát hiện

| Bug ID | Test Case | Mức độ | Mô tả ngắn | Trạng thái |
|---|---|---|---|---|
| | | Critical/High/Medium/Low | | Open/Fixed/Retest |

## 3. Kết quả test và theo dõi lỗi

### Tổng hợp đợt test
- [ ] Ngày test.
- [ ] Người test.
- [ ] Tổng số case đã chạy.
- [ ] Số case pass/fail.

### Danh sách lỗi phát hiện
- [ ] Critical.
- [ ] High.
- [ ] Medium.
- [ ] Low.

### Trạng thái release đề xuất
- [ ] Ready for internal testing.
- [ ] Ready for UAT.
- [ ] Ready for release.
