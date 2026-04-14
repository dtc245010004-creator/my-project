# Checklist Kiểm Thử Job Portal Platform

## 1. Chuẩn bị môi trường

- [ ] Đã mở đúng thư mục gốc `JobPortal-main` trong VS Code.
- [ ] Dự án được chạy qua Live Server hoặc một HTTP server tương đương, không mở trực tiếp bằng `file://`.
- [ ] Trình duyệt kiểm thử là Chrome hoặc Edge phiên bản hiện đại.
- [ ] Đã kiểm tra thư mục `assets/images/` và file logo vẫn tồn tại.
- [ ] Đã mở được các trang `pages/index.html`, `pages/login.html`, `pages/register.html` mà không báo lỗi tải tài nguyên.
- [ ] File `Data/data-init.js` tải bình thường và không phát sinh lỗi cú pháp trên console.
- [ ] Không có extension trình duyệt nào can thiệp vào localStorage/sessionStorage trong quá trình test.

## 2. Kiểm tra khởi tạo dữ liệu

- [ ] Khi tải trang lần đầu, hệ thống tự động nạp dữ liệu mẫu.
- [ ] localStorage có khóa `JOBS_DATA` sau khi khởi tạo.
- [ ] localStorage có khóa `APPLICATIONS_DATA` sau khi khởi tạo.
- [ ] localStorage có khóa `users` sau khi khởi tạo.
- [ ] localStorage có khóa `jobs` để hỗ trợ legacy page.
- [ ] localStorage có khóa `applications` để hỗ trợ legacy page.
- [ ] localStorage có khóa `jobPosts`.
- [ ] localStorage có khóa `applicants`.
- [ ] localStorage có khóa `savedJobs` và giá trị ban đầu là mảng rỗng.
- [ ] localStorage có khóa `candidateCVs`.
- [ ] localStorage có khóa `allTransactions` và `ALL_TRANSACTIONS_DATA`.
- [ ] sessionStorage có khóa `currentUser` sau khi khởi tạo.
- [ ] Dữ liệu seed chứa đủ 3 vai trò: admin, recruiter, candidate.
- [ ] Dữ liệu seed có ít nhất một tin tuyển dụng đang hoạt động và một tin đã đóng.
- [ ] Dữ liệu seed có ít nhất một hồ sơ ứng tuyển ở trạng thái `pending` và một hồ sơ ở trạng thái khác.

## 3. Kiểm tra trang chủ

- [ ] Trang chủ tải lên thành công và không hiển thị lỗi layout.
- [ ] Logo hiển thị đúng.
- [ ] Thanh điều hướng trên trang chủ hiển thị đúng các mục chính.
- [ ] Nút hoặc liên kết đăng nhập hoạt động đúng.
- [ ] Nút hoặc liên kết đăng ký hoạt động đúng.
- [ ] Danh sách việc làm mới nhất được hiển thị.
- [ ] Mỗi thẻ công việc có đầy đủ tiêu đề, công ty, lương, địa điểm và trạng thái.
- [ ] Công việc đang hoạt động và công việc đã đóng được phân biệt rõ.
- [ ] Ô tìm kiếm chấp nhận nhập từ khóa.
- [ ] Tìm theo tên công việc trả về kết quả đúng.
- [ ] Tìm theo tên công ty trả về kết quả đúng.
- [ ] Tìm với từ khóa không tồn tại hiển thị trạng thái không có kết quả hợp lý.
- [ ] Giao diện trang chủ không vỡ khi co màn hình xuống kích thước nhỏ.

## 4. Kiểm tra đăng nhập

- [ ] Mở trang đăng nhập thành công.
- [ ] Trường email hiển thị placeholder và trạng thái focus đúng.
- [ ] Trường mật khẩu cho phép nhập và ẩn hiện mật khẩu đúng.
- [ ] Nút ghi nhớ tôi hiển thị đúng.
- [ ] Liên kết quên mật khẩu mở modal khôi phục.
- [ ] Liên kết điều khoản sử dụng mở nội dung điều khoản.
- [ ] Liên kết chính sách bảo mật mở nội dung chính sách.
- [ ] Đăng nhập bằng email rỗng và mật khẩu rỗng hiển thị lỗi phù hợp.
- [ ] Đăng nhập bằng email không tồn tại hiển thị lỗi email.
- [ ] Đăng nhập bằng mật khẩu sai hiển thị lỗi mật khẩu.
- [ ] Đăng nhập bằng tài khoản admin chuyển đúng sang dashboard admin.
- [ ] Đăng nhập bằng tài khoản recruiter chuyển đúng sang dashboard recruiter.
- [ ] Đăng nhập bằng tài khoản candidate chuyển đúng sang dashboard candidate.
- [ ] Sau khi đăng nhập thành công, sessionStorage cập nhật currentUser đúng dữ liệu.
- [ ] Khi tải lại trang sau đăng nhập, người dùng vẫn được xem là đã đăng nhập nếu luồng của trang yêu cầu.

## 5. Kiểm tra khôi phục mật khẩu

- [ ] Mở modal khôi phục mật khẩu từ trang đăng nhập.
- [ ] Bước 1 yêu cầu nhập email.
- [ ] Gửi OTP thành công chuyển sang bước 2.
- [ ] Mã OTP demo hiển thị hoặc được chấp nhận theo giá trị 123456.
- [ ] Nhập OTP sai hiển thị thông báo lỗi.
- [ ] Nhập mật khẩu mới rỗng hiển thị lỗi.
- [ ] Nhập OTP đúng và mật khẩu mới hợp lệ cho phép cập nhật.
- [ ] Sau khi hoàn tất, modal đóng hoặc quay về trạng thái bình thường đúng luồng.

## 6. Kiểm tra đăng ký ứng viên

- [ ] Chọn tab hoặc chế độ đăng ký ứng viên hiển thị đúng form ứng viên.
- [ ] Các trường bắt buộc gồm họ tên, email, mật khẩu, ngày sinh và nơi ở.
- [ ] Không cho phép đăng ký khi thiếu một trong các trường bắt buộc.
- [ ] Không cho phép đăng ký khi email trùng với người dùng đã có.
- [ ] Không cho phép đăng ký nếu ngày sinh khiến ứng viên dưới 16 tuổi.
- [ ] Nhập thông tin hợp lệ tạo tài khoản candidate mới.
- [ ] Tài khoản candidate mới được lưu vào localStorage.
- [ ] Sau khi đăng ký thành công, luồng OTP hoạt động đúng.
- [ ] Màn hình xác thực OTP xuất hiện đúng sau khi gửi thông tin hợp lệ.
- [ ] Xác thực OTP sai bị từ chối.
- [ ] Xác thực OTP đúng cho phép hoàn tất đăng ký.

## 7. Kiểm tra đăng ký nhà tuyển dụng

- [ ] Chọn tab hoặc chế độ đăng ký nhà tuyển dụng hiển thị đúng form recruiter.
- [ ] Các trường bắt buộc gồm tên công ty, email, số điện thoại và mật khẩu.
- [ ] Không cho phép đăng ký khi thiếu dữ liệu bắt buộc.
- [ ] Không cho phép đăng ký khi email trùng với tài khoản đã tồn tại.
- [ ] Nhập thông tin hợp lệ tạo tài khoản recruiter mới.
- [ ] Tài khoản recruiter mới được lưu vào localStorage.
- [ ] Sau khi đăng ký thành công, OTP được yêu cầu đúng luồng.
- [ ] OTP đúng cho phép hoàn tất đăng ký.
- [ ] OTP sai hiển thị thông báo lỗi.

## 8. Kiểm tra đăng xuất

- [ ] Nút đăng xuất xuất hiện trên các trang cần xác thực.
- [ ] Nhấn đăng xuất xóa currentUser khỏi sessionStorage.
- [ ] Sau khi đăng xuất, hệ thống quay về trang đăng nhập.
- [ ] Không còn truy cập trực tiếp được dashboard nếu chưa đăng nhập.

## 9. Kiểm tra phân quyền và điều hướng

- [ ] Người dùng chưa đăng nhập bị chuyển về login khi truy cập trang yêu cầu quyền.
- [ ] Candidate không truy cập được trang admin.
- [ ] Recruiter không truy cập được trang admin.
- [ ] Admin không bị chặn khi truy cập dashboard admin.
- [ ] Candidate được điều hướng về candidate.html sau khi đăng nhập.
- [ ] Recruiter được điều hướng về recruiter.html sau khi đăng nhập.
- [ ] Admin được điều hướng về admin.html sau khi đăng nhập.
- [ ] Khi role không hợp lệ, hệ thống chuyển về trang chủ hoặc trang phù hợp theo logic hiện tại.

## 10. Kiểm tra dashboard ứng viên

- [ ] Trang dashboard ứng viên tải đúng khi đăng nhập bằng tài khoản candidate.
- [ ] Tên người dùng hiển thị đúng.
- [ ] Vai trò hiển thị là Ứng viên.
- [ ] Danh sách việc làm hiển thị đúng dữ liệu mẫu.
- [ ] Bộ lọc công việc hoạt động đúng.
- [ ] Khu vực hồ sơ hoặc trạng thái ứng tuyển hiển thị đúng.
- [ ] Khu vực thông báo hiển thị đúng dữ liệu seed.
- [ ] Khu vực hỗ trợ hoặc liên hệ hiển thị đúng nội dung.
- [ ] Các biểu mẫu ứng tuyển mở đúng và nhận dữ liệu.
- [ ] Ứng tuyển thành công ghi nhận đúng thông tin đơn ứng tuyển.
- [ ] Việc lưu tin hoặc theo dõi công việc hoạt động nếu có trên giao diện.

## 11. Kiểm tra dashboard nhà tuyển dụng

- [ ] Trang dashboard recruiter tải đúng khi đăng nhập bằng tài khoản recruiter.
- [ ] Tên công ty hiển thị đúng.
- [ ] Vai trò hiển thị là Nhà tuyển dụng.
- [ ] Danh sách tin tuyển dụng hiển thị đúng dữ liệu seed.
- [ ] Trạng thái tin đăng được hiển thị rõ ràng.
- [ ] Có thể xem các tin đang mở và tin đã đóng.
- [ ] Các bộ lọc hoặc tab quản lý tin hoạt động đúng.
- [ ] Khu vực quản lý ứng viên hiển thị đúng dữ liệu liên quan.
- [ ] Thao tác thêm/sửa/xóa tin nếu có giao diện thì hoạt động đúng.
- [ ] Các hành động liên quan đến duyệt hồ sơ hoặc xem hồ sơ được hiển thị đúng.

## 12. Kiểm tra dashboard quản trị viên

- [ ] Trang dashboard admin tải đúng khi đăng nhập bằng tài khoản admin.
- [ ] Tên người dùng và vai trò hiển thị đúng.
- [ ] Sidebar hoặc menu quản trị hiển thị đầy đủ các mục.
- [ ] Có thể xem nhóm dữ liệu ứng viên.
- [ ] Có thể xem nhóm dữ liệu nhà tuyển dụng.
- [ ] Có thể xem nhóm dữ liệu tuyển dụng hoặc tin đăng.
- [ ] Có thể xem trạng thái hồ sơ ứng tuyển.
- [ ] Có thể xem nội dung liên quan đến quản lý hệ thống nếu có.
- [ ] Các bảng dữ liệu hiển thị đúng, không thiếu cột quan trọng.
- [ ] Các bộ lọc theo phạm vi dữ liệu hoạt động đúng.
- [ ] Các thao tác duyệt, từ chối, khóa hoặc mở khóa nếu có giao diện thì hoạt động đúng.

## 13. Kiểm tra trang debug

- [ ] Trang debug tải được bình thường.
- [ ] Có thể xem dashboard trạng thái dữ liệu hệ thống.
- [ ] Có thể quan sát state của công việc, người dùng, ứng tuyển và các khóa lưu trữ khác.
- [ ] Làm mới dữ liệu từ debug phản ánh đúng vào localStorage/sessionStorage.
- [ ] Debug không làm hỏng dữ liệu thật đang dùng để test các màn hình khác.

## 14. Kiểm tra dữ liệu công việc

- [ ] Danh sách công việc có đủ dữ liệu mẫu ban đầu.
- [ ] Công việc hiển thị đúng title, company, salary, location, type và status.
- [ ] Công việc được render đúng số lượng so với dữ liệu seed.
- [ ] Công việc có trạng thái mở và đóng hiển thị khác nhau.
- [ ] Dữ liệu công việc không bị trùng bất thường sau khi tải lại trang.

## 15. Kiểm tra dữ liệu ứng tuyển

- [ ] Danh sách application được tạo đúng từ seed.
- [ ] Mỗi application có jobId, candidateId, candidateName, recruiterEmail và status.
- [ ] Mốc thời gian appliedAt hiển thị hợp lệ.
- [ ] Trạng thái pending và reviewed được phân biệt đúng.
- [ ] Dữ liệu ứng tuyển không bị mất sau khi tải lại trang nếu chưa reset.

## 16. Kiểm tra dữ liệu người dùng

- [ ] Người dùng admin tồn tại.
- [ ] Người dùng recruiter tồn tại.
- [ ] Người dùng candidate tồn tại.
- [ ] Email được chuẩn hóa khi so sánh không phân biệt hoa thường.
- [ ] Tài khoản mới tạo được lưu vào danh sách users.
- [ ] Người dùng mới không làm hỏng dữ liệu seed cũ.

## 17. Kiểm tra phản hồi lỗi và thông báo

- [ ] Thông báo lỗi dùng ngôn ngữ rõ ràng, dễ hiểu.
- [ ] Lỗi email, mật khẩu, OTP và thiếu dữ liệu được hiển thị đúng vị trí.
- [ ] Thông báo thành công xuất hiện sau thao tác hợp lệ.
- [ ] Lỗi không làm vỡ layout hoặc khiến form treo.
- [ ] Sau khi sửa dữ liệu nhập sai, thông báo lỗi biến mất hoặc cập nhật đúng.

## 18. Kiểm tra giao diện và responsive

- [ ] Trang login không vỡ trên màn hình desktop.
- [ ] Trang register không vỡ trên màn hình desktop.
- [ ] Trang chủ không vỡ trên màn hình desktop.
- [ ] Dashboard ứng viên không vỡ trên màn hình desktop.
- [ ] Dashboard nhà tuyển dụng không vỡ trên màn hình desktop.
- [ ] Dashboard admin không vỡ trên màn hình desktop.
- [ ] Giao diện vẫn đọc được trên màn hình laptop nhỏ hoặc tablet.
- [ ] Các nút và form không bị tràn ngang trên màn hình hẹp.
- [ ] Modal mở đúng trung tâm và có lớp nền mờ đúng.
- [ ] Có thể cuộn trang khi nội dung dài mà không bị khóa giao diện.

## 19. Kiểm tra điều hướng tổng thể

- [ ] Các liên kết từ trang chủ sang login/register hoạt động.
- [ ] Các liên kết trong sidebar dashboard hoạt động.
- [ ] Điều hướng không làm mất dữ liệu đang có ngoài luồng mong đợi.
- [ ] Nút quay lại hoặc chuyển trang không tạo vòng lặp điều hướng.
- [ ] Các trang được mở đúng file HTML tương ứng.

## 20. Kiểm tra sau khi tải lại trang

- [ ] Tải lại trang chủ không làm mất dữ liệu seed.
- [ ] Tải lại sau đăng nhập vẫn giữ trạng thái theo sessionStorage nếu luồng hiện tại hỗ trợ.
- [ ] Tải lại sau khi tạo tài khoản vẫn thấy dữ liệu mới trong localStorage.
- [ ] Tải lại sau khi đóng modal không gây lỗi JavaScript.

## 21. Kiểm tra trước khi bàn giao

- [ ] Xác nhận tài khoản demo vẫn đăng nhập được.
- [ ] Xác nhận các luồng đăng ký và OTP hoạt động đúng.
- [ ] Xác nhận các dashboard mở đúng theo vai trò.
- [ ] Xác nhận không có lỗi console nghiêm trọng ở luồng chính.
- [ ] Xác nhận nội dung README phản ánh đúng trạng thái hiện tại của hệ thống.
- [ ] Xác nhận checklist này đủ chi tiết để viện kiểm thử sử dụng trực tiếp.

## 22. Kiểm thử theo quy trình nghiệp vụ

### 22.1. Quy trình của ứng viên

- [ ] Truy cập trang chủ và xác nhận danh sách việc làm hiển thị đúng trước khi đăng nhập.
- [ ] Đăng ký tài khoản ứng viên thành công với dữ liệu hợp lệ.
- [ ] Đăng nhập bằng tài khoản ứng viên vừa tạo hoặc tài khoản demo.
- [ ] Vào dashboard ứng viên và xác nhận CV, job đã lưu, lịch sử ứng tuyển, thông báo hiển thị đúng.
- [ ] Mở chi tiết một job và kiểm tra thông tin công việc đầy đủ.
- [ ] Chọn CV phù hợp, nhập lời nhắn và gửi ứng tuyển thành công.
- [ ] Xác nhận đơn ứng tuyển mới xuất hiện trong lịch sử hoặc trạng thái hồ sơ.
- [ ] Theo dõi trạng thái hồ sơ và xác nhận dữ liệu thay đổi đúng sau khi refresh.
- [ ] Đăng xuất và xác nhận quay về đúng màn hình đăng nhập.

### 22.2. Quy trình của nhà tuyển dụng

- [ ] Đăng ký tài khoản nhà tuyển dụng thành công với dữ liệu hợp lệ.
- [ ] Đăng nhập bằng tài khoản recruiter và vào đúng dashboard recruiter.
- [ ] Xác nhận các chỉ số tổng quan về jobs, hồ sơ và lịch phỏng vấn hiển thị đúng.
- [ ] Tạo một tin tuyển dụng mới với mô tả, lương, địa điểm, yêu cầu và số lượng hồ sơ tối đa.
- [ ] Xác nhận tin đăng mới xuất hiện trong danh sách quản lý.
- [ ] Lọc danh sách ứng viên theo trạng thái, thời gian và từ khóa tìm kiếm.
- [ ] Mở một hồ sơ ứng viên và kiểm tra nội dung CV, email, kỹ năng, thời gian nộp.
- [ ] Thực hiện thao tác liên quan đến phỏng vấn hoặc chuyển trạng thái hồ sơ nếu giao diện hỗ trợ.
- [ ] Kiểm tra chính sách phí và số liệu ước tính liên quan đến tin đăng.
- [ ] Gửi liên hệ hỗ trợ hoặc ghi chú xử lý nếu có tình huống phát sinh.
- [ ] Đăng xuất và xác nhận dữ liệu vẫn còn lưu đúng trong trình duyệt.

### 22.3. Quy trình của quản trị viên

- [ ] Đăng nhập bằng tài khoản admin và vào đúng dashboard quản trị.
- [ ] Xác nhận tổng quan hệ thống hiển thị đúng các nhóm dữ liệu quan trọng.
- [ ] Kiểm tra danh sách người dùng, công ty, tin đăng và hồ sơ ứng tuyển.
- [ ] Mở một tin vi phạm hoặc mục chờ duyệt để kiểm tra chi tiết.
- [ ] Thực hiện duyệt hoặc từ chối theo luồng hệ thống nếu có.
- [ ] Kiểm tra danh sách liên hệ và phản hồi xử lý.
- [ ] Kiểm tra tính năng quản lý thanh toán mô phỏng hoặc nạp tiền nếu có dữ liệu liên quan.
- [ ] Thay đổi một cài đặt hệ thống và xác nhận giá trị được lưu lại.
- [ ] Kiểm tra danh mục hệ thống hoặc ngành nghề nếu có chỉnh sửa.
- [ ] Đăng xuất và xác nhận dữ liệu quản trị không bị mất ngoài ý muốn.

### 22.4. Quy trình dữ liệu và đối chiếu

- [ ] Xác nhận dữ liệu seed được nạp đúng ngay khi mở ứng dụng.
- [ ] Xác nhận dữ liệu thay đổi trong một luồng vẫn còn sau khi chuyển trang trong cùng phiên.
- [ ] Xác nhận `sessionStorage` phản ánh đúng `currentUser` sau đăng nhập và đăng xuất.
- [ ] Xác nhận `localStorage` phản ánh đúng các thay đổi từ ứng viên, recruiter và admin.
- [ ] Mở trang debug và đối chiếu dữ liệu thực tế với kết quả mong đợi của các bước trên.
- [ ] Nếu dữ liệu bị lệch, thực hiện reset và chạy lại luồng nghiệp vụ từ đầu.
