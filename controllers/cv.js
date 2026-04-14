(function () {
  // ==============================
  // CV management logic
  // UC-1.13 Upload CV, UC-1.12 Create CV
  // ==============================

  function readJson(key, fallback) { // Hàm tiện ích để đọc dữ liệu JSON từ localStorage, nó sẽ nhận vào một khóa và một giá trị mặc định. Hàm sẽ cố gắng lấy dữ liệu thô từ localStorage bằng khóa đã cho, nếu có dữ liệu thì sẽ cố gắng phân tích cú pháp JSON và trả về kết quả. Nếu không có dữ liệu hoặc có lỗi khi phân tích cú pháp, hàm sẽ trả về giá trị mặc định được cung cấp. Điều này giúp đảm bảo rằng ứng dụng có thể hoạt động ổn định ngay cả khi localStorage không có dữ liệu hoặc dữ liệu bị hỏng
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) { // Hàm tiện ích để ghi dữ liệu JSON vào localStorage, nó sẽ nhận vào một khóa và một giá trị. Hàm sẽ chuyển đổi giá trị thành chuỗi JSON và lưu nó vào localStorage dưới khóa đã cho. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    localStorage.setItem(key, JSON.stringify(value));
  }

  function notifyCvChanged() { // Hàm tiện ích để thông báo rằng danh sách CV đã thay đổi, nó sẽ phát ra một sự kiện tùy chỉnh trên document với tên 'candidate:cvs-changed'. Các phần khác của ứng dụng có thể lắng nghe sự kiện này để cập nhật lại giao diện hoặc thực hiện các hành động cần thiết khi danh sách CV thay đổi. Nếu không có phần tử nào lắng nghe sự kiện này, hàm vẫn sẽ hoạt động bình
    document.dispatchEvent(new CustomEvent('candidate:cvs-changed'));
  }

  function showMessage(message, ok) { // Hàm tiện ích để hiển thị một thông báo cho người dùng, nó sẽ nhận vào một chuỗi thông báo và một boolean để xác định màu sắc của thông báo (xanh cho thành công, đỏ cho lỗi). Hàm sẽ tìm kiếm phần tử có id 'cvUploadMessage' trên trang và nếu tìm thấy, nó sẽ cập nhật nội dung văn bản của phần tử đó với thông báo được cung cấp và thay đổi màu sắc của văn bản dựa trên giá trị boolean. Nếu không tìm thấy phần tử này, hàm sẽ không thực hiện gì
    var el = document.getElementById('cvUploadMessage');
    if (!el) {
      return;
    }
    el.textContent = message;
    el.style.color = ok ? '#15803d' : '#dc2626';
  }

  // UC-1.13: validate file type and size
  function validateCvFile(file) { // Hàm tiện ích để xác thực tệp CV được tải lên, nó sẽ nhận vào một đối tượng tệp và kiểm tra xem tệp có tồn tại hay không, có phải là định dạng được chấp nhận (.pdf hoặc .docx) hay không, và có kích thước không vượt quá giới hạn 5MB hay không. Hàm sẽ trả về một đối tượng chứa một boolean 'ok' để chỉ ra xem tệp có hợp lệ hay không và một chuỗi 'message' để cung cấp thông tin chi tiết về kết quả xác thực. Nếu tệp không hợp lệ, hàm sẽ trả về thông báo lỗi cụ thể cho từng trường hợp (không chọn tệp, định dạng không hợp lệ, kích thước vượt quá giới hạn)
    if (!file) {
      return { ok: false, message: 'Vui long chon file CV.' };
    }

    var name = String(file.name || '').toLowerCase();
    var allowExt = name.endsWith('.pdf') || name.endsWith('.docx');
    if (!allowExt) {
      return { ok: false, message: 'Chỉ nhận file .pdf hoặc .docx.' };
    }

    var maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { ok: false, message: 'File vượt quá 5MB.' };
    }

    return { ok: true, message: 'File hợp lệ: ' + file.name };
  }

  function handleCvUpload(event) { // Hàm xử lý sự kiện khi người dùng chọn một tệp CV để tải lên, nó sẽ nhận vào sự kiện từ phần tử input file. Hàm sẽ lấy tệp được chọn từ sự kiện, sau đó gọi hàm validateCvFile để xác thực tệp. Nếu tệp không hợp lệ, hàm sẽ hiển thị thông báo lỗi và không tiếp tục. Nếu tệp hợp lệ, hàm sẽ đọc danh sách CV hiện tại từ localStorage, tạo một đối tượng CV mới với id tự động tăng, tên tệp, thời gian tạo và nguồn là 'upload', sau đó thêm đối tượng này vào đầu danh sách CV và ghi lại danh sách mới vào localStorage. Cuối cùng, hàm sẽ gọi notifyCvChanged để thông báo rằng danh sách CV đã thay đổi và các phần khác của ứng dụng có thể cập nhật giao diện tương ứng
    var file = event.target.files && event.target.files[0];
    var result = validateCvFile(file);
    showMessage(result.message, result.ok);

    if (!result.ok) {
      return;
    }

    var cvs = readJson('candidateCVs', []);
    var nextId = cvs.reduce(function (max, item) {
      return Math.max(max, Number(item.id) || 0);
    }, 0) + 1;

    cvs.unshift({
      id: nextId,
      name: file.name,
      createdAt: new Date().toISOString(),
      source: 'upload'
    });

    writeJson('candidateCVs', cvs);
    notifyCvChanged();
  }

  // UC-1.12: simulate create new CV record
  function createCvRecord() { // Hàm xử lý sự kiện khi người dùng muốn tạo một bản ghi CV mới, nó sẽ tìm kiếm phần tử input có id 'newCvName' để lấy tên CV mới mà người dùng muốn tạo. Nếu không tìm thấy phần tử này, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ lấy giá trị từ ô nhập liệu, loại bỏ khoảng trắng thừa và kiểm tra xem tên có hợp lệ hay không (không được để trống). Nếu tên không hợp lệ, hàm sẽ hiển thị thông báo lỗi và không tiếp tục. Nếu tên hợp lệ, hàm sẽ đọc danh sách CV hiện tại từ localStorage, tạo một đối tượng CV mới với id tự động tăng, tên CV từ ô nhập liệu, thời gian tạo và nguồn là 'builder', sau đó thêm đối tượng này vào đầu danh sách CV và ghi lại danh sách mới vào localStorage. Cuối cùng, hàm sẽ gọi notifyCvChanged để thông báo rằng danh sách CV đã thay đổi và các phần khác của ứng dụng có thể cập nhật giao diện tương ứng, đồng thời xóa giá trị trong ô nhập liệu và hiển thị thông báo thành công
    var input = document.getElementById('newCvName');
    if (!input) {
      return;
    }

    var name = String(input.value || '').trim();
    if (!name) {
      showMessage('Vui lòng nhập tên CV mới.', false);
      return;
    }

    var cvs = readJson('candidateCVs', []);
    var nextId = cvs.reduce(function (max, item) {
      return Math.max(max, Number(item.id) || 0);
    }, 0) + 1;

    cvs.unshift({
      id: nextId,
      name: name,
      createdAt: new Date().toISOString(),
      source: 'builder'
    });

    writeJson('candidateCVs', cvs);
    notifyCvChanged();
    input.value = '';
    showMessage('Đã tạo CV mới thành công.', true);
  }

  function bindCvEvents() { // Hàm tiện ích để gắn các sự kiện cho các phần tử liên quan đến CV, nó sẽ tìm kiếm các phần tử trên trang và gắn sự kiện cho chúng. Nếu không tìm thấy phần tử nào, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ gắn sự kiện 'change' cho input upload và sự kiện 'click' cho nút tạo CV mới
    var uploadInput = document.getElementById('cvUploadInput');
    var createBtn = document.getElementById('createCvBtn');

    if (uploadInput) {
      uploadInput.addEventListener('change', handleCvUpload);
    }

    if (createBtn) {
      createBtn.addEventListener('click', createCvRecord);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCvEvents);
  } else {
    bindCvEvents();
  }
})();
