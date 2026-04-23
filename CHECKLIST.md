# SYSTEM TEST PLAN - Job Portal Platform

Tài liệu này là bản kiểm thử hệ thống cho Job Portal Platform hiện tại. Hệ thống đang là frontend thuần HTML/CSS/JS, dữ liệu chạy trên localStorage/sessionStorage và được seed từ [Data/data-init.js](Data/data-init.js). Tài liệu tập trung vào kiểm thử chức năng, phân quyền, đồng bộ dữ liệu và các tình huống lỗi quan trọng.

## 1. System Overview Test Scope

### 1.1. Các module chính cần test

- [ ] Auth: đăng ký, đăng nhập, đăng xuất, điều hướng theo role.
- [ ] User/Role: candidate, recruiter, admin, quyền truy cập theo vai trò.
- [ ] Job: danh sách job, xem chi tiết, tạo/sửa/xóa job, trạng thái job.
- [ ] Application: ứng tuyển, danh sách ứng tuyển, trạng thái hồ sơ.
- [ ] CV: tạo CV, upload CV, xóa CV, file validation.
- [ ] Wallet/Transactions: số dư recruiter, lịch sử giao dịch, duyệt nạp.
- [ ] Admin dashboard: duyệt job, quản lý user, ticket hỗ trợ, log hoạt động.
- [ ] Data persistence: localStorage/sessionStorage, seed data, storage event.
- [ ] Cross-page integration: luồng giữa login, candidate, recruiter, admin.


### 1.2. Cấu trúc trang hiện tại

- [ ] Public pages: `index.html`, `login.html`, `register.html` (thư mục `pages/`).
- [ ] Role pages: `candidate.html`, `recruiter.html`, `admin.html` (thư mục `pages/`).
- [ ] Debug page: `debug.html` (phục vụ kiểm thử và xử lý dữ liệu local).

- [ ] Controllers: `controllers/*.js` (ví dụ `controllers/admin.js`, `controllers/auth.js`, `controllers/job.js`).
- [ ] Modules: `modules/` (ví dụ `modules/admin/`, `modules/candidate/`, `modules/recruiter/` chứa logic tương ứng).
- [ ] Assets & styles: `assets/images/`, `css/` (ví dụ `assets/images/`, `css/index.css`, `css/candidate.css`).

### 1.3. Out of scopeA

- [ ] Backend API thật.
- [ ] Database thật.
- [ ] Thanh toán production.
- [ ] Bảo mật production như hash mật khẩu, token refresh, email verification server-side.

## 2. Test Environment

### 2.1. Môi trường đề xuất

- [ ] Windows.
- [ ] Chrome hoặc Edge phiên bản mới.
- [ ] Chạy bằng local server hoặc mở file trong trình duyệt nếu cần kiểm tra nhanh.
- [ ] DevTools mở để theo dõi console và storage.

### 2.2. Dữ liệu test tối thiểu

- [ ] 1 tài khoản Candidate.
- [ ] 1 tài khoản Recruiter.
- [ ] 1 tài khoản Admin.
- [ ] Một số job seed ở trạng thái open/closed/pending nếu có.
- [ ] Ít nhất 1 application mẫu.
- [ ] Ít nhất 1 CV mẫu.
- [ ] Ít nhất 1 transaction hoặc ticket mẫu nếu màn hình có dữ liệu đó.

### 2.3. Tiêu chí vào test

- [ ] Ứng dụng load được bình thường.
- [ ] Seed data đã được khởi tạo từ localStorage hoặc [Data/data-init.js](Data/data-init.js).
- [ ] Không có lỗi console làm gián đoạn luồng test chính.

### 2.4. Tiêu chí ra test

- [ ] Các test case bắt buộc đã chạy xong.
- [ ] Lỗi Critical/High đã được ghi nhận rõ.
- [ ] Có tổng hợp Pass/Fail.
- [ ] Có khuyến nghị trạng thái release.


## 3. Test Plan Theo Module

### 3.1. Auth Module

Chức năng cần test:

- [ ] Register Candidate.
- [ ] Register Recruiter.
- [ ] Kiểm tra trùng email.
- [ ] Validate required input.
- [ ] Login theo role.
- [ ] Logout.
- [ ] Route guarding / unauthorized access.
- [ ] Session restore / session missing.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| AUTH-01 | Đăng ký Candidate hợp lệ | Trang register mở, chưa có email trùng | Nhập đầy đủ thông tin Candidate và submit | Tạo tài khoản thành công, lưu vào storage | High |
| AUTH-02 | Đăng ký Recruiter hợp lệ | Trang register mở | Nhập đầy đủ thông tin Recruiter và submit | Tạo tài khoản Recruiter thành công | High |
| AUTH-03 | Email đăng ký bị trùng | Đã có email tồn tại trong storage | Nhập email trùng rồi submit | Báo lỗi, không tạo user mới | High |
| AUTH-04 | Thiếu field bắt buộc | Form register mở | Để trống 1 field bắt buộc rồi submit | Hiển thị validation, không submit | High |
| AUTH-05 | Đăng nhập thành công | Có user hợp lệ | Nhập đúng email/mật khẩu rồi login | Lưu currentUser và điều hướng đúng role | High |
| AUTH-06 | Đăng nhập sai mật khẩu | Có email đúng | Nhập sai mật khẩu rồi login | Báo lỗi, không vào dashboard | High |
| AUTH-07 | Đăng nhập email không tồn tại | Chưa có account tương ứng | Nhập email không tồn tại rồi login | Báo lỗi email không tồn tại | Medium |
| AUTH-08 | Đăng xuất | Đang ở trạng thái đã login | Bấm Logout | Xóa session hiện tại và về login | High |
| AUTH-09 | Truy cập sai role bằng URL trực tiếp | Đã login Candidate | Gõ URL recruiter/admin trực tiếp | Hệ thống chặn và điều hướng phù hợp | High |
| AUTH-10 | Mất session/currentUser | currentUser bị xóa hoặc hết phiên | Refresh trang hoặc vào lại dashboard | Không bị treo, chuyển về trạng thái hợp lệ | Medium |

### 3.2. Candidate Module

Chức năng cần test:

- [ ] Xem danh sách job.
- [ ] Tìm kiếm/lọc job nếu giao diện hỗ trợ.
- [ ] Mở chi tiết job.
- [ ] Ứng tuyển job.
- [ ] Không apply trùng.
- [ ] Lưu job/favorite nếu có.
- [ ] Xem lịch sử đơn ứng tuyển.
- [ ] Xem trạng thái hồ sơ.
- [ ] Xem thông báo từ admin.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| CAN-01 | Xem danh sách job | Đã login Candidate | Mở khu vực job list | Job hiển thị đúng dữ liệu seed/storage | High |
| CAN-02 | Tìm kiếm/lọc job | Có nhiều job mẫu | Tìm theo từ khóa hoặc bộ lọc | Danh sách thay đổi đúng theo điều kiện | Medium |
| CAN-03 | Mở modal chi tiết job | Có ít nhất 1 job | Chọn job và mở detail modal | Hiển thị title, company, salary, location, type, description | High |
| CAN-04 | Ứng tuyển job hợp lệ | Candidate đang login, job còn mở | Mở job và bấm Apply | Tạo application thành công | High |
| CAN-05 | Không apply trùng | Candidate đã apply job đó | Apply lại cùng job | Hệ thống chặn hoặc xử lý đúng rule hiện tại | Medium |
| CAN-06 | Không apply job closed | Có job trạng thái closed/pending | Thử apply job không hợp lệ | Nút apply bị chặn hoặc báo lỗi phù hợp | High |
| CAN-07 | Lưu/favorite job | Có chức năng lưu job | Bấm lưu và mở lại danh sách đã lưu | Job được lưu và hiển thị đúng | Medium |
| CAN-08 | Xem lịch sử ứng tuyển | Đã có application | Mở tab applied jobs | Danh sách ứng tuyển và trạng thái hiển thị đúng | High |
| CAN-09 | Xem thông báo admin | Có notification seed | Mở khu vực thông báo | Nội dung và badge chưa đọc hiển thị đúng | Medium |
| CAN-10 | Cập nhật trạng thái hồ sơ | Có application đang chờ | Quan sát trạng thái sau hành động liên quan | Trạng thái đổi đúng và đồng bộ | High |

### 3.3. CV Module

Chức năng cần test:

- [ ] Tạo CV mới.
- [ ] Upload CV hợp lệ.
- [ ] Từ chối file sai loại.
- [ ] Từ chối file vượt dung lượng.
- [ ] Xóa CV.
- [ ] Chọn CV mặc định.
- [ ] Đồng bộ danh sách CV khi thay đổi.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| CV-01 | Tạo CV mới | Candidate đang login | Nhập tên CV và lưu | CV mới xuất hiện trong danh sách | Medium |
| CV-02 | Upload CV hợp lệ | Có file .pdf hoặc .docx <= 5MB | Chọn file và upload | Upload thành công, tạo record CV | High |
| CV-03 | Upload file sai định dạng | Có file .png/.txt | Upload file không hợp lệ | Báo lỗi định dạng | High |
| CV-04 | Upload file quá dung lượng | Có file > 5MB | Upload file quá lớn | Báo lỗi dung lượng | High |
| CV-05 | Xóa CV | Có ít nhất 1 CV | Thực hiện delete CV | CV bị xóa khỏi danh sách | Medium |
| CV-06 | Đặt CV mặc định | Có nhiều CV | Chọn CV default | CV mặc định được lưu đúng | Medium |
| CV-07 | Danh sách CV cập nhật sau thao tác | Có thay đổi CV | Refresh danh sách hoặc reload trang | Danh sách phản ánh dữ liệu mới | Medium |

### 3.4. Recruiter Module

Chức năng cần test:

- [ ] Tạo job mới.
- [ ] Validation khi thiếu field.
- [ ] Sửa job.
- [ ] Xóa job.
- [ ] Xem danh sách ứng viên theo job.
- [ ] Cập nhật trạng thái hồ sơ ứng viên.
- [ ] Ví và lịch sử giao dịch.
- [ ] Gửi liên hệ hỗ trợ.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| REC-01 | Tạo job mới | Recruiter đã login | Nhập form create job và submit | Job mới xuất hiện trong danh sách | High |
| REC-02 | Thiếu field khi tạo job | Form tạo job mở | Để trống field bắt buộc và submit | Báo validation, không tạo job | High |
| REC-03 | Sửa job | Có job đã tạo | Mở job, chỉnh sửa và lưu | Job cập nhật theo dữ liệu mới | High |
| REC-04 | Xóa job | Có job tồn tại | Chọn xóa và xác nhận | Job biến mất khỏi danh sách | High |
| REC-05 | Xem applicants theo job | Có job và application liên quan | Mở danh sách ứng viên | Hiển thị đúng candidate theo job | High |
| REC-06 | Cập nhật trạng thái ứng viên | Có applicant record | Đổi trạng thái hồ sơ | Trạng thái lưu và hiển thị đúng | High |
| REC-07 | Kiểm tra ví recruiter | Có balance/transaction seed | Mở wallet modal | Balance và lịch sử giao dịch đúng | High |
| REC-08 | Gửi liên hệ hỗ trợ | Recruiter đã login | Nhập tiêu đề/nội dung và gửi | Ticket được lưu và có phản hồi hiển thị | Medium |
| REC-09 | Kiểm tra thiếu số dư nếu có phí đăng job | Balance thấp | Thử thao tác phát sinh phí | Hệ thống chặn hoặc báo rõ thiếu số dư | Medium |

### 3.5. Admin Dashboard Module

Chức năng cần test:

- [ ] Xem job pending.
- [ ] Duyệt job.
- [ ] Từ chối job.
- [ ] Đánh dấu vi phạm.
- [ ] Xóa/pin job nếu có.
- [ ] Quản lý user.
- [ ] Xử lý ticket hỗ trợ.
- [ ] Duyệt giao dịch nạp.
- [ ] Xem activity logs.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| ADM-01 | Xem danh sách pending jobs | Admin đã login | Mở khu vực pending jobs | Danh sách hiển thị đúng trạng thái | High |
| ADM-02 | Duyệt job | Có job pending | Chọn job và bấm approve | Job đổi sang trạng thái hợp lệ | High |
| ADM-03 | Từ chối job | Có job pending | Chọn reject | Job bị từ chối và lưu trạng thái | High |
| ADM-04 | Đánh dấu vi phạm | Có job cần xử lý | Chọn mark as violation | Job đổi trạng thái vi phạm | High |
| ADM-05 | Quản lý user | Có danh sách user | Mở user management và thao tác | Dữ liệu user cập nhật đúng | High |
| ADM-06 | Xử lý ticket hỗ trợ | Có ticket từ candidate/recruiter | Mở ticket và cập nhật phản hồi | Ticket đổi trạng thái đúng | High |
| ADM-07 | Duyệt giao dịch nạp | Có transaction chờ duyệt | Approve transaction | Recruiter balance cập nhật đúng | High |
| ADM-08 | Xem activity log | Có log seed | Mở activity log | Lịch sử hoạt động hiển thị đúng | Medium |

### 3.6. Data Persistence / Sync Module

Chức năng cần test:

- [ ] Lưu dữ liệu sau refresh.
- [ ] Seed lại dữ liệu khi localStorage bị xóa.
- [ ] Đồng bộ 2 tab cùng trình duyệt.
- [ ] Xử lý JSON lỗi trong storage.
- [ ] Giữ tính nhất quán giữa key current và legacy.

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| SYNC-01 | Persist sau refresh | Có dữ liệu vừa sửa | Refresh trang | Dữ liệu vẫn giữ nguyên | High |
| SYNC-02 | Đồng bộ 2 tab | Mở cùng 1 user ở 2 tab | Tab A thay đổi dữ liệu, quan sát tab B | Tab B nhận cập nhật qua storage event | High |
| SYNC-03 | Reset localStorage | Xóa localStorage | Reload ứng dụng | Seed được khởi tạo lại đúng | High |
| SYNC-04 | Legacy key vẫn hoạt động | Có dữ liệu lưu trên key cũ | Mở page dùng key legacy | Dữ liệu không bị mất / đọc đúng | Medium |
| SYNC-05 | JSON lỗi trong storage | Có key bị sửa thành JSON lỗi | Load lại ứng dụng | Fallback an toàn, không treo màn hình | Medium |


## 3.x. Kiểm thử logic nghiệp vụ (Logic Testing)

### Logic OTP
- [ ] OTP random 6 số, mỗi lần gửi khác nhau.
- [ ] OTP chỉ hợp lệ trong 1 khoảng thời gian (nếu có timeout).
- [ ] OTP chỉ xác thực cho đúng email/phone vừa đăng ký/quên mật khẩu.
- [ ] Gửi lại OTP sẽ ghi đè mã cũ.
- [ ] Nhập sai OTP nhiều lần không bị khóa tài khoản (nếu không có rule này).

### Logic phân quyền
- [ ] Candidate không truy cập recruiter/admin dashboard.
- [ ] Recruiter không truy cập admin dashboard.
- [ ] Admin có full quyền, không bị chặn bởi route guard.
- [ ] Không thể thao tác chức năng ngoài phạm vi role.

### Logic trạng thái job/application
- [ ] Job chỉ apply được khi trạng thái open.
- [ ] Không apply trùng 1 job.
- [ ] Khi admin duyệt job, trạng thái chuyển đúng (pending → open).
- [ ] Khi admin từ chối job, trạng thái chuyển đúng (pending → rejected).
- [ ] Khi recruiter xóa job, ứng viên không còn thấy job đó.
- [ ] Khi recruiter cập nhật trạng thái ứng viên, candidate nhận được thông báo.

### Logic đồng bộ multi-tab
- [ ] Thao tác ở tab A, tab B nhận cập nhật qua storage event.
- [ ] Không bị xung đột dữ liệu khi thao tác đồng thời.

### Logic backup/restore
- [ ] Export dữ liệu ra file JSON đúng cấu trúc.
- [ ] Import/restore dữ liệu từ file JSON không lỗi, dữ liệu đồng bộ toàn hệ thống.
- [ ] Restore dữ liệu không làm crash app.

### Logic UI/UX
- [ ] Toast/message hiển thị đúng, tự động ẩn, không che UI.
- [ ] Modal mở/đóng đúng logic, không bị kẹt modal.
- [ ] Các thao tác đều có feedback rõ ràng cho user.

### Logic edge-case
- [ ] Nhập dữ liệu lớn (job, CV, application) không làm treo UI.
- [ ] Xóa localStorage/sessionStorage rồi reload không crash.
- [ ] Nhập dữ liệu lỗi (email, file, số điện thoại) đều báo lỗi rõ ràng.
- [ ] Session hết hạn, currentUser bị xóa, refresh không bị treo app.

### Logic performance
- [ ] Dữ liệu lớn vẫn thao tác mượt, không lag UI.
- [ ] Filter/search nhiều job không bị delay bất thường.

### Logic bảo mật cơ bản
- [ ] Không lưu plain password trong localStorage (ghi chú nếu có).
- [ ] Không lộ thông tin nhạy cảm qua console/log.
- [ ] Không cho phép nhập script/XSS qua các form.

### 4.1. Candidate

- [ ] Được đăng ký, đăng nhập, đăng xuất.
- [ ] Được xem job, xem chi tiết job, apply job.
- [ ] Được xem danh sách ứng tuyển và trạng thái hồ sơ.
- [ ] Được tạo/upload/xóa CV theo rule hiện tại.
- [ ] Được xem thông báo từ admin.
- [ ] Không được truy cập recruiter dashboard.
- [ ] Không được truy cập admin dashboard.
- [ ] Không được thao tác quản trị user/job/ticket của admin.

### 4.2. Recruiter

- [ ] Được đăng ký, đăng nhập, đăng xuất.
- [ ] Được tạo/sửa/xóa job.
- [ ] Được xem ứng viên theo job và cập nhật trạng thái hồ sơ.
- [ ] Được xem ví và lịch sử giao dịch.
- [ ] Được gửi ticket hỗ trợ.
- [ ] Không được truy cập admin dashboard.
- [ ] Không được chỉnh sửa dữ liệu candidate ngoài phạm vi job của mình.

### 4.3. Admin

- [ ] Có full quyền trong admin dashboard.
- [ ] Được duyệt/từ chối/đánh dấu vi phạm job.
- [ ] Được quản lý user, ticket, log và giao dịch nạp.
- [ ] Được xem toàn bộ dữ liệu quản trị theo vai trò admin.
- [ ] Không bị chặn bởi route guard khi vào admin page hợp lệ.

## 5. Edge Cases

| Test ID | Mô tả | Preconditions | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| EDGE-01 | Login sai nhiều lần | Có user hợp lệ | Nhập sai mật khẩu nhiều lần | Báo lỗi đúng, không bị treo UI | Medium |
| EDGE-02 | Unauthorized access | Đã login sai role hoặc chưa login | Gõ trực tiếp URL role page | Bị chặn và chuyển về trang hợp lệ | High |
| EDGE-03 | Empty input | Form register/login/job trống | Submit form rỗng | Validation hiển thị đúng | High |
| EDGE-04 | Data invalid | Nhập email, số điện thoại, file không hợp lệ | Submit dữ liệu lỗi | Báo lỗi rõ ràng, không lưu dữ liệu | High |
| EDGE-05 | Session expired | currentUser bị xóa khỏi sessionStorage | Refresh hoặc quay lại page | Ứng dụng xử lý an toàn, về login | Medium |
| EDGE-06 | Corrupted storage JSON | Sửa key storage thành JSON lỗi | Reload app | Không crash, fallback dữ liệu an toàn | Medium |

## 6. Integration Flows

### 6.1. Login → browse job → apply job

- [ ] Login bằng Candidate.
- [ ] Mở danh sách job.
- [ ] Xem chi tiết 1 job còn mở.
- [ ] Bấm Apply.
- [ ] Kiểm tra application được tạo.
- [ ] Kiểm tra lịch sử đơn ứng tuyển cập nhật.

Expected result:

- [ ] Luồng hoàn tất không lỗi.
- [ ] Application mới xuất hiện với trạng thái hợp lệ.

### 6.2. Recruiter post job → candidate apply → admin review

- [ ] Login Recruiter và tạo job mới.
- [ ] Kiểm tra job xuất hiện trong danh sách quản lý hoặc pending.
- [ ] Login Candidate và apply job đó.
- [ ] Login Admin và mở danh sách pending/review jobs.
- [ ] Approve hoặc reject job theo rule hiện tại.
- [ ] Kiểm tra trạng thái dữ liệu đồng bộ ở cả 3 role.

Expected result:

- [ ] Job, application và review state đồng bộ đúng.
- [ ] Không có lệch dữ liệu giữa các page hoặc tab.

### 6.3. Recruiter transaction review flow

- [ ] Recruiter tạo giao dịch nạp nội bộ.
- [ ] Admin duyệt giao dịch.
- [ ] Kiểm tra balance recruiter tăng đúng.

Expected result:

- [ ] Transaction đổi trạng thái chính xác.
- [ ] Balance được cập nhật đúng giá trị.

## 7. Execution Checklist

- [ ] Đã reset localStorage/sessionStorage nếu cần.
- [ ] Đã chuẩn bị đủ tài khoản test.
- [ ] Đã chạy các test theo module.
- [ ] Đã ghi Pass/Fail cho từng test case.
- [ ] Đã tạo Bug ID cho lỗi phát hiện.
- [ ] Đã tổng hợp kết quả cuối đợt test.

## 8. Test Result Summary

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

## 9. Bug Log

| Bug ID | Test ID | Mức độ | Mô tả ngắn | Trạng thái |
|---|---|---|---|---|
| | | Critical / High / Medium / Low | | Open / Fixed / Retest |

## 10. Release Recommendation

- [ ] Ready for internal testing.
- [ ] Ready for UAT.
- [ ] Ready for release.
