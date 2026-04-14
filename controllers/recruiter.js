(function () {
  var STORAGE = {
    JOBS: 'JOBS_DATA',
    APPLICATIONS: 'APPLICATIONS_DATA',
    LEGACY_JOBS: 'jobs',
    LEGACY_APPLICATIONS: 'applications',
    INTERVIEWS: 'interviews',
    TRANSACTIONS: 'ALL_TRANSACTIONS_DATA',
    LEGACY_TRANSACTIONS: 'allTransactions'
  };

  var QR_PAYMENT_INFO = {
    bankCode: 'MB',
    bank: 'MB Bank',
    accountNo: '0346263706',
    accountName: 'Ngo Quang Tung'
  };
  var FEATURED_PIN_FEE = 20000;
  var COMMISSION_PER_APPROVED_FEE = 5000;

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

  function getAdminContacts() { // Hàm để lấy danh sách liên hệ với admin từ localStorage, nó sẽ sử dụng hàm readJson để đọc dữ liệu từ khóa 'ADMIN_CONTACTS' và trả về một mảng các liên hệ. Nếu dữ liệu không tồn tại hoặc không phải là một mảng, hàm sẽ trả về một mảng rỗng. Danh sách liên hệ này có thể được sử dụng để hiển thị trong phần quản lý liên hệ của nhà tuyển dụng hoặc để xử lý các yêu cầu liên hệ mới từ nhà tuyển dụng đến admin
    var items = readJson('ADMIN_CONTACTS', []);
    return Array.isArray(items) ? items : [];
  }

  function saveAdminContacts(items) { // Hàm để lưu danh sách liên hệ với admin vào localStorage, nó sẽ nhận vào một mảng các liên hệ và sử dụng hàm writeJson để ghi dữ liệu vào khóa 'ADMIN_CONTACTS'. Trước khi ghi dữ liệu, hàm sẽ kiểm tra xem items có phải là một mảng hay không, nếu không phải thì sẽ không thực hiện ghi dữ liệu. Việc lưu danh sách liên hệ này cho phép ứng dụng duy trì thông tin liên hệ giữa nhà tuyển dụng và admin, và có thể được sử dụng để hiển thị hoặc xử lý các yêu cầu liên hệ trong tương lai
    writeJson('ADMIN_CONTACTS', items);
  }

  function submitAdminContact() { //  Hàm để xử lý việc gửi liên hệ từ nhà tuyển dụng đến admin, nó sẽ lấy thông tin tiêu đề và nội dung liên hệ từ các trường nhập liệu trên giao diện, sau đó kiểm tra xem thông tin nhà tuyển dụng có tồn tại hay không. Nếu không tìm thấy thông tin nhà tuyển dụng, hàm sẽ hiển thị một thông báo lỗi và dừng quá trình. Nếu tìm thấy thông tin nhà tuyển dụng, hàm sẽ tạo một đối tượng liên hệ mới với các thông tin như tên đầy đủ, email, vai trò, tiêu đề, nội dung, trạng thái và lịch sử hành động. Đối tượng liên hệ này sau đó sẽ được thêm vào đầu danh sách liên hệ với admin và lưu lại vào localStorage bằng cách sử dụng hàm saveAdminContacts. Cuối cùng, hàm sẽ xóa nội dung của các trường nhập liệu và hiển thị một thông báo thành công cho người dùng
    var titleEl = document.getElementById('recruiterContactTitle');
    var contentEl = document.getElementById('recruiterContactContent');
    var recruiter = getStoredUserRecord() || state.recruiter;

    if (!recruiter) {
      showToast('Không tìm thấy thông tin tài khoản.', 'error');
      return;
    }

    if (!titleEl || !contentEl) {
      return;
    }

    var title = String(titleEl.value || '').trim();
    var content = String(contentEl.value || '').trim();
    if (!title || !content) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung liên hệ.', 'error');
      return;
    }

    var contacts = getAdminContacts();
    var nextId = contacts.reduce(function (max, item) {
      return Math.max(max, Number(item.id) || 0);
    }, 0) + 1;

    contacts.unshift({
      id: nextId,
      fullName: recruiter.name || recruiter.company || 'Recruiter',
      email: recruiter.email || '',
      role: 'recruiter',
      source: 'recruiter',
      title: title,
      content: content,
      status: 'new',
      history: [
        {
          action: 'created',
          label: 'Đã gửi liên hệ tới admin',
          at: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    });

    saveAdminContacts(contacts);
    titleEl.value = '';
    contentEl.value = '';
    showToast('Đã gửi liên hệ tới admin.', 'success');
  }

  function readCollection(sharedKey, legacyKey) { //  Hàm để đọc một bộ sưu tập dữ liệu từ localStorage, nó sẽ nhận vào hai khóa: một khóa "shared" và một khóa "legacy". Hàm sẽ cố gắng đọc dữ liệu từ cả hai khóa này và kiểm tra xem dữ liệu nào hợp lệ (là một mảng). Nếu cả hai đều hợp lệ, hàm sẽ ưu tiên trả về dữ liệu từ khóa "shared". Nếu chỉ có một trong hai hợp lệ, hàm sẽ sao chép dữ liệu đó sang khóa còn lại để đảm bảo đồng bộ và trả về dữ liệu đó. Nếu cả hai đều không hợp lệ, hàm sẽ trả về một mảng rỗng. Điều này giúp ứng dụng có thể duy trì tính nhất quán của dữ liệu giữa các phiên bản cũ và mới của ứng dụng, đồng thời đảm bảo rằng dữ liệu luôn có sẵn cho ứng dụng sử dụng
    var shared = readJson(sharedKey, []);
    var legacy = readJson(legacyKey, []);

    var sharedOk = Array.isArray(shared);
    var legacyOk = Array.isArray(legacy);

    if (sharedOk && shared.length) {
      if (legacyOk && legacy.length !== shared.length) {
        writeJson(legacyKey, shared);
      }
      return shared;
    }

    if (sharedOk && !shared.length && legacyOk && legacy.length) {
      writeJson(sharedKey, legacy);
      return legacy;
    }

    if (sharedOk && legacyOk) {
      return shared;
    }

    if (sharedOk) {
      writeJson(legacyKey, shared);
      return shared;
    }

    if (legacyOk) {
      writeJson(sharedKey, legacy);
      return legacy;
    }

    return [];
  }

  function writeCollection(sharedKey, legacyKey, value) { // Hàm để ghi một bộ sưu tập dữ liệu vào localStorage, nó sẽ nhận vào hai khóa: một khóa "shared" và một khóa "legacy", cùng với giá trị dữ liệu cần lưu. Hàm sẽ ghi dữ liệu vào cả hai khóa này để đảm bảo rằng dữ liệu được đồng bộ giữa các phiên bản cũ và mới của ứng dụng. Việc này giúp đảm bảo rằng dữ liệu luôn có sẵn cho ứng dụng sử dụng, bất kể phiên bản nào đang đọc dữ liệu từ localStorage
    writeJson(sharedKey, value);
    writeJson(legacyKey, value);
  }

  function normalize(text) { // Hàm tiện ích để chuẩn hóa một chuỗi văn bản, nó sẽ nhận vào một giá trị và trả về một chuỗi đã được loại bỏ khoảng trắng thừa ở đầu và cuối, đồng thời chuyển đổi tất cả các ký tự thành chữ thường. Nếu giá trị đầu vào là null hoặc undefined, hàm sẽ trả về một chuỗi rỗng. Việc chuẩn hóa này giúp đảm bảo rằng các so sánh chuỗi trong ứng dụng được thực hiện một cách nhất quán, bất kể người dùng nhập liệu như thế nào
    return String(text || '').trim().toLowerCase();
  }

  function escapeHtml(text) { // Hàm tiện ích để thoát các ký tự đặc biệt trong một chuỗi văn bản thành các thực thể HTML tương ứng, nó sẽ nhận vào một giá trị và trả về một chuỗi đã được thay thế các ký tự đặc biệt như &, <, >, ", ' bằng các thực thể HTML &amp;, &lt;, &gt;, &quot;, &#39;. Nếu giá trị đầu vào là null hoặc undefined, hàm sẽ trả về một chuỗi rỗng. Việc thoát HTML này giúp ngăn chặn các lỗ hổng bảo mật như XSS (Cross-Site Scripting) khi hiển thị dữ liệu do người dùng nhập vào trên giao diện web
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentUser() { //  Hàm để lấy thông tin người dùng hiện tại từ sessionStorage hoặc localStorage, nó sẽ cố gắng đọc dữ liệu từ khóa 'currentUser' trong sessionStorage trước, nếu không tìm thấy thì sẽ đọc từ localStorage. Hàm sẽ cố gắng phân tích cú pháp JSON của dữ liệu thu được và trả về đối tượng người dùng. Nếu không có dữ liệu hoặc có lỗi khi phân tích cú pháp, hàm sẽ trả về null. Việc này giúp ứng dụng có thể xác định được người dùng hiện đang đăng nhập và sử dụng thông tin đó để cá nhân hóa trải nghiệm người dùng hoặc kiểm tra quyền truy cập
    try {
      var sessionUser = sessionStorage.getItem('currentUser');
      if (sessionUser) {
        return JSON.parse(sessionUser);
      }
      var localUser = localStorage.getItem('currentUser');
      return localUser ? JSON.parse(localUser) : null;
    } catch (e) {
      return null;
    }
  }

  function getStoredUsers() { // Hàm để lấy danh sách người dùng đã lưu từ localStorage, nó sẽ sử dụng hàm readJson để đọc dữ liệu từ khóa 'users' và trả về một mảng các người dùng. Nếu dữ liệu không tồn tại hoặc không phải là một mảng, hàm sẽ trả về một mảng rỗng. Danh sách người dùng này có thể được sử dụng để xác thực thông tin đăng nhập của nhà tuyển dụng, hiển thị thông tin tài khoản hoặc quản lý các tài khoản người dùng trong ứng dụng
    var users = readJson('users', []);
    return Array.isArray(users) ? users : [];
  }

  function getStoredUserRecord() { // Hàm để lấy thông tin người dùng hiện tại từ danh sách người dùng đã lưu trong localStorage, nó sẽ sử dụng hàm getCurrentUser để lấy thông tin người dùng hiện tại và hàm getStoredUsers để lấy danh sách tất cả người dùng đã lưu. Hàm sẽ cố gắng tìm kiếm một bản ghi người dùng trong danh sách đã lưu mà có id hoặc email khớp với thông tin của người dùng hiện tại. Nếu tìm thấy một bản ghi phù hợp, hàm sẽ trả về bản ghi đó. Nếu không tìm thấy hoặc nếu không có thông tin người dùng hiện tại, hàm sẽ trả về null. Việc này giúp đảm bảo rằng ứng dụng luôn có thông tin đầy đủ và chính xác về người dùng hiện đang đăng nhập, ngay cả khi dữ liệu trong sessionStorage hoặc localStorage có thể bị lỗi hoặc không đồng bộ
    if (!state.recruiter) {
      return null;
    }

    var users = getStoredUsers();
    var byId = users.find(function (user) {
      return Number(user.id) === Number(state.recruiter.id);
    }) || null;

    if (byId) {
      return byId;
    }

    return users.find(function (user) {
      return normalize(user.email) === normalize(state.recruiter.email);
    }) || null;
  }

  function persistLoggedInUser(updatedUser) { // Hàm để cập nhật thông tin người dùng đã đăng nhập trong sessionStorage và localStorage, nó sẽ nhận vào một đối tượng người dùng đã được cập nhật và lưu thông tin này vào cả sessionStorage và localStorage dưới khóa 'currentUser'. Hàm cũng sẽ cập nhật thông tin người dùng trong state.recruiter để đảm bảo rằng giao diện người dùng có thể phản ánh những thay đổi mới nhất về thông tin tài khoản của nhà tuyển dụng. Việc này giúp duy trì tính nhất quán của dữ liệu người dùng giữa các phần khác nhau của ứng dụng và đảm bảo rằng thông tin người dùng luôn được cập nhật khi có sự thay đổi
    state.recruiter = updatedUser;
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }

  function buildAvatarFromName(name) { // Hàm để tạo một chuỗi đại diện (avatar) từ tên của nhà tuyển dụng, nó sẽ nhận vào một chuỗi tên và cố gắng trích xuất hai ký tự đầu tiên từ tên đó để tạo thành avatar. Hàm sẽ loại bỏ khoảng trắng thừa và phân tách tên thành các phần dựa trên khoảng trắng. Nếu tên không có phần nào, hàm sẽ trả về 'RC' làm avatar mặc định. Nếu tên chỉ có một phần, hàm sẽ lấy hai ký tự đầu tiên của phần đó. Nếu tên có nhiều phần, hàm sẽ lấy ký tự đầu tiên của phần đầu tiên và ký tự đầu tiên của phần cuối cùng để tạo thành avatar. Kết quả cuối cùng sẽ được chuyển đổi thành chữ hoa và giới hạn ở 2 ký tự. Việc này giúp tạo ra một biểu tượng đại diện đơn giản nhưng mang tính cá nhân hóa cho nhà tuyển dụng dựa trên tên của họ
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'RC';
    }

    var first = parts[0].charAt(0);
    var second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : (parts[0].charAt(1) || 'C');
    return (first + second).toUpperCase().slice(0, 2);
  }

  function formatDate(dateText) { // Hàm để định dạng một chuỗi ngày tháng thành định dạng ngày/tháng/năm, nó sẽ nhận vào một chuỗi ngày tháng và cố gắng tạo một đối tượng Date từ chuỗi đó. Nếu chuỗi không thể được phân tích thành một ngày hợp lệ, hàm sẽ trả về chuỗi gốc hoặc 'N/A' nếu chuỗi gốc là null hoặc undefined. Nếu chuỗi có thể được phân tích thành một ngày hợp lệ, hàm sẽ trích xuất ngày, tháng và năm từ đối tượng Date và định dạng chúng thành một chuỗi theo định dạng dd/mm/yyyy. Việc này giúp hiển thị ngày tháng một cách nhất quán và dễ đọc cho người dùng trong giao diện ứng dụng
    var date = new Date(dateText + 'T00:00:00');
    if (Number.isNaN(date.getTime())) {
      return dateText || 'N/A';
    }
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yy = date.getFullYear();
    return dd + '/' + mm + '/' + yy;
  }

  function formatDateTime(value) { // Hàm để định dạng một giá trị thời gian thành chuỗi có định dạng dễ đọc, nó sẽ nhận vào một giá trị thời gian và cố gắng tạo một đối tượng Date từ giá trị đó. Nếu giá trị không thể được phân tích thành một thời gian hợp lệ, hàm sẽ trả về chuỗi 'Không rõ thời gian'. Nếu giá trị có thể được phân tích thành một thời gian hợp lệ, hàm sẽ sử dụng phương thức toLocaleString để định dạng thời gian theo ngôn ngữ và khu vực của người dùng. Việc này giúp hiển thị thời gian một cách nhất quán và dễ đọc cho người dùng trong giao diện ứng dụng
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Không rõ thời gian';
    }
    return date.toLocaleString('vi-VN');
  }

  function updateRecruiterProfileUI() {// Hàm để cập nhật giao diện người dùng với thông tin của nhà tuyển dụng hiện tại, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó để cập nhật các phần tử giao diện như tên công ty, thông tin liên hệ và logo đại diện. Nếu không tìm thấy thông tin nhà tuyển dụng, hàm sẽ không thực hiện gì. Việc này giúp đảm bảo rằng giao diện người dùng luôn phản ánh chính xác thông tin tài khoản của nhà tuyển dụng hiện đang đăng nhập
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!recruiter) {
      return;
    }

    var displayName = recruiter.company || recruiter.name || 'Recruiter Workspace';
    var subText = [recruiter.email, recruiter.phone].filter(Boolean).join(' • ');

    if (el.companyName) {
      el.companyName.textContent = displayName;
    }

    if (el.companySub) {
      el.companySub.textContent = subText || 'Recruiter Workspace';
    }

    if (el.companyLogo) {
      el.companyLogo.textContent = buildAvatarFromName(displayName);
    }
  }

  function openAccountSettingsModal() { // Hàm để mở modal cài đặt tài khoản của nhà tuyển dụng, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó để điền vào các trường nhập liệu trong modal. Nếu không tìm thấy thông tin nhà tuyển dụng hoặc phần tử backdrop của modal, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ cập nhật tiêu đề của modal, điền thông tin như tên, công ty, email, số điện thoại vào các trường tương ứng, đồng thời xóa giá trị của các trường mật khẩu để đảm bảo an toàn. Cuối cùng, hàm sẽ hiển thị modal bằng cách thay đổi thuộc tính style.display của phần tử backdrop thành 'flex'. Việc này giúp người dùng có thể dễ dàng truy cập và chỉnh sửa thông tin tài khoản của họ trong ứng dụng
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!el.accountSettingsBackdrop || !recruiter) {
      return;
    }

    if (el.accountSettingsTitle) {
      el.accountSettingsTitle.textContent = 'Cài đặt tài khoản';
    }

    if (el.accountName) el.accountName.value = recruiter.name || recruiter.company || '';
    if (el.accountCompany) el.accountCompany.value = recruiter.company || recruiter.name || '';
    if (el.accountEmail) el.accountEmail.value = recruiter.email || '';
    if (el.accountPhone) el.accountPhone.value = recruiter.phone || '';
    if (el.accountCurrentPassword) el.accountCurrentPassword.value = '';
    if (el.accountNewPassword) el.accountNewPassword.value = '';
    if (el.accountConfirmPassword) el.accountConfirmPassword.value = '';

    el.accountSettingsBackdrop.style.display = 'flex';
  }

  function openWalletModal() { // Hàm để mở modal quản lý ví của nhà tuyển dụng, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó để hiển thị trong modal. Nếu không tìm thấy thông tin nhà tuyển dụng hoặc phần tử backdrop của modal, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ cập nhật tiêu đề của modal, xóa giá trị của các trường nhập liệu liên quan đến số tiền nạp và ghi chú để đảm bảo an toàn. Sau đó, hàm sẽ gọi renderWalletInfo để hiển thị thông tin ví hiện tại của nhà tuyển dụng trong modal. Cuối cùng, hàm sẽ hiển thị modal bằng cách thay đổi thuộc tính style.display của phần tử backdrop thành 'flex'. Việc này giúp người dùng có thể dễ dàng truy cập và quản lý thông tin ví của họ trong ứng dụng
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!el.walletModalBackdrop || !recruiter) {
      return;
    }

    if (el.walletModalTitle) {
      el.walletModalTitle.textContent = 'Thanh toán / Ví';
    }

    if (el.depositAmount) el.depositAmount.value = '';
    if (el.depositNote) el.depositNote.value = '';
    if (el.walletCopyToast) el.walletCopyToast.textContent = '';
    state.walletGeneratedNote = '';

    stopWalletCountdown();
    if (el.walletQrTimer) {
      el.walletQrTimer.textContent = '00:10:00';
    }

    setWalletStep(1);
    updateGenerateQrState();

    renderWalletInfo();

    el.walletModalBackdrop.style.display = 'flex';
  }

  function closeAccountSettingsModal() { // Hàm để đóng modal cài đặt tài khoản của nhà tuyển dụng, nó sẽ kiểm tra xem phần tử backdrop của modal có tồn tại hay không. Nếu không tồn tại, hàm sẽ không thực hiện gì. Nếu tồn tại, hàm sẽ ẩn modal bằng cách thay đổi thuộc tính style.display của phần tử backdrop thành 'none'. Việc này giúp người dùng có thể dễ dàng đóng modal sau khi đã hoàn thành việc chỉnh sửa thông tin tài khoản hoặc nếu họ quyết định không thực hiện bất kỳ thay đổi nào
    if (!el.accountSettingsBackdrop) {
      return;
    }

    el.accountSettingsBackdrop.style.display = 'none';
  }
 
  function closeWalletModal() { // Hàm để đóng modal quản lý ví của nhà tuyển dụng, nó sẽ kiểm tra xem phần tử backdrop của modal có tồn tại hay không. Nếu không tồn tại, hàm sẽ không thực hiện gì. Nếu tồn tại, hàm sẽ ẩn modal bằng cách thay đổi thuộc tính style.display của phần tử backdrop thành 'none'. Việc này giúp người dùng có thể dễ dàng đóng modal sau khi đã hoàn thành việc quản lý thông tin ví hoặc nếu họ quyết định không thực hiện bất kỳ thay đổi nào
    if (!el.walletModalBackdrop) {
      return;
    }

    stopWalletCountdown();

    el.walletModalBackdrop.style.display = 'none';
  }

  function submitAccountSettings() { // Hàm để gửi các thay đổi trong cài đặt tài khoản của nhà tuyển dụng, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và kiểm tra tính hợp lệ của các trường nhập liệu. Nếu có trường nào không hợp lệ, hàm sẽ hiển thị thông báo lỗi. Nếu tất cả các trường đều hợp lệ, hàm sẽ cập nhật thông tin nhà tuyển dụng trong state.users và lưu lại vào localStorage. Sau đó, hàm sẽ gọi các hàm cần thiết để cập nhật giao diện người dùng và bảng công việc. Cuối cùng, hàm sẽ đóng modal cài đặt tài khoản
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!recruiter) {
      return;
    }

    var name = el.accountName ? String(el.accountName.value || '').trim() : '';
    var company = el.accountCompany ? String(el.accountCompany.value || '').trim() : '';
    var email = el.accountEmail ? String(el.accountEmail.value || '').trim() : '';
    var phone = el.accountPhone ? String(el.accountPhone.value || '').trim() : '';
    var currentPassword = el.accountCurrentPassword ? String(el.accountCurrentPassword.value || '').trim() : '';
    var newPassword = el.accountNewPassword ? String(el.accountNewPassword.value || '').trim() : '';
    var confirmPassword = el.accountConfirmPassword ? String(el.accountConfirmPassword.value || '').trim() : '';

    if (!name || !company || !email) {
      showToast('Vui lòng nhập đầy đủ họ tên, công ty và email.', 'error');
      return;
    }

    if (String(recruiter.password || '').trim() !== currentPassword) {
      showToast('Mật khẩu hiện tại không đúng.', 'error');
      return;
    }

    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        showToast('Vui lòng nhập và xác nhận mật khẩu mới.', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('Mật khẩu mới không khớp.', 'error');
        return;
      }
    }

    var nextPassword = newPassword || recruiter.password;
    var oldEmail = recruiter.email;
    var updatedUser = Object.assign({}, recruiter, {
      name: name,
      company: company,
      email: email,
      phone: phone,
      password: nextPassword
    });

    state.users = getStoredUsers().map(function (user) {
      if (Number(user.id) === Number(updatedUser.id)) {
        return updatedUser;
      }
      return user;
    });

    if (!state.users.some(function (user) {
      return Number(user.id) === Number(updatedUser.id);
    })) {
      state.users.push(updatedUser);
    }

    var updatedJobs = state.jobs.map(function (job) {
      if (Number(job.recruiterId) !== Number(updatedUser.id) && normalize(job.recruiterEmail) !== normalize(oldEmail)) {
        return job;
      }

      return Object.assign({}, job, {
        company: company,
        recruiterName: name,
        recruiterEmail: email
      });
    });

    state.jobs = updatedJobs;

    writeJson('users', state.users);
    writeCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS, state.jobs);
    persistLoggedInUser(updatedUser);
    updateRecruiterProfileUI();
    renderJobTable();
    populateInterviewJobFilter();
    renderInterviewList();
    updateStats();
    renderRecentActivities();
    renderTrendBars();
    closeAccountSettingsModal();
    showToast('Đã cập nhật thông tin tài khoản.', 'success');
  }

  function getStatusMeta(status) { // Hàm để lấy thông tin meta về trạng thái của một công việc, nó sẽ nhận vào một chuỗi trạng thái và trả về một đối tượng chứa thông tin về lớp CSS và văn bản hiển thị tương ứng với trạng thái đó. Hàm sẽ chuẩn hóa chuỗi trạng thái bằng cách loại bỏ khoảng trắng thừa và chuyển đổi thành chữ thường trước khi so sánh. Nếu trạng thái là 'open' hoặc 'active', hàm sẽ trả về lớp CSS 'open' và văn bản 'Đang mở'. Nếu trạng thái là 'closed', hàm sẽ trả về lớp CSS 'closed' và văn bản 'Đã đóng'. Nếu trạng thái không khớp với bất kỳ trường hợp nào ở trên, hàm sẽ trả về lớp CSS 'expired' và văn bản 'Hết hạn'. Việc này giúp giao diện người dùng có thể hiển thị trạng thái của công việc một cách trực quan và dễ hiểu
    var st = normalize(status);
    if (st === 'open' || st === 'active') {
      return { css: 'open', text: 'Đang mở' };
    }
    if (st === 'closed') {
      return { css: 'closed', text: 'Đã đóng' };
    }
    return { css: 'expired', text: 'Hết hạn' };
  }

  var state = {
    recruiter: null,
    users: [],
    jobs: [],
    applications: [],
    applicants: [],
    interviews: [],
    activeJobId: null,
    inviteAppId: null,
    topKeyword: '',
    interviewKeyword: '',
    interviewJobId: 'all',
    interviewStatus: 'all',
    interviewDate: 'all',
    currentView: 'overview',
    walletCopyToastTimer: null,
    walletCountdownTimer: null,
    walletCountdownDeadline: 0,
    walletGeneratedNote: ''
  };

  var el = {
    jobTableBody: document.getElementById('jobTableBody'),
    statOpenPosts: document.getElementById('statOpenPosts'),
    statTotalApplicants: document.getElementById('statTotalApplicants'),
    statUnread: document.getElementById('statUnread'),
    statInterviewToday: document.getElementById('statInterviewToday'),
    recentActivityList: document.getElementById('recentActivityList'),
    trendBars: document.getElementById('trendBars'),
    applicantPanel: document.getElementById('applicantPanel'),
    applicantTitle: document.getElementById('applicantTitle'),
    applicantSearch: document.getElementById('applicantSearch'),
    applicantJobSelect: document.getElementById('applicantJobSelect'),
    applicantStatusFilter: document.getElementById('applicantStatusFilter'),
    applicantTimeFilter: document.getElementById('applicantTimeFilter'),
    topSearchInput: document.getElementById('topSearchInput'),
    topSearchWrap: document.getElementById('topSearchWrap'),
    topbarTitle: document.querySelector('.topbar h1'),
    topbarSub: document.querySelector('.topbar p'),
    statsRow: document.querySelector('.stats-row'),
    applicantList: document.getElementById('applicantList'),
    createModalBackdrop: document.getElementById('createModalBackdrop'),
    btnOpenCreate: document.getElementById('btnOpenCreate'),
    btnOpenWallet: document.getElementById('btnOpenWallet'),
    createModalClose: document.getElementById('createModalClose'),
    createModalCancel: document.getElementById('createModalCancel'),
    createModalSave: document.getElementById('createModalSave'),
    newJobTitle: document.getElementById('newJobTitle'),
    newJobSalary: document.getElementById('newJobSalary'),
    newJobDescription: document.getElementById('newJobDescription'),
    newJobLocation: document.getElementById('newJobLocation'),
    newJobRequirements: document.getElementById('newJobRequirements'),
    newJobMaxApplicants: document.getElementById('newJobMaxApplicants'),
    newJobFeatured: document.getElementById('newJobFeatured'),
    inviteModalBackdrop: document.getElementById('inviteModalBackdrop'),
    inviteModalClose: document.getElementById('inviteModalClose'),
    inviteModalCancel: document.getElementById('inviteModalCancel'),
    inviteModalSend: document.getElementById('inviteModalSend'),
    inviteCandidate: document.getElementById('inviteCandidate'),
    inviteJob: document.getElementById('inviteJob'),
    inviteDateTime: document.getElementById('inviteDateTime'),
    inviteMessage: document.getElementById('inviteMessage'),
    btnLogout: document.getElementById('btnLogout'),
    menuLinks: document.querySelectorAll('.menu a'),
    topbar: document.querySelector('.topbar'),
    jobsSection: document.getElementById('jobsSection'),
    applicantsSection: document.getElementById('applicantsSection'),
    interviewsSection: document.getElementById('interviewsSection'),
    policySection: document.getElementById('policySection'),
    settingsSection: document.getElementById('settingsSection'),
    interviewList: document.getElementById('interviewList'),
    interviewJobFilter: document.getElementById('interviewJobFilter'),
    interviewSearch: document.getElementById('interviewSearch'),
    interviewStatusFilter: document.getElementById('interviewStatusFilter'),
    interviewDateFilter: document.getElementById('interviewDateFilter'),
    jobPanel: document.querySelector('.core-grid .panel'),
    trendPanel: document.querySelectorAll('.core-grid .panel')[1],
    accountSettingsBackdrop: document.getElementById('accountSettingsBackdrop'),
    accountSettingsTitle: document.getElementById('accountSettingsTitle'),
    accountSettingsClose: document.getElementById('accountSettingsClose'),
    accountSettingsCancel: document.getElementById('accountSettingsCancel'),
    accountSettingsSave: document.getElementById('accountSettingsSave'),
    walletModalBackdrop: document.getElementById('walletModalBackdrop'),
    walletModalTitle: document.getElementById('walletModalTitle'),
    walletModalClose: document.getElementById('walletModalClose'),
    walletModalCancel: document.getElementById('walletModalCancel'),
    walletModalSave: document.getElementById('walletModalSave'),
    accountName: document.getElementById('accountName'),
    accountCompany: document.getElementById('accountCompany'),
    accountEmail: document.getElementById('accountEmail'),
    accountPhone: document.getElementById('accountPhone'),
    accountCurrentPassword: document.getElementById('accountCurrentPassword'),
    accountNewPassword: document.getElementById('accountNewPassword'),
    accountConfirmPassword: document.getElementById('accountConfirmPassword'),
    walletBalanceText: document.getElementById('walletBalanceText'),
    walletStep1: document.getElementById('walletStep1'),
    walletStep2: document.getElementById('walletStep2'),
    walletHistorySection: document.getElementById('walletHistorySection'),
    walletFooterActions: document.getElementById('walletFooterActions'),
    depositAmount: document.getElementById('depositAmount'),
    depositNote: document.getElementById('depositNote'),
    btnGenerateQr: document.getElementById('btnGenerateQr'),
    walletQrImage: document.getElementById('walletQrImage'),
    walletQrText: document.getElementById('walletQrText'),
    qrBankValue: document.getElementById('qrBankValue'),
    qrAccountNameValue: document.getElementById('qrAccountNameValue'),
    qrAccountNoValue: document.getElementById('qrAccountNoValue'),
    qrAmountValue: document.getElementById('qrAmountValue'),
    qrNoteValue: document.getElementById('qrNoteValue'),
    walletQrTimer: document.getElementById('walletQrTimer'),
    walletCopyToast: document.getElementById('walletCopyToast'),
    btnCreateDeposit: document.getElementById('btnCreateDeposit'),
    walletHistoryList: document.getElementById('walletHistoryList'),
    policyFeaturedFee: document.getElementById('policyFeaturedFee'),
    policyCommissionPerApproved: document.getElementById('policyCommissionPerApproved'),
    policyApprovedCount: document.getElementById('policyApprovedCount'),
    policyEstimatedCommission: document.getElementById('policyEstimatedCommission'),
    policyEstimatedFeatured: document.getElementById('policyEstimatedFeatured'),
    policyEstimatedTotal: document.getElementById('policyEstimatedTotal'),
    policyByJobList: document.getElementById('policyByJobList'),
    settingsDisplayName: document.getElementById('settingsDisplayName'),
    settingsDisplayCompany: document.getElementById('settingsDisplayCompany'),
    settingsDisplayEmail: document.getElementById('settingsDisplayEmail'),
    settingsDisplayPhone: document.getElementById('settingsDisplayPhone'),
    btnOpenAccountSettingsInline: document.getElementById('btnOpenAccountSettingsInline'),
    btnOpenWalletInline: document.getElementById('btnOpenWalletInline'),
    companyLogo: document.querySelector('.company-logo'),
    companyName: document.querySelector('.company-name'),
    companySub: document.querySelector('.company-sub')
  };

  function renderSettingsOverview() {
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!recruiter) {
      return;
    }

    if (el.settingsDisplayName) {
      el.settingsDisplayName.textContent = recruiter.name || recruiter.company || 'Recruiter';
    }
    if (el.settingsDisplayCompany) {
      el.settingsDisplayCompany.textContent = recruiter.company || recruiter.name || 'Dang cap nhat';
    }
    if (el.settingsDisplayEmail) {
      el.settingsDisplayEmail.textContent = recruiter.email || 'Dang cap nhat';
    }
    if (el.settingsDisplayPhone) {
      el.settingsDisplayPhone.textContent = recruiter.phone || 'Chua cap nhat';
    }
  }

  function updateTopbarByView(view) {
    var key = String(view || 'overview');
    var titleMap = {
      overview: 'Tech Corp Dashboard',
      jobs: 'Quản lý tin tuyển dụng',
      applicants: 'Quản lý hồ sơ ứng viên',
      interviews: 'Lịch hẹn phỏng vấn',
      policy: 'Chính sách phí',
      settings: 'Cài đặt tài khoản'
    };

    var subMap = {
      overview: 'Theo dõi tổng quan tuyển dụng, hồ sơ ứng viên và lịch phỏng vấn.',
      jobs: 'Tập trung quản lý tin đăng, trạng thái và số lượng hồ sơ cho từng vị trí.',
      applicants: 'Lọc, đánh giá và xử lý hồ sơ ứng viên theo từng tin tuyển dụng.',
      interviews: 'Theo dõi lịch phỏng vấn và xử lý trạng thái từng cuộc hẹn.',
      policy: 'Xem chi tiết chính sách phí và ước tính chi phí tuyển dụng.',
      settings: 'Quản lý thông tin tài khoản recruiter và thao tác ví tuyển dụng.'
    };

    if (el.topbarTitle) {
      el.topbarTitle.textContent = titleMap[key] || titleMap.overview;
    }
    if (el.topbarSub) {
      el.topbarSub.textContent = subMap[key] || subMap.overview;
    }
  }

  function formatCurrency(amount) { // Hàm để định dạng một số thành chuỗi tiền tệ theo định dạng Việt Nam, nó sẽ nhận vào một giá trị số và sử dụng phương thức toLocaleString với tham số 'vi-VN' để định dạng số đó theo cách hiển thị tiền tệ của Việt Nam. Kết quả trả về sẽ là một chuỗi có dấu phân cách hàng nghìn và kết thúc bằng ký hiệu 'đ' để biểu thị đồng tiền Việt Nam. Nếu giá trị đầu vào không phải là một số hợp lệ, hàm sẽ trả về '0đ'. Việc này giúp hiển thị các giá trị tiền tệ một cách dễ đọc và phù hợp với ngôn ngữ và khu vực của người dùng
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
  }

  function parseVndAmount(rawValue) {
    return Number(String(rawValue || '').replace(/[^\d]/g, '')) || 0;
  }

  function formatVndInputValue(rawValue) {
    var amount = parseVndAmount(rawValue);
    return amount > 0 ? formatCurrency(amount) : '';
  }

  function setWalletStep(step) {
    var isStepTwo = Number(step) === 2;
    if (el.walletStep1) {
      el.walletStep1.classList.toggle('hidden', isStepTwo);
    }
    if (el.walletStep2) {
      el.walletStep2.classList.toggle('hidden', !isStepTwo);
    }
    if (el.walletHistorySection) {
      el.walletHistorySection.style.display = isStepTwo ? 'none' : 'grid';
    }
    if (el.walletFooterActions) {
      el.walletFooterActions.style.display = isStepTwo ? 'none' : 'grid';
    }
  }

  function stopWalletCountdown() {
    clearInterval(state.walletCountdownTimer);
    state.walletCountdownTimer = null;
    state.walletCountdownDeadline = 0;
  }

  function renderWalletCountdown() {
    if (!el.walletQrTimer) return;

    var remainingMs = state.walletCountdownDeadline - Date.now();
    if (remainingMs <= 0) {
      el.walletQrTimer.textContent = '00:00:00';
      if (el.btnCreateDeposit) {
        el.btnCreateDeposit.disabled = true;
      }
      stopWalletCountdown();
      return;
    }

    var totalSeconds = Math.floor(remainingMs / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    el.walletQrTimer.textContent =
      String(hours).padStart(2, '0') + ':' +
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0');
  }

  function startWalletCountdown() {
    stopWalletCountdown();
    state.walletCountdownDeadline = Date.now() + (10 * 60 * 1000);
    if (el.btnCreateDeposit) {
      el.btnCreateDeposit.disabled = false;
    }
    renderWalletCountdown();
    state.walletCountdownTimer = setInterval(renderWalletCountdown, 1000);
  }

  function updateGenerateQrState() {
    if (!el.btnGenerateQr) return;
    var amount = parseVndAmount(el.depositAmount ? el.depositAmount.value : 0);
    el.btnGenerateQr.disabled = amount < 10000;
  }

  function generateAutoTransferNote() {
    var recruiter = getStoredUserRecord() || state.recruiter || {};
    var key = recruiter.id ? String(recruiter.id) : String(recruiter.email || 'EMP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    var now = new Date();
    var yy = String(now.getFullYear()).slice(-2);
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var hh = String(now.getHours()).padStart(2, '0');
    var mi = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    return 'EMP' + key + yy + mm + dd + hh + mi + ss;
  }

  function copyWalletValue(targetId) {
    if (!targetId) return;
    var target = document.getElementById(targetId);
    if (!target) return;

    var text = String(target.textContent || '').trim();
    if (!text) return;

    var showCopied = function () {
      if (!el.walletCopyToast) return;
      el.walletCopyToast.textContent = 'Da copy: ' + text;
      clearTimeout(state.walletCopyToastTimer);
      state.walletCopyToastTimer = setTimeout(function () {
        if (el.walletCopyToast) {
          el.walletCopyToast.textContent = '';
        }
      }, 1400);
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(showCopied).catch(function () {});
      return;
    }

    var area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      showCopied();
    } catch (e) {
      // ignore copy fallback errors
    }
    document.body.removeChild(area);
  }

  function getAllTransactions() { // Hàm để lấy tất cả các giao dịch đã lưu từ localStorage, nó sẽ sử dụng hàm readCollection để đọc dữ liệu từ hai khóa liên quan đến giao dịch: một khóa "shared" và một khóa "legacy". Hàm sẽ trả về một mảng các giao dịch đã được đồng bộ giữa hai khóa này. Việc này giúp đảm bảo rằng ứng dụng có thể truy cập được tất cả các giao dịch của nhà tuyển dụng, bất kể dữ liệu đang được lưu trữ ở đâu trong localStorage
    return readCollection(STORAGE.TRANSACTIONS, STORAGE.LEGACY_TRANSACTIONS);
  }

  function saveAllTransactions(items) { // Hàm để lưu tất cả các giao dịch vào localStorage, nó sẽ nhận vào một mảng các giao dịch và sử dụng hàm
    writeCollection(STORAGE.TRANSACTIONS, STORAGE.LEGACY_TRANSACTIONS, items);
  }

  function renderWalletInfo() { // Hàm để hiển thị thông tin ví của nhà tuyển dụng trong modal quản lý ví, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó để cập nhật số dư ví và lịch sử giao dịch trong modal. Nếu không tìm thấy thông tin nhà tuyển dụng, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ cập nhật phần tử hiển thị số dư ví với giá trị đã được định dạng tiền tệ. Sau đó, hàm sẽ lấy danh sách các giao dịch của nhà tuyển dụng, sắp xếp chúng theo thời gian tạo giảm dần và hiển thị tối đa 8 giao dịch gần nhất trong phần tử lịch sử giao dịch. Mỗi giao dịch sẽ được hiển thị với thông tin về loại giao dịch, trạng thái, thời gian và số tiền đã được định dạng. Nếu không có giao dịch nào, hàm sẽ hiển thị một thông báo cho biết chưa có giao dịch nào. Cuối cùng, hàm sẽ gọi renderWalletQr để hiển thị mã QR cho việc nạp tiền vào ví
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!recruiter) return;

    var balance = Number(recruiter.balance || 0);
    if (el.walletBalanceText) {
      el.walletBalanceText.textContent = formatCurrency(balance);
    }

    if (!el.walletHistoryList) {
      renderWalletQr();
      return;
    }

    var tx = Array.isArray(recruiter.transactions) ? recruiter.transactions.slice() : [];
    tx.sort(function (a, b) {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    if (!tx.length) {
      el.walletHistoryList.innerHTML = '<div class="empty-note">Chưa có giao dịch.</div>';
      return;
    }

    el.walletHistoryList.innerHTML = tx.slice(0, 8).map(function (item) {
      var status = item.status || 'Success';
      var sign = item.direction === 'out' ? '-' : '+';
      return (
        '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;">' +
          '<div style="font-weight:700;color:#334155;">' + escapeHtml(item.note || item.type || 'Giao dịch') + '</div>' +
          '<div style="display:flex;justify-content:space-between;gap:8px;color:#64748b;">' +
            '<span>' + escapeHtml(status) + ' • ' + escapeHtml(formatDateTime(item.createdAt)) + '</span>' +
            '<strong style="color:' + (item.direction === 'out' ? '#b91c1c' : '#047857') + ';">' + sign + formatCurrency(item.amount) + '</strong>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    renderWalletQr();
  }

  function buildWalletQrPayload() { // Hàm để xây dựng nội dung mã QR cho việc nạp tiền vào ví của nhà tuyển dụng, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó cùng với các giá trị nhập liệu về số tiền nạp và ghi chú để tạo thành một chuỗi nội dung mã QR. Nếu không tìm thấy thông tin nhà tuyển dụng, hàm sẽ trả về một chuỗi rỗng. Nếu tìm thấy, hàm sẽ lấy số tiền nạp và ghi chú từ các trường nhập liệu, nếu số tiền không hợp lệ hoặc không được nhập, nó sẽ mặc định là 100.000đ. Nếu ghi chú không được nhập, nó sẽ mặc định là 'NAP VI ' kèm theo email của nhà tuyển dụng viết hoa. Cuối cùng, hàm sẽ kết hợp thông tin ngân hàng, số tài khoản, tên chủ tài khoản, số tiền và ghi chú thành một chuỗi có định dạng phù hợp để tạo mã QR cho việc chuyển khoản
    var amount = parseVndAmount(el.depositAmount ? el.depositAmount.value : 0);

    var finalAmount = amount > 0 ? amount : 100000;
    var finalNote = state.walletGeneratedNote || generateAutoTransferNote();

    return {
      amount: finalAmount,
      note: finalNote
    };
  }

  function buildVietQrImageUrl(amount, note) {
    var bankCode = encodeURIComponent(QR_PAYMENT_INFO.bankCode);
    var accountNo = encodeURIComponent(QR_PAYMENT_INFO.accountNo);
    var accountName = encodeURIComponent(QR_PAYMENT_INFO.accountName);
    var addInfo = encodeURIComponent(note);
    return 'https://img.vietqr.io/image/' + bankCode + '-' + accountNo + '-compact2.png?amount=' + String(amount) + '&addInfo=' + addInfo + '&accountName=' + accountName;
  }

  function renderWalletQr() { // Hàm để hiển thị mã QR cho việc nạp tiền vào ví của nhà tuyển dụng, nó sẽ sử dụng thư viện QRCode để tạo mã QR dựa trên nội dung được xây dựng từ buildWalletQrPayload. Nếu phần tử hình ảnh mã QR không tồn tại, hàm sẽ không thực hiện gì. Nếu tồn tại, hàm sẽ tạo một đối tượng QRCode với nội dung đã được xây dựng và lấy dữ liệu hình ảnh từ đối tượng đó để hiển thị trong phần tử hình ảnh mã QR. Ngoài ra, hàm cũng sẽ cập nhật văn bản hiển thị thông tin chuyển khoản bên dưới mã QR để hướng dẫn người dùng về cách thực hiện chuyển khoản, bao gồm thông tin ngân hàng, số tài khoản, tên chủ tài khoản và số tiền cần chuyển
    if (!el.walletQrImage) return;

    var payload = buildWalletQrPayload();
    el.walletQrImage.src = buildVietQrImageUrl(payload.amount, payload.note);
    el.walletQrImage.alt = 'QR chuyển khoản employer';

    var labelAmount = formatCurrency(payload.amount);

    if (el.qrBankValue) el.qrBankValue.textContent = QR_PAYMENT_INFO.bank;
    if (el.qrAccountNameValue) el.qrAccountNameValue.textContent = QR_PAYMENT_INFO.accountName;
    if (el.qrAccountNoValue) el.qrAccountNoValue.textContent = QR_PAYMENT_INFO.accountNo;
    if (el.qrAmountValue) el.qrAmountValue.textContent = labelAmount;
    if (el.qrNoteValue) el.qrNoteValue.textContent = payload.note;

    if (el.walletQrText) {
      el.walletQrText.textContent =
        'Quet QR de vao app ngan hang voi noi dung chuyen khoan da dien san: ' + payload.note + ' • So tien: ' + labelAmount;
    }
  }

  function handleGenerateQr() {
    var amount = parseVndAmount(el.depositAmount ? el.depositAmount.value : 0);

    if (amount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10.000đ.', 'error');
      return;
    }

    state.walletGeneratedNote = generateAutoTransferNote();

    if (el.walletCopyToast) {
      el.walletCopyToast.textContent = '';
    }

    setWalletStep(2);
    renderWalletQr();
    startWalletCountdown();
  }

  function createDepositRequest() { // Hàm để tạo một yêu cầu nạp tiền vào ví của nhà tuyển dụng, nó sẽ lấy thông tin nhà tuyển dụng từ getStoredUserRecord hoặc state.recruiter và sử dụng thông tin đó cùng với các giá trị nhập liệu về số tiền nạp và ghi chú để tạo thành một đối tượng giao dịch mới. Nếu không tìm thấy thông tin nhà tuyển dụng, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ kiểm tra tính hợp lệ của số tiền nạp và ghi chú, nếu có lỗi sẽ hiển thị thông báo lỗi. Nếu tất cả đều hợp lệ, hàm sẽ tạo một đối tượng giao dịch mới với thông tin về loại giao dịch, hướng giao dịch, số tiền, ghi chú, trạng thái và thông tin nhà tuyển dụng. Sau đó, hàm sẽ lưu giao dịch này vào localStorage và cập nhật thông tin giao dịch của nhà tuyển dụng trong state.users. Cuối cùng, hàm sẽ cập nhật lại giao diện người dùng để phản ánh sự thay đổi và hiển thị thông báo thành công
    var recruiter = getStoredUserRecord() || state.recruiter;
    if (!recruiter) return;

    var payload = buildWalletQrPayload();
    var amount = Number(payload.amount || 0);
    var note = String(payload.note || '').trim();

    if (!state.walletCountdownDeadline || state.walletCountdownDeadline <= Date.now()) {
      showToast('Ma QR da het han. Vui long tao ma thanh toan moi.', 'error');
      if (el.btnCreateDeposit) {
        el.btnCreateDeposit.disabled = true;
      }
      return;
    }

    if (!amount || amount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10.000đ.', 'error');
      return;
    }

    var now = new Date().toISOString();
    var transaction = {
      id: Date.now(),
      type: 'deposit',
      direction: 'in',
      amount: amount,
      note: note,
      status: 'Pending',
      recruiterId: recruiter.id,
      recruiterEmail: recruiter.email,
      createdAt: now
    };

    var allTransactions = getAllTransactions();
    allTransactions.unshift(transaction);
    saveAllTransactions(allTransactions);

    var users = getStoredUsers().map(function (user) {
      if (Number(user.id) !== Number(recruiter.id)) return user;
      var ownTx = Array.isArray(user.transactions) ? user.transactions.slice() : [];
      ownTx.unshift(transaction);
      return Object.assign({}, user, { transactions: ownTx });
    });

    writeJson('users', users);
    state.users = users;
    state.recruiter = getStoredUserRecord() || state.recruiter;

    if (el.depositAmount) el.depositAmount.value = '';
    if (el.depositNote) el.depositNote.value = '';
    state.walletGeneratedNote = '';

    stopWalletCountdown();
    if (el.walletQrTimer) {
      el.walletQrTimer.textContent = '00:10:00';
    }

    setWalletStep(1);
    updateGenerateQrState();

    renderWalletInfo();
    showToast('Đã tạo yêu cầu nạp tiền, chờ Admin duyệt.', 'success');
  }

  function ensureInviteLocationField() { // Hàm để đảm bảo rằng trường nhập liệu cho địa điểm phỏng vấn đã tồn tại trong modal gửi lời mời phỏng vấn, nó sẽ kiểm tra xem phần tử backdrop của modal có tồn tại hay không. Nếu không tồn tại, hàm sẽ không thực hiện gì. Nếu tồn tại, hàm sẽ kiểm tra xem đã có trường nhập liệu với id 'inviteLocation' hay chưa. Nếu đã tồn tại, hàm sẽ không thực hiện gì. Nếu chưa tồn tại, hàm sẽ tạo một phần tử div mới với lớp 'field', sau đó tạo một nhãn và một trường nhập liệu cho địa điểm phỏng vấn. Nhãn sẽ được liên kết với trường nhập liệu thông qua thuộc tính for và id. Trường nhập liệu sẽ có placeholder để hướng dẫn người dùng về cách điền thông tin địa điểm. Cuối cùng, phần tử div chứa nhãn và trường nhập liệu sẽ được chèn vào trong phần thân của modal trước nút hành động cuối cùng
    if (!el.inviteModalBackdrop) return;

    var existed = document.getElementById('inviteLocation');
    if (existed) return;

    var body = el.inviteModalBackdrop.querySelector('.modal-body');
    if (!body) return;

    var wrap = document.createElement('div');
    wrap.className = 'field';

    var label = document.createElement('label');
    label.setAttribute('for', 'inviteLocation');
    label.textContent = 'Dia diem phong van';

    var input = document.createElement('input');
    input.id = 'inviteLocation';
    input.type = 'text';
    input.placeholder = 'Vi du: Tang 5, Tech Corp HQ';

    wrap.appendChild(label);
    wrap.appendChild(input);

    body.insertBefore(wrap, body.lastElementChild);
  }

  function getInviteLocationValue() { // Hàm để lấy giá trị đã nhập vào trường địa điểm phỏng vấn trong modal gửi lời mời, nó sẽ tìm kiếm phần tử input có id 'inviteLocation' trong DOM. Nếu phần tử này tồn tại, hàm sẽ lấy giá trị của trường nhập liệu, loại bỏ khoảng trắng thừa ở đầu và cuối, và trả về chuỗi đã được làm sạch. Nếu phần tử không tồn tại, hàm sẽ trả về một chuỗi rỗng. Việc này giúp đảm bảo rằng khi gửi lời mời phỏng vấn, ứng dụng có thể lấy được thông tin địa điểm một cách chính xác và an toàn
    var input = document.getElementById('inviteLocation');
    return input ? String(input.value || '').trim() : '';
  }

  function setInviteLocationValue(value) { // Hàm để đặt giá trị cho trường địa điểm phỏng vấn trong modal gửi lời mời, nó sẽ tìm kiếm phần tử input có id 'inviteLocation' trong DOM. Nếu phần tử này tồn tại, hàm sẽ gán giá trị được truyền vào cho trường nhập liệu, nếu giá trị là falsy (null, undefined, rỗng), nó sẽ đặt thành một chuỗi rỗng. Việc này giúp đảm bảo rằng khi người dùng mở modal gửi lời mời phỏng vấn để chỉnh sửa hoặc xem lại thông tin, trường địa điểm sẽ hiển thị đúng giá trị đã được lưu trữ hoặc một trường trống nếu chưa có thông tin nào
    var input = document.getElementById('inviteLocation');
    if (input) {
      input.value = value || '';
    }
  }

  function showToast(message, type) { //  Hàm để hiển thị một thông báo dạng toast trên giao diện người dùng, nó sẽ nhận vào nội dung thông báo và loại thông báo (success, error, info). Hàm sẽ tạo một phần tử div mới để làm toast, sau đó thiết lập các thuộc tính và kiểu dáng cho phần tử này dựa trên loại thông báo. Màu nền của toast sẽ khác nhau tùy thuộc vào loại thông báo: màu xanh lá cho success, màu đỏ cho error và màu xanh dương cho info. Sau khi thiết lập xong, phần tử toast sẽ được thêm vào body của trang. Toast sẽ tự động ẩn sau 2.2 giây bằng cách thay đổi độ mờ và sau đó loại bỏ phần tử khỏi DOM để giải phóng tài nguyên
    var toast = document.createElement('div');
    var bg = '#0f766e';
    if (type === 'error') {
      bg = '#b91c1c';
    }
    if (type === 'info') {
      bg = '#1d4ed8';
    }

    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.right = '16px';
    toast.style.top = '16px';
    toast.style.zIndex = '9999';
    toast.style.padding = '10px 14px';
    toast.style.color = '#fff';
    toast.style.fontSize = '13px';
    toast.style.borderRadius = '10px';
    toast.style.background = bg;
    toast.style.boxShadow = '0 8px 18px rgba(15,23,42,.2)';

    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity .2s ease';
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 220);
    }, 2200);
  }

  function getDaysBetweenNow(value) { // Hàm để tính số ngày giữa thời điểm hiện tại và một giá trị ngày tháng được truyền vào, nó sẽ nhận vào một giá trị có thể là chuỗi hoặc đối tượng Date. Hàm sẽ cố gắng chuyển đổi giá trị này thành một đối tượng Date. Nếu quá trình chuyển đổi không thành công (giá trị không phải là một ngày hợp lệ), hàm sẽ trả về null. Nếu thành công, hàm sẽ lấy thời điểm hiện tại và tính toán sự khác biệt về thời gian giữa hiện tại và ngày đã cho. Cuối cùng, hàm sẽ trả về số ngày dưới dạng số thực bằng cách chia sự khác biệt về thời gian (tính bằng milliseconds) cho số milliseconds trong một ngày
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    var now = new Date();
    var diff = now.getTime() - date.getTime();
    return diff / (1000 * 60 * 60 * 24);
  }

  function ensureCvModal() { // Hàm để đảm bảo rằng modal hiển thị thông tin hồ sơ ứng viên đã tồn tại trong DOM, nó sẽ kiểm tra xem phần tử có id 'cvModalBackdrop' đã tồn tại hay chưa. Nếu đã tồn tại, hàm sẽ không thực hiện gì. Nếu chưa tồn tại, hàm sẽ tạo một phần tử div mới để làm backdrop cho modal, sau đó thiết lập id và lớp cho phần tử này. Nội dung HTML của backdrop sẽ bao gồm cấu trúc của modal với tiêu đề, nút đóng, phần thân để hiển thị thông tin hồ sơ và các nút hành động. Sau khi tạo xong, phần tử backdrop sẽ được thêm vào body của trang. Hàm cũng sẽ gán sự kiện click cho các nút đóng và sự kiện click ngoài modal để gọi hàm closeCvModal nhằm ẩn modal khi người dùng muốn đóng nó. Ngoài ra, hàm cũng sẽ gán sự kiện click cho nút mời phỏng vấn để lấy id ứng dụng từ thuộc tính data-app-id của backdrop và mở modal gửi lời mời phỏng vấn tương ứng
    if (document.getElementById('cvModalBackdrop')) {
      return;
    }

    var backdrop = document.createElement('div');
    backdrop.id = 'cvModalBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="cvModalTitle">' +
        '<div class="modal-head">' +
          '<h3 id="cvModalTitle">Ho so ung vien</h3>' +
          '<button id="cvModalClose" class="modal-close" type="button">&times;</button>' +
        '</div>' +
        '<div id="cvModalBody" class="modal-body"></div>' +
        '<div class="modal-actions">' +
          '<button id="cvModalCloseBtn" class="btn-cancel" type="button">Dong</button>' +
          '<button id="cvModalInviteBtn" class="btn-save" type="button">Moi phong van</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    function closeCvModal() { // Hàm để đóng modal hiển thị thông tin hồ sơ ứng viên, nó sẽ tìm kiếm phần tử backdrop của modal bằng id 'cvModalBackdrop'. Nếu phần tử này tồn tại, hàm sẽ ẩn modal bằng cách đặt thuộc tính display thành 'none' và loại bỏ thuộc tính data-app-id để xóa thông tin về ứng dụng hiện tại. Việc này giúp đảm bảo rằng khi người dùng đóng modal, tất cả thông tin liên quan đến ứng dụng được hiển thị trước đó sẽ được xóa sạch và modal sẽ sẵn sàng để hiển thị thông tin của một ứng dụng khác khi được mở lại
      backdrop.style.display = 'none';
      backdrop.removeAttribute('data-app-id');
    }

    document.getElementById('cvModalClose').addEventListener('click', closeCvModal);
    document.getElementById('cvModalCloseBtn').addEventListener('click', closeCvModal);

    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) {
        closeCvModal();
      }
    });

    document.getElementById('cvModalInviteBtn').addEventListener('click', function () {
      var appId = Number(backdrop.getAttribute('data-app-id'));
      if (!appId) {
        return;
      }
      closeCvModal();
      openInviteModal(appId);
    });
  }

  function openCvModal(app, jobTitle) {  // Hàm để mở modal hiển thị thông tin hồ sơ ứng viên, nó sẽ nhận vào một đối tượng ứng dụng và tiêu đề công việc tương ứng. Hàm sẽ gọi ensureCvModal để đảm bảo rằng modal đã tồn tại trong DOM. Sau đó, hàm sẽ tìm kiếm phần tử backdrop và phần thân của modal bằng id. Nếu không tìm thấy, hàm sẽ không thực hiện gì. Nếu tìm thấy, hàm sẽ cố gắng tìm thông tin hồ sơ của ứng viên dựa trên id hoặc email từ đối tượng ứng dụng trong mảng applicants của state. Sau đó, hàm sẽ xây dựng nội dung HTML để hiển thị thông tin về ứng viên, bao gồm tên, email, vị trí ứng tuyển, tên CV, kỹ năng, kinh nghiệm, trạng thái hồ sơ, ngày nộp và lời nhắn ứng tuyển. Nội dung này sẽ được chèn vào phần thân của modal. Cuối cùng, hàm sẽ đặt thuộc tính data-app-id cho backdrop để lưu thông tin về ứng dụng hiện tại và hiển thị modal bằng cách đặt thuộc tính display thành 'flex'
    ensureCvModal(); 

    var backdrop = document.getElementById('cvModalBackdrop');
    var body = document.getElementById('cvModalBody');
    if (!backdrop || !body) {
      return;
    }

    var profile = state.applicants.find(function (item) {
      return Number(item.id) === Number(app.candidateId) || normalize(item.email) === normalize(app.email);
    }) || null;

    var cvName = app.cvName || app.cv || 'Chua cap nhat CV';
    var skills = profile && Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Dang cap nhat';
    var exp = profile && profile.years ? String(profile.years) + ' nam' : (profile && profile.experience ? profile.experience : 'Dang cap nhat');

    body.innerHTML =
      '<div class="field"><label>Ho ten</label><input type="text" readonly value="' + (app.candidateName || 'Ung vien') + '"></div>' +
      '<div class="field"><label>Email</label><input type="text" readonly value="' + (app.email || 'Chua cap nhat') + '"></div>' +
      '<div class="field"><label>Vi tri ung tuyen</label><input type="text" readonly value="' + (jobTitle || 'Khong ro vi tri') + '"></div>' +
      '<div class="field"><label>CV</label><input type="text" readonly value="' + cvName + '"></div>' +
      '<div class="field"><label>Ky nang</label><textarea readonly>' + skills + '</textarea></div>' +
      '<div class="field"><label>Kinh nghiem</label><input type="text" readonly value="' + exp + '"></div>' +
      '<div class="field"><label>Trang thai ho so</label><input type="text" readonly value="' + (app.status || 'pending') + '"></div>' +
      '<div class="field"><label>Ngay nop</label><input type="text" readonly value="' + formatDateTime(app.appliedAt) + '"></div>' +
      '<div class="field"><label>Loi nhan ung tuyen</label><textarea readonly>' + (app.message || '(Khong co)') + '</textarea></div>';

    backdrop.setAttribute('data-app-id', String(app.id));
    backdrop.style.display = 'flex';
  }

  function isOwnedByRecruiter(job) { // Hàm để kiểm tra xem một công việc có thuộc sở hữu của nhà tuyển dụng hiện tại hay không, nó sẽ nhận vào một đối tượng công việc và kiểm tra các thuộc tính liên quan đến nhà tuyển dụng trong đối tượng đó. Nếu đối tượng công việc hoặc thông tin nhà tuyển dụng trong state không tồn tại, hàm sẽ trả về false. Nếu tồn tại, hàm sẽ so sánh id của nhà tuyển dụng trong công việc với id của nhà tuyển dụng hiện tại trong state, cũng như so sánh email của nhà tuyển dụng trong công việc với email của nhà tuyển dụng hiện tại sau khi đã được chuẩn hóa. Nếu một trong hai điều kiện này đúng, hàm sẽ trả về true, cho biết rằng công việc này thuộc sở hữu của nhà tuyển dụng hiện tại
    if (!job || !state.recruiter) return false;

    var byId = Number(job.recruiterId) === Number(state.recruiter.id);
    var byEmail = normalize(job.recruiterEmail) === normalize(state.recruiter.email);

    return byId || byEmail;
  }

  function getLocalDateKey(value) { // Hàm để chuyển đổi một giá trị ngày tháng thành một chuỗi định dạng ngày tháng theo múi giờ địa phương, nó sẽ nhận vào một giá trị có thể là chuỗi hoặc đối tượng Date. Hàm sẽ cố gắng chuyển đổi giá trị này thành một đối tượng Date. Nếu quá trình chuyển đổi không thành công (giá trị không phải là một ngày hợp lệ), hàm sẽ trả về một chuỗi rỗng. Nếu thành công, hàm sẽ lấy năm, tháng và ngày từ đối tượng Date, sau đó định dạng chúng thành một chuỗi theo định dạng 'YYYY-MM-DD' với tháng và ngày được đảm bảo có hai chữ số bằng cách sử dụng padStart. Việc này giúp chuẩn hóa các giá trị ngày tháng thành một định dạng nhất quán mà có thể dễ dàng sử dụng trong các phần khác của ứng dụng, đặc biệt là khi cần so sánh hoặc hiển thị ngày tháng
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function loadState() { // Hàm để tải dữ liệu ban đầu cho trang nhà tuyển dụng, nó sẽ cố gắng lấy thông tin người dùng hiện tại bằng cách gọi getCurrentUser và lưu vào state.recruiter. Nếu không có người dùng nào được đăng nhập hoặc vai trò của người dùng không phải là 'recruiter', hàm sẽ chuyển hướng người dùng đến trang đăng nhập và trả về false để ngăn chặn việc tiếp tục tải trang. Nếu có người dùng hợp lệ, hàm sẽ tiếp tục tải các dữ liệu khác từ localStorage hoặc các nguồn lưu trữ khác, bao gồm danh sách người dùng, công việc, ứng dụng, hồ sơ ứng viên và lịch phỏng vấn. Sau khi tất cả dữ liệu đã được tải vào state, hàm sẽ trả về true để cho biết rằng quá trình tải dữ liệu đã thành công và trang có thể tiếp tục hiển thị
    state.recruiter = getCurrentUser();
    if (!state.recruiter || state.recruiter.role !== 'recruiter') {
      window.location.href = 'login.html';
      return false;
    }

    state.users = getStoredUsers();
    state.recruiter = getStoredUserRecord() || state.recruiter;
    state.jobs = readCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS);
    state.applications = readCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS);
    state.applicants = readJson('applicants', []);
    state.interviews = readJson(STORAGE.INTERVIEWS, []);

    return true;
  }

  function getRecruiterJobs() { // Hàm để lấy danh sách các công việc thuộc sở hữu của nhà tuyển dụng hiện tại, nó sẽ lọc mảng state.jobs bằng cách sử dụng hàm isOwnedByRecruiter để kiểm tra từng công việc xem có thuộc sở hữu của nhà tuyển dụng hay không. Hàm sẽ trả về một mảng mới chỉ chứa các công việc mà nhà tuyển dụng hiện tại đã đăng hoặc quản lý, giúp cho các phần khác của ứng dụng có thể dễ dàng truy cập và hiển thị thông tin về các công việc liên quan đến nhà tuyển dụng
    return state.jobs.filter(isOwnedByRecruiter);
  }

  function getRecruiterApplications() { // Hàm để lấy danh sách các ứng dụng liên quan đến các công việc của nhà tuyển dụng hiện tại, nó sẽ đầu tiên lấy danh sách các công việc thuộc sở hữu của nhà tuyển dụng bằng cách gọi getRecruiterJobs và sau đó trích xuất id của từng công việc này thành một mảng recruiterJobIds. Tiếp theo, hàm sẽ lọc mảng state.applications để chỉ giữ lại những ứng dụng mà jobId của chúng nằm trong mảng recruiterJobIds. Kết quả trả về sẽ là một mảng chứa tất cả các ứng dụng mà ứng viên đã nộp cho các công việc do nhà tuyển dụng hiện tại quản lý, giúp cho nhà tuyển dụng có thể dễ dàng xem xét và quản lý các ứng dụng này
    var recruiterJobIds = getRecruiterJobs().map(function (job) {
      return Number(job.id);
    });

    return state.applications.filter(function (app) {
      return recruiterJobIds.indexOf(Number(app.jobId)) >= 0;
    });
  }

  function getApplicantsForJob(jobId) { // Hàm để lấy danh sách các ứng dụng cụ thể cho một công việc dựa trên jobId, nó sẽ lọc mảng state.applications để chỉ giữ lại những ứng dụng mà jobId của chúng khớp với jobId được truyền vào. Hàm sẽ trả về một mảng mới chứa tất cả các ứng dụng mà ứng viên đã nộp cho công việc có id tương ứng, giúp cho nhà tuyển dụng có thể dễ dàng xem xét và quản lý các ứng dụng liên quan đến từng công việc cụ thể
    return state.applications.filter(function (app) {
      return Number(app.jobId) === Number(jobId);
    });
  }

  function getApplicantLimit(job) { // Hàm để lấy giới hạn số lượng ứng viên cho một công việc, nó sẽ nhận vào một đối tượng công việc và kiểm tra các thuộc tính liên quan đến giới hạn ứng viên trong đối tượng đó. Hàm sẽ cố gắng lấy giá trị từ thuộc tính maxApplicants hoặc applicantLimit của công việc, nếu cả hai đều không tồn tại thì sẽ trả về 0. Sau đó, hàm sẽ kiểm tra xem giá trị này có phải là một số hữu hạn và lớn hơn 0 hay không. Nếu không phải, hàm sẽ trả về 0 để biểu thị rằng không có giới hạn ứng viên nào được đặt cho công việc này. Nếu hợp lệ, hàm sẽ trả về giá trị đã được làm tròn xuống thành số nguyên, đảm bảo rằng giới hạn ứng viên luôn là một số nguyên dương
    var raw = Number(job && (job.maxApplicants || job.applicantLimit || 0));
    if (!Number.isFinite(raw) || raw <= 0) {
      return 0;
    }
    return Math.floor(raw);
  }

  function getApplicantQuotaLabel(job) { // Hàm để tạo nhãn hiển thị số lượng ứng viên đã nộp so với giới hạn ứng viên cho một công việc, nó sẽ nhận vào một đối tượng công việc và sử dụng hàm getApplicantsForJob để lấy tổng số ứng viên đã nộp cho công việc đó. Sau đó, hàm sẽ gọi getApplicantLimit để lấy giới hạn số lượng ứng viên cho công việc. Nếu giới hạn lớn hơn 0, hàm sẽ trả về một chuỗi định dạng 'total/limit ho so' để hiển thị số lượng ứng viên đã nộp so với giới hạn. Nếu không có giới hạn nào được đặt (limit bằng 0), hàm sẽ trả về một chuỗi chỉ chứa tổng số ứng viên đã nộp theo định dạng 'total ho so'. Việc này giúp nhà tuyển dụng dễ dàng theo dõi số lượng ứng viên đã nộp cho từng công việc và biết được khi nào họ đã đạt đến giới hạn nếu có
    var total = getApplicantsForJob(job.id).length;
    var limit = getApplicantLimit(job);
    if (limit > 0) {
      return total + '/' + limit + ' ho so';
    }
    return total + ' ho so';
  }

  function getPreferredApplicantJob() { // Hàm để xác định công việc ưu tiên nhất dựa trên số lượng ứng viên đã nộp và thời gian nộp hồ sơ, nó sẽ lấy danh sách các công việc thuộc sở hữu của nhà tuyển dụng hiện tại bằng cách gọi getRecruiterJobs. Nếu không có công việc nào, hàm sẽ trả về null. Nếu có công việc, hàm sẽ lọc ra những công việc có ít nhất một ứng viên đã nộp hồ sơ bằng cách sử dụng getApplicantsForJob để kiểm tra số lượng ứng viên cho từng công việc. Nếu không có công việc nào có ứng viên, hàm sẽ trả về công việc đầu tiên trong danh sách. Nếu có nhiều công việc có ứng viên, hàm sẽ sắp xếp chúng theo thời gian nộp hồ sơ mới nhất của các ứng viên, sau đó trả về công việc có ứng viên nộp hồ sơ mới nhất. Việc này giúp nhà tuyển dụng nhanh chóng xác định được công việc nào đang thu hút nhiều sự quan tâm từ ứng viên và có thể cần được ưu tiên xem xét
    var jobs = getRecruiterJobs();
    if (!jobs.length) {
      return null;
    }

    var jobsWithApplicants = jobs.filter(function (job) {
      return getApplicantsForJob(job.id).length > 0;
    });

    if (!jobsWithApplicants.length) {
      return jobs[0];
    }

    jobsWithApplicants.sort(function (left, right) {
      var leftLatest = getApplicantsForJob(left.id).reduce(function (latest, app) {
        return Math.max(latest, new Date(app.appliedAt || app.updatedAt || 0).getTime());
      }, 0);
      var rightLatest = getApplicantsForJob(right.id).reduce(function (latest, app) {
        return Math.max(latest, new Date(app.appliedAt || app.updatedAt || 0).getTime());
      }, 0);
      return rightLatest - leftLatest;
    });

    return jobsWithApplicants[0];
  }

  function getRecruiterInterviews() { // Hàm để lấy danh sách các lịch phỏng vấn liên quan đến nhà tuyển dụng hiện tại, nó sẽ lọc mảng state.interviews để chỉ giữ lại những lịch phỏng vấn mà nhà tuyển dụng hiện tại có liên quan. Hàm sẽ kiểm tra từng lịch phỏng vấn xem có thuộc về nhà tuyển dụng hiện tại hay không bằng cách so sánh recruiterId của lịch phỏng vấn với id của nhà tuyển dụng trong state. Nếu recruiterId khớp, lịch phỏng vấn sẽ được giữ lại. Nếu recruiterId không tồn tại nhưng applicationId có tồn tại, hàm sẽ tìm kiếm ứng dụng tương ứng trong state.applications và sau đó tìm kiếm công việc liên quan đến ứng dụng đó trong state.jobs. Nếu công việc này thuộc sở hữu của nhà tuyển dụng hiện tại (kiểm tra bằng isOwnedByRecruiter), lịch phỏng vấn cũng sẽ được giữ lại. Kết quả trả về sẽ là một mảng chứa tất cả các lịch phỏng vấn mà nhà tuyển dụng hiện tại có liên quan, giúp cho nhà tuyển dụng có thể dễ dàng quản lý và theo dõi các cuộc phỏng vấn của mình
    return state.interviews.filter(function (interview) {
      if (Number(interview.recruiterId) === Number(state.recruiter.id)) {
        return true;
      }

      if (!interview.recruiterId && Number(interview.applicationId)) {
        var app = state.applications.find(function (item) {
          return Number(item.id) === Number(interview.applicationId);
        });
        if (!app) return false;

        var job = state.jobs.find(function (item) {
          return Number(item.id) === Number(app.jobId);
        });
        return !!(job && isOwnedByRecruiter(job));
      }

      return false;
    });
  }

  function getInterviewStatusMeta(status) { // Hàm để lấy thông tin hiển thị về trạng thái của một lịch phỏng vấn, nó sẽ nhận vào một chuỗi trạng thái và chuẩn hóa nó bằng cách loại bỏ khoảng trắng thừa và chuyển đổi thành chữ thường. Sau đó, hàm sẽ so sánh trạng thái đã chuẩn hóa với các giá trị 'done', 'canceled' và mặc định (được coi là 'scheduled'). Nếu trạng thái là 'done', hàm sẽ trả về một đối tượng chứa css class 'open' và text 'Da xong'. Nếu trạng thái là 'canceled', hàm sẽ trả về một đối tượng chứa css class 'closed' và
    var st = normalize(status);
    if (st === 'done') {
      return { css: 'open', text: 'Da xong' };
    }
    if (st === 'canceled') {
      return { css: 'closed', text: 'Da huy' };
    }
    return { css: 'expired', text: 'Da hen' };
  }

  function getInterviewMeta(interview) { // Hàm để lấy thông tin liên quan đến một lịch phỏng vấn cụ thể, nó sẽ nhận vào một đối tượng lịch phỏng vấn và cố gắng tìm kiếm thông tin về ứng dụng và công việc liên quan đến lịch phỏng vấn đó. Hàm sẽ tìm kiếm ứng dụng trong state.applications dựa trên applicationId của lịch phỏng vấn. Nếu tìm thấy ứng dụng, hàm sẽ tiếp tục tìm kiếm công việc liên quan đến ứng dụng đó trong state.jobs dựa trên jobId của ứng dụng. Kết quả trả về sẽ là một đối tượng chứa thông tin về ứng dụng (app) và công việc (job) liên quan đến lịch phỏng vấn, giúp cho các phần khác của ứng dụng có thể dễ dàng truy cập và hiển thị thông tin này khi cần thiết
    var app = state.applications.find(function (item) {
      return Number(item.id) === Number(interview.applicationId);
    }) || null;
    var job = app ? state.jobs.find(function (item) {
      return Number(item.id) === Number(app.jobId);
    }) : null;

    return {
      app: app,
      job: job
    };
  }

  function getDaysBetweenNow(value) { // Hàm để tính số ngày giữa thời điểm hiện tại và một giá trị ngày tháng được truyền vào, nó sẽ nhận vào một giá trị có thể là chuỗi hoặc đối tượng Date. Hàm sẽ cố gắng chuyển đổi giá trị này thành một đối tượng Date. Nếu quá trình chuyển đổi không thành công (giá trị không phải là một ngày hợp lệ), hàm sẽ trả về null. Nếu thành công, hàm sẽ lấy thời điểm hiện tại và tính toán sự khác biệt về thời gian giữa hiện tại và ngày đã cho. Cuối cùng, hàm sẽ trả về số ngày dưới dạng số thực bằng cách chia sự khác biệt về thời gian (tính bằng milliseconds) cho số milliseconds trong một ngày
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    var now = new Date();
    var diff = now.getTime() - date.getTime();
    return diff / (1000 * 60 * 60 * 24);
  }

  function filterInterviews(items) { // Hàm để lọc danh sách các lịch phỏng vấn dựa trên các tiêu chí tìm kiếm và lọc được lưu trong state, nó sẽ nhận vào một mảng các lịch phỏng vấn và áp dụng các bộ lọc dựa trên từ khóa tìm kiếm, id công việc, trạng thái phỏng vấn và bộ lọc ngày tháng. Hàm sẽ chuẩn hóa các giá trị này từ state để đảm bảo rằng việc so sánh được thực hiện một cách nhất quán. Sau đó, hàm sẽ lọc mảng lịch phỏng vấn bằng cách kiểm tra từng lịch phỏng vấn xem có khớp với các tiêu chí đã đặt hay không. Nếu một lịch phỏng vấn không khớp với bất kỳ tiêu chí nào, nó sẽ bị loại bỏ khỏi kết quả. Kết quả trả về sẽ là một mảng mới chỉ chứa những lịch phỏng vấn phù hợp với các tiêu chí tìm kiếm và lọc đã được thiết lập trong state
    var key = normalize(state.interviewKeyword);
    var jobId = String(state.interviewJobId || 'all');
    var status = normalize(state.interviewStatus);
    var dateFilter = state.interviewDate;

    return items.filter(function (interview) {
      var meta = getInterviewMeta(interview);
      var app = meta.app;
      var job = meta.job;

      if (jobId !== 'all' && String(app && app.jobId) !== jobId) {
        return false;
      }

      if (status !== 'all' && normalize(interview.status || 'scheduled') !== status) {
        return false;
      }

      if (dateFilter !== 'all') {
        var days = getDaysBetweenNow(interview.interviewDate || interview.createdAt);
        if (days === null) {
          return false;
        }

        if (dateFilter === 'today' && days > 1) {
          return false;
        }

        if (dateFilter === '7d' && days > 7) {
          return false;
        }

        if (dateFilter === '30d' && days > 30) {
          return false;
        }
      }

      if (!key) {
        return true;
      }

      return normalize(app && app.candidateName).includes(key) ||
        normalize(app && app.email).includes(key) ||
        normalize(job && job.title).includes(key) ||
        normalize(interview.interviewLocation).includes(key) ||
        normalize(interview.status).includes(key);
    });
  }

  function renderInterviewList() { // Hàm để hiển thị danh sách các lịch phỏng vấn trên giao diện người dùng, nó sẽ kiểm tra xem phần tử el.interviewList đã tồn tại hay chưa. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ gọi getRecruiterInterviews để lấy danh sách các lịch phỏng vấn liên quan đến nhà tuyển dụng hiện tại, sau đó áp dụng filterInterviews để lọc danh sách này dựa trên các tiêu chí tìm kiếm và lọc được lưu trong state. Kết quả sau khi lọc sẽ được sắp xếp theo ngày phỏng vấn hoặc ngày tạo mới nhất trước. Nếu không có lịch phỏng vấn nào sau khi lọc, hàm sẽ hiển thị một thông báo cho biết rằng chưa có lịch phỏng vấn nào. Nếu có lịch phỏng vấn, hàm sẽ xây dựng nội dung HTML để hiển thị thông tin về từng lịch phỏng vấn, bao gồm tên ứng viên, vị trí ứng tuyển, ngày giờ phỏng vấn, địa điểm, ghi chú và trạng thái của lịch phỏng vấn. Nội dung này sẽ được chèn vào phần tử el.interviewList để hiển thị trên giao diện
    if (!el.interviewList) return;

    var interviews = filterInterviews(getRecruiterInterviews()).sort(function (left, right) {
      return new Date(right.interviewDate || right.createdAt || 0).getTime() - new Date(left.interviewDate || left.createdAt || 0).getTime();
    });

    if (!interviews.length) {
      el.interviewList.innerHTML = '<div class="empty-note">Chua co lich phong van nao.</div>';
      return;
    }

    el.interviewList.innerHTML = interviews.map(function (interview) {
      var meta = getInterviewMeta(interview);
      var app = meta.app || {};
      var job = meta.job || {};
      var statusMeta = getInterviewStatusMeta(interview.status || 'scheduled');

      return (
        '<div class="applicant-item">' +
          '<div class="applicant-main">' +
            '<div class="applicant-name">' + (app.candidateName || 'Ung vien') + '</div>' +
            '<div class="applicant-meta">' + (job.title || 'Khong ro vi tri') + ' | ' + formatDateTime(interview.interviewDate) + '</div>' +
            '<div class="applicant-meta">Dia diem: ' + (interview.interviewLocation || 'Chua cap nhat') + '</div>' +
            '<div class="applicant-meta">' + (interview.interviewNote || '(Khong co ghi chu)') + '</div>' +
          '</div>' +
          '<div class="applicant-side">' +
            '<span class="badge ' + statusMeta.css + '">' + statusMeta.text + '</span>' +
            '<div class="row-actions" style="justify-content:flex-end; margin-top:10px;">' +
              '<button class="btn-xs" data-interview-action="view-cv" data-id="' + interview.applicationId + '">Xem CV</button>' +
              '<button class="btn-xs btn-toggle" data-interview-action="done" data-id="' + interview.id + '">Hoan thanh</button>' +
              '<button class="btn-xs" data-interview-action="canceled" data-id="' + interview.id + '">Huy</button>' +
              '<button class="btn-xs btn-delete-app" data-interview-action="delete" data-id="' + interview.id + '">Xoa</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function populateApplicantJobSelect() { // Hàm để điền các tùy chọn công việc vào một phần tử select trên giao diện người dùng, nó sẽ kiểm tra xem phần tử el.applicantJobSelect đã tồn tại hay chưa. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ gọi getRecruiterJobs để lấy danh sách các công việc thuộc sở hữu của nhà tuyển dụng hiện tại. Nếu không có công việc nào, hàm sẽ đặt nội dung của select thành một tùy chọn duy nhất cho biết rằng chưa có tin tuyển dụng nào. Nếu có công việc, hàm sẽ xây dựng nội dung HTML cho mỗi công việc dưới dạng một tùy chọn trong select, bao gồm tiêu đề công việc và số lượng ứng viên đã nộp so với giới hạn nếu có. Sau khi điền xong các tùy chọn, hàm sẽ kiểm tra xem state.activeJobId có được thiết lập hay không. Nếu có, hàm sẽ cố gắng đặt giá trị của select thành activeJobId. Nếu giá trị này không tồn tại trong các tùy chọn (có thể do dữ liệu đã thay đổi), hàm sẽ đặt giá trị của select thành công việc đầu tiên trong danh sách. Nếu state.activeJobId không được thiết lập, hàm sẽ gọi getPreferredApplicantJob để xác định công việc ưu tiên và đặt giá trị của select tương ứng
    if (!el.applicantJobSelect) { 
      return;
    }

    var jobs = getRecruiterJobs();
    if (!jobs.length) {
      el.applicantJobSelect.innerHTML = '<option value="">Chua co tin tuyen dung</option>';
      return;
    }

    el.applicantJobSelect.innerHTML = jobs.map(function (job) {
      return '<option value="' + job.id + '">' + job.title + ' (' + getApplicantQuotaLabel(job) + ')</option>';
    }).join('');

    if (state.activeJobId) {
      el.applicantJobSelect.value = String(state.activeJobId);
      if (el.applicantJobSelect.value !== String(state.activeJobId)) {
        el.applicantJobSelect.value = String(jobs[0].id);
      }
      return;
    }

    var preferred = getPreferredApplicantJob();
    if (preferred) {
      el.applicantJobSelect.value = String(preferred.id);
    }
  }

  function populateInterviewJobFilter() {
    if (!el.interviewJobFilter) {
      return;
    }

    var jobs = getRecruiterJobs();
    var current = String(state.interviewJobId || 'all');

    el.interviewJobFilter.innerHTML = '<option value="all">Tat ca tin dang</option>' + jobs.map(function (job) {
      return '<option value="' + job.id + '">' + job.title + '</option>';
    }).join('');

    if (jobs.some(function (job) {
      return String(job.id) === current;
    })) {
      el.interviewJobFilter.value = current;
      return;
    }

    el.interviewJobFilter.value = 'all';
    state.interviewJobId = 'all';
  }

  function updateStats() { // Hàm để cập nhật các thống kê liên quan đến công việc và ứng dụng của nhà tuyển dụng trên giao diện người dùng, nó sẽ gọi getRecruiterJobs và getRecruiterApplications để lấy danh sách các công việc và ứng dụng liên quan đến nhà tuyển dụng hiện tại. Sau đó, hàm sẽ tính toán số lượng tin tuyển dụng đang mở (có trạng thái 'open' hoặc 'active'), tổng số ứng viên đã nộp hồ sơ, số lượng ứng viên chưa đọc (có isNew là true) và số lượng lịch phỏng vấn diễn ra trong ngày hôm nay. Cuối cùng, hàm sẽ cập nhật nội dung của các phần tử thống kê trên giao diện nếu chúng tồn tại, đồng thời gọi renderFeePolicyPanel để cập nhật thông tin về chính sách phí dựa trên dữ liệu hiện tại
    var recruiterJobs = getRecruiterJobs();
    var recruiterApplications = getRecruiterApplications();

    var openPosts = recruiterJobs.filter(function (job) {
      var st = normalize(job.status);
      return st === 'open' || st === 'active';
    }).length;

    var allApplicants = recruiterApplications.length;

    var unread = recruiterApplications.filter(function (app) {
      return app.isNew === true;
    }).length;

    var today = getLocalDateKey(new Date());
    var interviewToday = getRecruiterInterviews().filter(function (itv) {
      return getLocalDateKey(itv.interviewDate || itv.createdAt) === today;
    }).length;

    if (el.statOpenPosts) el.statOpenPosts.textContent = String(openPosts);
    if (el.statTotalApplicants) el.statTotalApplicants.textContent = String(allApplicants);
    if (el.statUnread) el.statUnread.textContent = String(unread);
    if (el.statInterviewToday) el.statInterviewToday.textContent = String(interviewToday);

    renderFeePolicyPanel();
  }

  function renderFeePolicyPanel() { // Hàm để hiển thị thông tin về chính sách phí liên quan đến các công việc và ứng dụng của nhà tuyển dụng trên giao diện người dùng, nó sẽ kiểm tra xem phần tử el.policySection đã tồn tại hay chưa. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ gọi getRecruiterJobs và getRecruiterApplications để lấy danh sách các công việc và ứng dụng liên quan đến nhà tuyển dụng hiện tại. Sau đó, hàm sẽ lọc ra những ứng dụng có trạng thái 'approved' để tính toán số lượng ứng dụng được duyệt. Hàm cũng sẽ tính toán số lượng công việc được đánh dấu là nổi bật (featured). Dựa trên số lượng ứng dụng được duyệt và công việc nổi bật, hàm sẽ tính toán ước tính tổng phí hoa hồng và phí ghim nổi bật mà nhà tuyển dụng có thể phải trả. Cuối cùng, hàm sẽ cập nhật nội dung của các phần tử liên quan đến chính sách phí trên giao diện nếu chúng tồn tại, đồng thời xây dựng một danh sách chi tiết theo từng công việc nếu phần tử el.policyByJobList tồn tại
    if (!el.policySection) {
      return;
    }

    var recruiterJobs = getRecruiterJobs();
    var recruiterApplications = getRecruiterApplications();
    var approvedApplications = recruiterApplications.filter(function (app) {
      return normalize(app.status) === 'approved';
    });

    var approvedCount = approvedApplications.length;
    var featuredCount = recruiterJobs.filter(function (job) {
      return !!job.featured;
    }).length;

    var estimatedCommission = approvedCount * COMMISSION_PER_APPROVED_FEE;
    var estimatedFeatured = featuredCount * FEATURED_PIN_FEE;
    var estimatedTotal = estimatedCommission + estimatedFeatured;

    if (el.policyFeaturedFee) el.policyFeaturedFee.textContent = formatCurrency(FEATURED_PIN_FEE);
    if (el.policyCommissionPerApproved) el.policyCommissionPerApproved.textContent = formatCurrency(COMMISSION_PER_APPROVED_FEE);
    if (el.policyApprovedCount) el.policyApprovedCount.textContent = String(approvedCount);
    if (el.policyEstimatedCommission) el.policyEstimatedCommission.textContent = formatCurrency(estimatedCommission);
    if (el.policyEstimatedFeatured) el.policyEstimatedFeatured.textContent = formatCurrency(estimatedFeatured);
    if (el.policyEstimatedTotal) el.policyEstimatedTotal.textContent = formatCurrency(estimatedTotal);

    if (!el.policyByJobList) {
      return;
    }

    if (!recruiterJobs.length) {
      el.policyByJobList.innerHTML = '<div class="empty-note">Chua co tin tuyen dung de tinh phi.</div>';
      return;
    }

    var lines = recruiterJobs.map(function (job) {
      var approvedByJob = recruiterApplications.filter(function (app) {
        return Number(app.jobId) === Number(job.id) && normalize(app.status) === 'approved';
      }).length;
      var commissionByJob = approvedByJob * COMMISSION_PER_APPROVED_FEE;
      var featuredByJob = job.featured ? FEATURED_PIN_FEE : 0;
      var totalByJob = commissionByJob + featuredByJob;

      return {
        title: job.title || 'Khong ro vi tri',
        approvedByJob: approvedByJob,
        featuredByJob: featuredByJob,
        commissionByJob: commissionByJob,
        totalByJob: totalByJob
      };
    }).sort(function (a, b) {
      return b.totalByJob - a.totalByJob;
    });

    el.policyByJobList.innerHTML = lines.map(function (line) {
      return (
        '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;">' +
          '<div style="font-weight:700;color:#334155;">' + escapeHtml(line.title) + '</div>' +
          '<div style="display:flex;justify-content:space-between;gap:8px;color:#64748b;">' +
            '<span>Duyet: ' + line.approvedByJob + ' ho so • Hoa hong: ' + formatCurrency(line.commissionByJob) + '</span>' +
            '<strong style="color:#0f172a;">Tong: ' + formatCurrency(line.totalByJob) + '</strong>' +
          '</div>' +
          '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Phi ghim: ' + formatCurrency(line.featuredByJob) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderJobTable() { // Hàm để hiển thị bảng danh sách các công việc của nhà tuyển dụng trên giao diện người dùng, nó sẽ kiểm tra xem phần tử el.jobTableBody đã tồn tại hay chưa. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ gọi getRecruiterJobs để lấy danh sách các công việc thuộc sở hữu của nhà tuyển dụng hiện tại. Nếu state.topKeyword được thiết lập, hàm sẽ lọc danh sách công việc dựa trên từ khóa này bằng cách kiểm tra xem tiêu đề hoặc tên công ty của công việc có chứa từ khóa đã chuẩn hóa hay không. Nếu sau khi lọc không còn công việc nào, hàm sẽ hiển thị một thông báo cho biết rằng chưa có tin tuyển dụng nào. Nếu có công việc, hàm sẽ xây dựng nội dung HTML cho mỗi công việc dưới dạng một hàng trong bảng, bao gồm tiêu đề công việc, ngày đăng, số lượng ứng viên đã nộp so với giới hạn, trạng thái và các hành động như bật/tắt tin tuyển dụng và xóa tin tuyển dụng. Nội dung này sẽ được chèn vào phần tử el.jobTableBody để hiển thị trên giao diện
    if (!el.jobTableBody) return;

    var jobs = getRecruiterJobs();
    if (state.topKeyword) {
      var topKey = normalize(state.topKeyword);
      jobs = jobs.filter(function (job) {
        return normalize(job.title).includes(topKey) || normalize(job.company).includes(topKey);
      });
    }

    if (!jobs.length) {
      el.jobTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chua co tin tuyen dung nao.</td></tr>';
      return;
    }

    el.jobTableBody.innerHTML = jobs.map(function (job) {
      var status = getStatusMeta(job.status);
      var quotaLabel = getApplicantQuotaLabel(job);
      var st = normalize(job.status);
      var toggleText = st === 'open' || st === 'active' ? 'Dong tin' : 'Mo tin';

      return (
        '<tr>' +
          '<td><strong>' + job.title + '</strong></td>' +
          '<td>' + formatDate(job.postedDate) + '</td>' +
          '<td>' + quotaLabel + '</td>' +
          '<td><span class="badge ' + status.css + '">' + status.text + '</span></td>' +
          '<td>' +
            '<div class="row-actions">' +
              '<button class="btn-xs btn-toggle" data-action="toggle-job" data-id="' + job.id + '">' + toggleText + '</button>' +
              '<button class="btn-xs" data-action="delete-job" data-id="' + job.id + '">Xoa tin</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    populateApplicantJobSelect();
  }

  function toggleJobStatus(jobId) { // Hàm để thay đổi trạng thái của một công việc dựa trên jobId, nó sẽ nhận vào id của công việc cần thay đổi trạng thái và tìm kiếm công việc này trong mảng state.jobs. Nếu tìm thấy công việc, hàm sẽ kiểm tra trạng thái hiện tại của công việc đó. Nếu trạng thái là 'open' hoặc 'active', hàm sẽ chuyển trạng thái sang 'closed'. Ngược lại, nếu trạng thái không phải là 'open' hoặc 'active', hàm sẽ chuyển trạng thái sang 'open'. Sau khi cập nhật trạng thái của công việc, hàm sẽ ghi lại sự thay đổi này vào bộ nhớ lưu trữ bằng cách gọi writeCollection và sau đó cập nhật lại giao diện người dùng bằng cách gọi renderJobTable, populateInterviewJobFilter, renderInterviewList và updateStats. Cuối cùng, hàm sẽ hiển thị một thông báo cho biết rằng trạng thái của tin tuyển dụng đã được cập nhật
    var found = false;

    state.jobs = state.jobs.map(function (job) {
      if (Number(job.id) !== Number(jobId)) {
        return job;
      }

      found = true;
      var st = normalize(job.status);
      var next = st === 'open' || st === 'active' ? 'closed' : 'open';
      return Object.assign({}, job, { status: next });
    });

    if (!found) return;

    writeCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS, state.jobs);
    renderJobTable();
    populateInterviewJobFilter();
    renderInterviewList();
    updateStats();
    showToast('Đã cập nhật trạng thái tin tuyển dụng.', 'info');
  }

  function deleteJob(jobId) { // Hàm để xóa một công việc dựa trên jobId, nó sẽ nhận vào id của công việc cần xóa và lọc mảng state.jobs để loại bỏ công việc có id khớp với jobId được truyền vào. Hàm sẽ so sánh độ dài của mảng trước và sau khi lọc để xác định xem có công việc nào thực sự bị xóa hay không. Nếu không có công việc nào bị xóa (độ dài không thay đổi), hàm sẽ dừng lại và không thực hiện gì thêm. Nếu có công việc bị xóa, hàm sẽ ghi lại sự thay đổi này vào bộ nhớ lưu trữ bằng cách gọi writeCollection và sau đó kiểm tra xem công việc bị xóa có phải là công việc đang được chọn làm activeJobId hay không. Nếu đúng, hàm sẽ đặt activeJobId thành null và cố gắng tìm một công việc ưu tiên khác để đặt làm activeJobId. Cuối cùng, hàm sẽ cập nhật lại giao diện người dùng bằng cách gọi renderJobTable, populateInterviewJobFilter, renderInterviewList, updateStats và renderRecentActivities, đồng thời hiển thị một thông báo cho biết rằng tin tuyển dụng đã được xóa
    var before = state.jobs.length;
    state.jobs = state.jobs.filter(function (job) {
      return Number(job.id) !== Number(jobId);
    });

    if (state.jobs.length === before) {
      return;
    }

    writeCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS, state.jobs);

    if (Number(state.activeJobId) === Number(jobId)) {
      state.activeJobId = null;
      var preferred = getPreferredApplicantJob();
      if (preferred) {
        state.activeJobId = preferred.id;
      }
    }

    renderJobTable();
    populateInterviewJobFilter();
    renderInterviewList();
    updateStats();
    renderRecentActivities();
    renderTrendBars();
    showToast('Đã xóa tin tuyển dụng.', 'info');
  }

  function getApplicantStatusMeta(status) { // Hàm để lấy thông tin hiển thị về trạng thái của một ứng viên, nó sẽ nhận vào một chuỗi trạng thái và chuẩn hóa nó bằng cách loại bỏ khoảng trắng thừa và chuyển đổi thành chữ thường. Sau đó, hàm sẽ so sánh trạng thái đã chuẩn hóa với các giá trị 'pending', 'approved', 'reviewed' và các trạng thái liên quan đến phỏng vấn. Nếu trạng thái là 'pending', hàm sẽ trả về một đối tượng chứa css class 'pending', text 'Cho duyet' và icon tương ứng. Nếu trạng thái là 'approved' hoặc 'reviewed', hàm sẽ trả về một đối tượng chứa css class 'approved', text 'Da duyet' và icon tương ứng. Nếu trạng thái có chứa từ khóa liên quan đến phỏng vấn, hàm sẽ trả về một đối tượng chứa css class 'interview', text 'Mời phỏng vấn' và icon tương ứng. Nếu trạng thái không khớp với bất kỳ trường hợp nào trong số này, hàm sẽ trả về một đối tượng mặc định với css class 'other', text là giá trị của status hoặc 'Đang xử lý' nếu status không tồn tại, và icon tương ứng
    var st = normalize(status);
    if (st === 'pending') {
      return { css: 'pending', text: 'Cho duyet', icon: 'fa-regular fa-hourglass-half' };
    }
    if (st === 'approved' || st === 'reviewed') {
      return { css: 'approved', text: 'Da duyet', icon: 'fa-solid fa-circle-check' };
    }
    if (st.indexOf('phong van') >= 0 || st.indexOf('interview') >= 0) {
      return { css: 'interview', text: 'Mời phỏng vấn', icon: 'fa-regular fa-calendar-check' };
    }
    return { css: 'other', text: status || 'Đang xử lý', icon: 'fa-solid fa-circle-info' };
  }

  function deleteApplication(appId) { //  Hàm để xóa một hồ sơ ứng viên dựa trên appId, nó sẽ nhận vào id của ứng dụng cần xóa và lọc mảng state.applications để loại bỏ ứng dụng có id khớp với appId được truyền vào. Hàm sẽ so sánh độ dài của mảng trước và sau khi lọc để xác định xem có ứng dụng nào thực sự bị xóa hay không. Nếu không có ứng dụng nào bị xóa (độ dài không thay đổi), hàm sẽ dừng lại và không thực hiện gì thêm. Nếu có ứng dụng bị xóa, hàm sẽ ghi lại sự thay đổi này vào bộ nhớ lưu trữ bằng cách gọi writeCollection. Sau đó, hàm sẽ tiếp tục lọc mảng state.interviews để loại bỏ bất kỳ lịch phỏng vấn nào liên quan đến ứng dụng đã bị xóa (dựa trên applicationId). Cuối cùng, hàm sẽ cập nhật lại giao diện người dùng bằng cách gọi filterApplicants, renderInterviewList, renderRecentActivities, renderTrendBars, updateStats và hiển thị một thông báo cho biết rằng hồ sơ ứng viên đã được xóa
    var before = state.applications.length;
    state.applications = state.applications.filter(function (app) {
      return Number(app.id) !== Number(appId);
    });

    if (state.applications.length === before) {
      return;
    }

    writeCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS, state.applications);

    state.interviews = state.interviews.filter(function (interview) {
      return Number(interview.applicationId) !== Number(appId);
    });
    writeJson(STORAGE.INTERVIEWS, state.interviews);

    filterApplicants();
    renderInterviewList();
    renderRecentActivities();
    renderTrendBars();
    updateStats();
    showToast('Đã xóa hồ sơ ứng viên.', 'info');
  }

  function renderApplicantList(items) { // Hàm để hiển thị danh sách các ứng viên đã nộp hồ sơ cho một công việc cụ thể trên giao diện người dùng, nó sẽ nhận vào một mảng các ứng dụng (ứng viên) và kiểm tra xem phần tử el.applicantList đã tồn tại hay chưa. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ áp dụng các bộ lọc dựa trên trạng thái ứng viên, thời gian nộp hồ sơ và từ khóa tìm kiếm được lưu trong state để lọc danh sách ứng viên. Sau khi lọc, nếu không còn ứng viên nào phù hợp, hàm sẽ hiển thị một thông báo cho biết rằng chưa có ứng viên nào nộp vào tin tuyển dụng này. Nếu có ứng viên phù hợp, hàm sẽ xây dựng nội dung HTML cho mỗi ứng viên, bao gồm tên ứng viên, email, tên CV, vị trí ứng tuyển, trạng thái và thời gian nộp hồ sơ. Nội dung này cũng bao gồm các hành động như xem CV, duyệt hồ sơ, gửi lời mời phỏng vấn và xóa hồ sơ. Cuối cùng, nội dung HTML được xây dựng sẽ được chèn vào phần tử el.applicantList để hiển thị trên giao diện
    if (!el.applicantList) return;

    var list = items.slice();
    var statusFilter = el.applicantStatusFilter ? normalize(el.applicantStatusFilter.value) : 'all';
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(function (app) {
        return normalize(app.status).includes(statusFilter);
      });
    }

    var timeFilter = el.applicantTimeFilter ? normalize(el.applicantTimeFilter.value) : 'all';
    if (timeFilter && timeFilter !== 'all') {
      list = list.filter(function (app) {
        var days = getDaysBetweenNow(app.appliedAt || app.updatedAt);
        if (days === null) {
          return false;
        }
        if (timeFilter === 'today') {
          return days < 1;
        }
        if (timeFilter === '7d') {
          return days <= 7;
        }
        if (timeFilter === '30d') {
          return days <= 30;
        }
        return true;
      });
    }

    var searchKey = el.applicantSearch ? normalize(el.applicantSearch.value) : '';
    if (searchKey) {
      list = list.filter(function (app) {
        return normalize(app.candidateName).includes(searchKey) ||
          normalize(app.email).includes(searchKey) ||
          normalize(app.cvName || app.cv).includes(searchKey) ||
          normalize(app.message).includes(searchKey);
      });
    }

    if (!list.length) {
      el.applicantList.innerHTML = '<div class="empty-note">Chua co ung vien nop vao tin nay.</div>';
      return;
    }

    el.applicantList.innerHTML = list.map(function (app) {
      var unreadTag = app.isNew ? ' <span class="badge open">Moi</span>' : '';
      var cvName = app.cvName || app.cv || 'Chua cap nhat CV';
      var job = state.jobs.find(function (item) {
        return Number(item.id) === Number(app.jobId);
      }) || null;
      var statusMeta = getApplicantStatusMeta(app.status);
      return (
        '<div class="applicant-row">' +
          '<div>' +
            '<div class="activity-name">' + (app.candidateName || 'Ung vien') + unreadTag + '</div>' +
            '<div class="applicant-meta"><i class="fa-solid fa-envelope"></i>Email: ' + (app.email || 'Chua cap nhat') + '</div>' +
            '<div class="applicant-meta"><i class="fa-solid fa-file-lines"></i>CV: ' + cvName + '</div>' +
            '<div class="applicant-meta"><i class="fa-solid fa-briefcase"></i>Ung tuyen job: ' + ((job && job.title) || app.jobTitle || 'Khong ro vi tri') + '</div>' +
            '<div class="applicant-meta"><span class="app-status ' + statusMeta.css + '"><i class="' + statusMeta.icon + '"></i>' + statusMeta.text + '</span></div>' +
            '<div class="applicant-meta"><i class="fa-regular fa-clock"></i>Nop luc: ' + formatDateTime(app.appliedAt) + '</div>' +
          '</div>' +
          '<div class="applicant-actions">' +
            '<button class="btn-xs" data-app-action="view-cv" data-id="' + app.id + '">Xem CV</button>' +
            '<button class="btn-xs" data-app-action="approve" data-id="' + app.id + '">Duyet</button>' +
            '<button class="btn-xs" data-app-action="invite" data-id="' + app.id + '">Gui loi moi</button>' +
            '<button class="btn-xs btn-delete-app" data-app-action="delete" data-id="' + app.id + '">Xoa</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function openApplicantPanel(jobId) { // Hàm để mở bảng điều khiển hiển thị danh sách ứng viên đã nộp hồ sơ cho một công việc cụ thể, nó sẽ nhận vào id của công việc cần hiển thị. Hàm sẽ đặt state.activeJobId thành jobId được truyền vào và tìm kiếm công việc tương ứng trong mảng state.jobs để xác định xem công việc này có thuộc sở hữu của nhà tuyển dụng hiện tại hay không bằng cách sử dụng hàm isOwnedByRecruiter. Nếu công việc không tồn tại hoặc không thuộc sở hữu của nhà tuyển dụng, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu công việc hợp lệ, hàm sẽ gọi getApplicantsForJob để lấy danh sách các ứng viên đã nộp hồ sơ cho công việc này và getApplicantQuotaLabel để lấy thông tin về giới hạn số lượng ứng viên nếu có. Sau đó, hàm sẽ cập nhật tiêu đề của bảng ứng viên để hiển thị tên công việc và giới hạn số lượng ứng viên, đồng thời đặt giá trị của phần tử select để lọc ứng viên theo công việc. Cuối cùng, hàm sẽ gọi renderApplicantList để hiển thị danh sách ứng viên trên giao diện và đặt tiêu điểm vào ô tìm kiếm nếu nó tồn tại
    state.activeJobId = jobId;
    var job = state.jobs.find(function (j) {
      return Number(j.id) === Number(jobId);
    });

    if (!job || !isOwnedByRecruiter(job)) {
      return;
    }

    var list = getApplicantsForJob(jobId);
    var quotaLabel = getApplicantQuotaLabel(job);

    if (el.applicantTitle) {
      el.applicantTitle.textContent = 'Ung vien da nop - ' + job.title + ' (' + quotaLabel + ')';
    }

    if (el.applicantJobSelect) {
      el.applicantJobSelect.value = String(jobId);
    }

    renderApplicantList(list);

    if (el.applicantSearch) {
      setTimeout(function () {
        el.applicantSearch.focus();
      }, 0);
    }
  }

  function filterApplicants() { // Hàm để lọc danh sách ứng viên dựa trên công việc đang được chọn (activeJobId), nó sẽ kiểm tra xem state.activeJobId có được thiết lập hay không. Nếu activeJobId không được thiết lập, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu activeJobId đã được thiết lập, hàm sẽ gọi getApplicantsForJob với activeJobId để lấy danh sách các ứng viên đã nộp hồ sơ cho công việc này và sau đó gọi renderApplicantList để hiển thị danh sách ứng viên đã được lọc trên giao diện
    if (!state.activeJobId) return;

    var list = getApplicantsForJob(state.activeJobId);
    renderApplicantList(list);
  }

  function showCandidateCv(appId) { // Hàm để hiển thị CV của một ứng viên dựa trên appId, nó sẽ nhận vào id của ứng dụng cần hiển thị CV và tìm kiếm ứng dụng này trong mảng state.applications. Nếu không tìm thấy ứng dụng nào có id khớp với appId được truyền vào, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu tìm thấy ứng dụng, hàm sẽ tiếp tục tìm kiếm công việc tương ứng với ứng dụng này bằng cách sử dụng jobId được lưu trong ứng dụng để tìm kiếm trong mảng state.jobs. Sau đó, hàm sẽ gọi openCvModal với thông tin của ứng dụng và tiêu đề công việc (nếu có) để hiển thị CV của ứng viên trên giao diện
    var app = state.applications.find(function (item) {
      return Number(item.id) === Number(appId);
    });
    if (!app) return;

    var job = state.jobs.find(function (item) {
      return Number(item.id) === Number(app.jobId);
    });

    openCvModal(app, job ? job.title : 'Khong ro vi tri');
  }
 
  function applyTopSearch() { // Hàm để áp dụng bộ lọc tìm kiếm hàng đầu dựa trên từ khóa được lưu trong state.topKeyword, nó sẽ kiểm tra xem state.topKeyword có được thiết lập hay không. Nếu topKeyword không được thiết lập, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu topKeyword đã được thiết lập, hàm sẽ gọi
    renderJobTable();
    renderRecentActivities();
  }

  function setVisibleView(view) { // Hàm để hiển thị hoặc ẩn các phần khác nhau của giao diện người dùng dựa trên view được truyền vào, nó sẽ nhận vào một chuỗi view đại diện cho phần cần hiển thị và chuyển đổi nó thành một khóa để xác định phần nào nên được hiển thị. Hàm sẽ kiểm tra giá trị của view và so sánh với các giá trị như 'overview', 'jobs', 'applicants', 'interviews' và 'policy' để xác định phần nào nên được hiển thị. Dựa trên giá trị của view, hàm sẽ điều chỉnh thuộc tính style.display của các phần tử tương ứng trên giao diện để hiển thị phần cần thiết và ẩn các phần còn lại
    var key = String(view || 'overview');
    state.currentView = key;

    var showDashboardBlocks = key === 'overview' || key === 'jobs';

    if (el.statsRow) {
      el.statsRow.style.display = showDashboardBlocks ? 'grid' : 'none';
    }

    if (el.jobsSection) {
      el.jobsSection.style.display = showDashboardBlocks ? 'grid' : 'none';
      if (key === 'jobs') {
        el.jobsSection.style.gridTemplateColumns = '1fr';
      } else {
        el.jobsSection.style.gridTemplateColumns = '2.2fr 1fr';
      }
    }

    if (el.trendPanel) {
      el.trendPanel.style.display = key === 'jobs' ? 'none' : 'block';
    }

    if (el.jobPanel) {
      el.jobPanel.style.gridColumn = key === 'jobs' ? '1 / -1' : 'auto';
    }

    if (el.applicantsSection) {
      el.applicantsSection.style.display = key === 'applicants' ? 'block' : 'none';
    }
    if (el.interviewsSection) {
      el.interviewsSection.style.display = key === 'interviews' ? 'block' : 'none';
    }
    if (el.policySection) {
      el.policySection.style.display = key === 'policy' ? 'block' : 'none';
    }
    if (el.settingsSection) {
      el.settingsSection.style.display = key === 'settings' ? 'block' : 'none';
    }
    if (el.topSearchWrap) {
      el.topSearchWrap.style.display = showDashboardBlocks ? 'block' : 'none';
    }

    updateTopbarByView(key);

    if (key === 'settings') {
      renderSettingsOverview();
    }
  }

  function updateApplicationStatus(appId, nextStatus) { // Hàm để cập nhật trạng thái của một hồ sơ ứng viên dựa trên appId và nextStatus, nó sẽ nhận vào id của ứng dụng cần cập nhật và trạng thái mới mà ứng dụng đó sẽ được chuyển sang. Hàm sẽ kiểm tra xem state.activeJobId đã được thiết lập hay chưa. Nếu activeJobId chưa được thiết lập, hàm sẽ cố gắng tìm một công việc ưu tiên để đặt làm activeJobId bằng cách gọi getPreferredApplicantJob. Nếu không tìm thấy công việc ưu tiên nào, hàm sẽ hiển thị một thông báo lỗi cho người dùng và dừng lại. Nếu activeJobId đã được thiết lập hoặc tìm thấy công việc ưu tiên, hàm sẽ tiếp tục duyệt qua mảng state.applications để tìm ứng dụng có id khớp với appId được truyền vào. Khi tìm thấy ứng dụng, hàm sẽ cập nhật trạng thái của ứng dụng đó thành nextStatus, đặt isNew thành false và cập nhật trường updatedAt với thời gian hiện tại. Sau khi duyệt qua tất cả các ứng dụng, nếu có sự thay đổi nào được thực hiện, hàm sẽ ghi lại sự thay đổi này vào bộ nhớ lưu trữ bằng cách gọi writeCollection, sau đó gọi filterApplicants và updateStats để cập nhật lại giao diện người dùng. Cuối cùng, hàm sẽ hiển thị một thông báo cho biết rằng trạng thái của hồ sơ đã được cập nhật hoặc duyệt thành công tùy thuộc vào giá trị của nextStatus
    if (!state.activeJobId) {
      var preferred = getPreferredApplicantJob();
      if (!preferred) {
        showToast('Chua co job de cap nhat ho so.', 'error');
        return;
      }
      state.activeJobId = preferred.id;
    }

    var targetApplication = state.applications.find(function (item) {
      return Number(item.id) === Number(appId);
    });

    if (!targetApplication) {
      showToast('Khong tim thay ho so ung vien can cap nhat.', 'error');
      return;
    }

    var isApprovingNow = normalize(nextStatus) === 'approved';
    var wasApprovedBefore = normalize(targetApplication.status) === 'approved';

    if (isApprovingNow && !wasApprovedBefore) {
      if (!window.JobModule || typeof window.JobModule.chargeCommissionByJobId !== 'function') {
        showToast('Khong tim thay module tinh phi hoa hong. Vui long tai lai trang.', 'error');
        return;
      }

      var commissionResult = window.JobModule.chargeCommissionByJobId(
        targetApplication.jobId,
        COMMISSION_PER_APPROVED_FEE,
        'Phi hoa hong khi duyet CV ung vien'
      );

      if (!commissionResult || !commissionResult.success) {
        showToast((commissionResult && commissionResult.message) || 'Khong du so du de duyet ho so nay.', 'error');
        return;
      }
    }

    var changed = false;

    state.applications = state.applications.map(function (app) {
      if (Number(app.id) !== Number(appId)) {
        return app;
      }

      changed = true;
      return Object.assign({}, app, {
        status: nextStatus,
        isNew: false,
        updatedAt: new Date().toISOString()
      });
    });

    if (!changed) return;

    writeCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS, state.applications);
    filterApplicants();
    updateStats();

    if (nextStatus === 'approved') {
      showToast('Duyet ho so thanh cong.', 'success');
    } else {
      showToast('Da cap nhat trang thai ho so.', 'info');
    }
  }

  function openInviteModal(appId) { // Hàm để mở modal gửi lời mời phỏng vấn cho một ứng viên dựa trên appId, nó sẽ nhận vào id của ứng dụng cần gửi lời mời và kiểm tra xem state.activeJobId đã được thiết lập hay chưa. Nếu activeJobId chưa được thiết lập, hàm sẽ cố gắng tìm một công việc ưu tiên để đặt làm activeJobId bằng cách gọi getPreferredApplicantJob. Nếu không tìm thấy công việc ưu tiên nào, hàm sẽ hiển thị một thông báo lỗi cho người dùng và dừng lại. Nếu activeJobId đã được thiết lập hoặc tìm thấy công việc ưu tiên, hàm sẽ tiếp tục tìm kiếm ứng dụng có id khớp với appId được truyền vào trong mảng state.applications. Đồng thời, hàm cũng sẽ tìm kiếm công việc tương ứng với activeJobId trong mảng state.jobs. Nếu không tìm thấy ứng dụng hoặc công việc nào phù hợp, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu tìm thấy cả ứng dụng và công việc, hàm sẽ đặt state.inviteAppId thành appId của ứng dụng được chọn, sau đó cập nhật các trường thông tin trong modal như tên ứng viên, tiêu đề công việc, thời gian phỏng vấn và tin nhắn lời mời về mặc định hoặc trống. Cuối cùng, hàm sẽ hiển thị modal gửi lời mời phỏng vấn trên giao diện
    if (!state.activeJobId) {
      var preferred = getPreferredApplicantJob();
      if (!preferred) {
        showToast('Chua co job de gui loi moi phong van.', 'error');
        return;
      }
      state.activeJobId = preferred.id;
    }

    var app = state.applications.find(function (item) {
      return Number(item.id) === Number(appId);
    });

    var job = state.jobs.find(function (j) {
      return Number(j.id) === Number(state.activeJobId);
    });

    if (!app || !job) return;

    state.inviteAppId = appId;
    if (el.inviteCandidate) el.inviteCandidate.value = app.candidateName || 'Ung vien';
    if (el.inviteJob) el.inviteJob.value = job.title;
    if (el.inviteDateTime) el.inviteDateTime.value = '';
    if (el.inviteMessage) el.inviteMessage.value = '';
    setInviteLocationValue('');

    if (el.inviteModalBackdrop) {
      el.inviteModalBackdrop.style.display = 'flex';
    }
  }

  function closeInviteModal() { // Hàm để đóng modal gửi lời mời phỏng vấn, nó sẽ đặt state.inviteAppId thành null để xóa thông tin về ứng dụng đang được gửi lời mời. Sau đó, nếu phần tử el.inviteModalBackdrop tồn tại, hàm sẽ thay đổi thuộc tính style.display của phần tử này thành 'none' để ẩn modal khỏi giao diện người dùng
    state.inviteAppId = null;
    if (el.inviteModalBackdrop) {
      el.inviteModalBackdrop.style.display = 'none';
    }
  }

  function submitInvite() { // Hàm để xử lý việc gửi lời mời phỏng vấn cho một ứng viên, nó sẽ kiểm tra xem state.inviteAppId có được thiết lập hay không. Nếu inviteAppId không được thiết lập, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu inviteAppId đã được thiết lập, hàm sẽ tiếp tục lấy thông tin về thời gian phỏng vấn, địa điểm phỏng vấn và tin nhắn lời mời từ các trường tương ứng trong modal. Hàm sẽ kiểm tra xem thời gian phỏng vấn và địa điểm phỏng vấn có được nhập đầy đủ hay không. Nếu thiếu thông tin nào trong số này, hàm sẽ hiển thị một thông báo lỗi yêu cầu người dùng nhập đầy đủ thông tin và dừng lại. Nếu tất cả thông tin cần thiết đã được nhập, hàm sẽ duyệt qua mảng state.applications để tìm ứng dụng có id khớp với inviteAppId và cập nhật trạng thái của ứng dụng đó thành 'Mời phỏng vấn', đồng thời lưu trữ thông tin về lịch phỏng vấn như ngày giờ, địa điểm và ghi chú vào ứng dụng. Sau khi cập nhật ứng dụng, hàm sẽ thêm một mục mới vào mảng state.interviews để lưu trữ lịch phỏng vấn này. Cuối cùng, hàm sẽ ghi lại sự thay đổi vào bộ nhớ lưu trữ bằng cách gọi writeCollection và writeJson, đóng modal gửi lời mời bằng cách gọi closeInviteModal, lọc lại danh sách ứng viên, cập nhật lại danh sách lịch phỏng vấn, cập nhật thống kê và hoạt động gần đây trên giao diện, và hiển thị một thông báo thành công cho người dùng
    if (!state.inviteAppId) return;

    var interviewDate = el.inviteDateTime ? el.inviteDateTime.value : '';
    var interviewLocation = getInviteLocationValue();
    var note = el.inviteMessage ? String(el.inviteMessage.value || '').trim() : '';

    if (!interviewDate || !interviewLocation) {
      showToast('Vui lòng nhập thời gian và địa điểm phỏng vấn.', 'error');
      return;
    }

    var changed = false;
    state.applications = state.applications.map(function (app) {
      if (Number(app.id) !== Number(state.inviteAppId)) {
        return app;
      }

      changed = true;
      return Object.assign({}, app, {
        status: 'Mời phỏng vấn',
        isNew: false,
        interviewDate: interviewDate,
        interviewLocation: interviewLocation,
        interviewNote: note,
        updatedAt: new Date().toISOString()
      });
    });

    if (!changed) return;

    state.interviews.unshift({
      id: Date.now(),
      applicationId: state.inviteAppId,
      recruiterId: state.recruiter.id,
      interviewDate: interviewDate,
      interviewLocation: interviewLocation,
      interviewNote: note,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    });

    writeCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS, state.applications);
    writeJson(STORAGE.INTERVIEWS, state.interviews);

    closeInviteModal();
    filterApplicants();
    renderInterviewList();
    updateStats();
    renderRecentActivities();
    showToast('Gửi lời mời phỏng vấn thành công.', 'success');
  }

  function updateInterviewStatus(interviewId, nextStatus) { // Hàm để cập nhật trạng thái của một lịch phỏng vấn dựa trên interviewId và nextStatus, nó sẽ nhận vào id của lịch phỏng vấn cần cập nhật và trạng thái mới mà lịch phỏng vấn đó sẽ được chuyển sang. Hàm sẽ duyệt qua mảng state.interviews để tìm lịch phỏng vấn có id khớp với interviewId được truyền vào. Khi tìm thấy lịch phỏng vấn, hàm sẽ cập nhật trạng thái của lịch phỏng vấn đó thành nextStatus và cập nhật trường updatedAt với thời gian hiện tại. Sau khi duyệt qua tất cả các lịch phỏng vấn, nếu có sự thay đổi nào được thực hiện, hàm sẽ ghi lại sự thay đổi này vào bộ nhớ lưu trữ bằng cách gọi writeJson, sau đó gọi renderInterviewList và updateStats để cập nhật lại giao diện người dùng. Cuối cùng, hàm sẽ hiển thị một thông báo cho biết rằng lịch phỏng vấn đã được cập nhật hoặc hủy thành công tùy thuộc vào giá trị của nextStatus
    var changed = false;

    state.interviews = state.interviews.map(function (interview) {
      if (Number(interview.id) !== Number(interviewId)) {
        return interview;
      }

      changed = true;
      return Object.assign({}, interview, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    });

    if (!changed) return;

    writeJson(STORAGE.INTERVIEWS, state.interviews);
    renderInterviewList();
    updateStats();
    showToast(nextStatus === 'done' ? 'Đã cập nhật lịch phỏng vấn.' : 'Đã hủy lịch phỏng vấn.', 'info');
  }

  function deleteInterview(interviewId) { // Hàm để xóa một lịch phỏng vấn dựa trên interviewId, nó sẽ nhận vào id của lịch phỏng vấn cần xóa và tìm kiếm lịch phỏng vấn này trong mảng state.interviews. Nếu không tìm thấy lịch phỏng vấn nào có id khớp với interviewId được truyền vào, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu tìm thấy lịch phỏng vấn, hàm sẽ hiển thị một hộp thoại xác nhận để hỏi người dùng có chắc chắn muốn xóa lịch phỏng vấn này hay không. Nếu người dùng xác nhận xóa, hàm sẽ tiếp tục lọc mảng state.interviews để loại bỏ lịch phỏng vấn có id khớp với interviewId. Sau khi lọc, nếu lịch phỏng vấn đã được xóa thành công, hàm sẽ kiểm tra xem lịch phỏng vấn này có liên quan đến một ứng dụng cụ thể nào không bằng cách kiểm tra trường applicationId của lịch phỏng vấn. Nếu có, hàm sẽ tiếp tục duyệt qua mảng state.applications để tìm ứng dụng có id khớp với applicationId và cập nhật trạng thái của ứng dụng đó nếu trạng thái hiện tại của ứng dụng liên quan đến phỏng vấn. Sau khi cập nhật ứng dụng (nếu cần), hàm sẽ ghi lại sự thay đổi vào bộ nhớ lưu trữ bằng cách gọi writeCollection và writeJson, sau đó cập nhật lại giao diện người dùng bằng cách gọi renderInterviewList, filterApplicants, renderRecentActivities và updateStats. Cuối cùng, hàm sẽ hiển thị một thông báo cho biết rằng lịch phỏng vấn đã được xóa
    var target = state.interviews.find(function (item) {
      return Number(item.id) === Number(interviewId);
    }) || null;
    if (!target) {
      return;
    }

    var ok = window.confirm('Bạn chắc chắn muốn xóa lịch phỏng vấn này?');
    if (!ok) {
      return;
    }

    state.interviews = state.interviews.filter(function (item) {
      return Number(item.id) !== Number(interviewId);
    });

    if (Number(target.applicationId)) {
      state.applications = state.applications.map(function (app) {
        if (Number(app.id) !== Number(target.applicationId)) {
          return app;
        }

        var currentStatus = normalize(app.status);
        var nextStatus = currentStatus.indexOf('phong van') >= 0 || currentStatus.indexOf('interview') >= 0
          ? 'approved'
          : app.status;

        return Object.assign({}, app, {
          status: nextStatus,
          interviewDate: '',
          interviewLocation: '',
          interviewNote: '',
          updatedAt: new Date().toISOString()
        });
      });

      writeCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS, state.applications);
    }

    writeJson(STORAGE.INTERVIEWS, state.interviews);
    renderInterviewList();
    filterApplicants();
    renderRecentActivities();
    updateStats();
    showToast('Đã xóa lịch phỏng vấn.', 'info');
  }

  function renderRecentActivities() { // Hàm để hiển thị các hoạt động gần đây liên quan đến các ứng dụng của nhà tuyển dụng trên giao diện người dùng, nó sẽ kiểm tra xem phần tử el.recentActivityList có tồn tại hay không. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ tiếp tục lấy danh sách id của các công việc thuộc sở hữu của nhà tuyển dụng bằng cách gọi getRecruiterJobs và chuyển đổi kết quả thành một mảng chỉ chứa id của các công việc này. Sau đó, hàm sẽ lọc mảng state.applications để chỉ giữ lại những ứng dụng có jobId nằm trong danh sách id của các công việc thuộc sở hữu của nhà tuyển dụng. Kết quả sau khi lọc sẽ được sắp xếp theo thời gian nộp hồ sơ hoặc cập nhật gần nhất và chỉ giữ lại 6 mục mới nhất. Nếu state.topKeyword được thiết lập, hàm sẽ tiếp tục lọc danh sách này dựa trên từ khóa tìm kiếm trong tên ứng viên, email hoặc trạng thái của ứng dụng. Cuối cùng, nếu không còn hoạt động nào phù hợp sau khi lọc, hàm sẽ hiển thị một thông báo cho biết rằng chưa có hoạt động mới nào. Nếu có hoạt động phù hợp, hàm sẽ xây dựng nội dung HTML cho mỗi hoạt động bao gồm tên ứng viên, trạng thái và thời gian nộp hồ sơ hoặc cập nhật, và chèn nội dung này vào phần tử el.recentActivityList để hiển thị trên giao diện
    if (!el.recentActivityList) return;

    var recruiterJobIds = getRecruiterJobs().map(function (job) { return Number(job.id); });

    var recent = state.applications
      .filter(function (app) {
        return recruiterJobIds.indexOf(Number(app.jobId)) >= 0;
      })
      .slice()
      .sort(function (a, b) {
        return new Date(b.appliedAt || b.updatedAt || 0).getTime() - new Date(a.appliedAt || a.updatedAt || 0).getTime();
      })
      .slice(0, 6);

    if (state.topKeyword) {
      var key = normalize(state.topKeyword);
      recent = recent.filter(function (app) {
        return normalize(app.candidateName).includes(key) || normalize(app.email).includes(key) || normalize(app.status).includes(key);
      });
    }

    if (!recent.length) {
      el.recentActivityList.innerHTML = '<li class="empty-note">Chưa có hoạt động mới.</li>';
      return;
    }

    el.recentActivityList.innerHTML = recent.map(function (item) {
      var text = item.status || 'pending';
      return (
        '<li class="activity-item">' +
          '<div class="activity-name">' + (item.candidateName || 'Ung vien') + '</div>' +
          '<div class="activity-sub">Trang thai: ' + text + '</div>' +
          '<div class="activity-sub">' + formatDateTime(item.appliedAt || item.updatedAt) + '</div>' +
        '</li>'
      );
    }).join('');
  }

  function renderTrendBars() { // Hàm để hiển thị biểu đồ cột thể hiện xu hướng nộp hồ sơ ứng viên theo ngày trong tuần, nó sẽ kiểm tra xem phần tử el.trendBars có tồn tại hay không. Nếu phần tử này không tồn tại, hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ tiếp tục lấy danh sách id của các công việc thuộc sở hữu của nhà tuyển dụng bằng cách gọi getRecruiterJobs và chuyển đổi kết quả thành một mảng chỉ chứa id của các công việc này. Sau đó, hàm sẽ duyệt qua mảng state.applications và đếm số lượng ứng viên đã nộp hồ sơ cho mỗi ngày trong tuần (T2 đến CN) dựa trên trường appliedAt hoặc updatedAt của ứng dụng. Kết quả đếm sẽ được lưu trữ trong mảng vals với chỉ số tương ứng với ngày trong tuần. Sau khi đếm xong, hàm sẽ tìm giá trị lớn nhất trong mảng vals để xác định chiều cao tối đa của các cột trong biểu đồ. Nếu giá trị lớn nhất là 0, hàm sẽ đặt giá trị này thành 1 để tránh lỗi chia cho 0 khi tính toán chiều cao cột. Cuối cùng, hàm sẽ xây dựng nội dung HTML cho biểu đồ cột bằng cách duyệt qua mảng vals và tính toán chiều cao của mỗi cột dựa trên tỷ lệ giữa giá trị của cột và giá trị lớn nhất, sau đó chèn nội dung này vào phần tử el.trendBars để hiển thị trên giao diện
    if (!el.trendBars) return;

    var labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    var vals = [0, 0, 0, 0, 0, 0, 0];

    var recruiterJobIds = getRecruiterJobs().map(function (job) { return Number(job.id); });

    state.applications.forEach(function (app) {
      if (recruiterJobIds.indexOf(Number(app.jobId)) < 0) return;
      var date = new Date(app.appliedAt || app.updatedAt || Date.now());
      if (Number.isNaN(date.getTime())) return;
      var day = date.getDay();
      var idx = day === 0 ? 6 : day - 1;
      vals[idx] += 1;
    });

    var max = Math.max.apply(null, vals);
    if (max <= 0) max = 1;

    el.trendBars.innerHTML = vals.map(function (v, idx) {
      var h = Math.max(18, Math.round((v / max) * 88));
      return (
        '<div class="bar-col">' +
          '<div class="bar" style="height:' + h + 'px"></div>' +
          '<div class="bar-label">' + labels[idx] + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function openCreateModal() { // Hàm để mở modal tạo tin tuyển dụng mới, nó sẽ đặt giá trị của các trường thông tin trong modal như tiêu đề công việc, mức lương, mô tả công việc, địa điểm làm việc, yêu cầu công việc, số lượng ứng viên tối đa và trạng thái nổi bật về mặc định hoặc trống. Sau đó, nếu phần tử el.createModalBackdrop tồn tại, hàm sẽ thay đổi thuộc tính style.display của phần tử này thành 'flex' để hiển thị modal trên giao diện người dùng
    if (el.newJobTitle) el.newJobTitle.value = '';
    if (el.newJobSalary) el.newJobSalary.value = '';
    if (el.newJobDescription) el.newJobDescription.value = '';
    if (el.newJobLocation) el.newJobLocation.value = '';
    if (el.newJobRequirements) el.newJobRequirements.value = '';
    if (el.newJobMaxApplicants) el.newJobMaxApplicants.value = '';
    if (el.newJobFeatured) el.newJobFeatured.checked = false;

    if (el.createModalBackdrop) {
      el.createModalBackdrop.style.display = 'flex';
    }
  }

  function closeCreateModal() { // Hàm để đóng modal tạo tin tuyển dụng mới, nó sẽ đặt giá trị của các trường thông tin trong modal về mặc định hoặc trống. Sau đó, nếu phần tử el.createModalBackdrop tồn tại, hàm sẽ thay đổi thuộc tính style.display của phần tử này thành 'none' để ẩn modal khỏi giao diện người dùng
    if (el.createModalBackdrop) {
      el.createModalBackdrop.style.display = 'none';
    }
  }

  function submitCreateJob() { // Hàm để xử lý việc tạo tin tuyển dụng mới, nó sẽ kiểm tra xem module đăng tin có tồn tại và có hàm createJobFromForm hay không. Nếu không tìm thấy module hoặc hàm này, hàm sẽ hiển thị một thông báo lỗi cho người dùng và dừng lại. Nếu module và hàm tồn tại, hàm sẽ gọi createJobFromForm với thông tin được lấy từ các trường trong modal tạo tin tuyển dụng để tạo một công việc mới. Kết quả trả về từ createJobFromForm sẽ được kiểm tra để xác định xem việc tạo công việc có thành công hay không. Nếu không thành công, hàm sẽ hiển thị một thông báo lỗi với nội dung từ kết quả trả về và dừng lại. Nếu tạo công việc thành công, hàm sẽ cập nhật lại danh sách công việc trong state bằng cách đọc lại từ bộ nhớ lưu trữ, sau đó gọi renderJobTable, populateInterviewJobFilter, renderInterviewList và updateStats để cập nhật lại giao diện người dùng. Cuối cùng, hàm sẽ đóng modal tạo tin tuyển dụng và hiển thị một thông báo thành công cho người dùng
    if (!window.JobModule || typeof window.JobModule.createJobFromForm !== 'function') {
      showToast('Không tìm thấy module đăng tin (job.js).', 'error');
      return;
    }

    var result = window.JobModule.createJobFromForm({
      title: el.newJobTitle ? el.newJobTitle.value : '',
      salary: el.newJobSalary ? el.newJobSalary.value : '',
      description: el.newJobDescription ? el.newJobDescription.value : '',
      location: el.newJobLocation ? el.newJobLocation.value : '',
      requirements: el.newJobRequirements ? el.newJobRequirements.value : '',
      maxApplicants: el.newJobMaxApplicants ? el.newJobMaxApplicants.value : '',
      isFeatured: !!(el.newJobFeatured && el.newJobFeatured.checked),
      recruiter: state.recruiter
    });

    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    state.jobs = readCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS);
    renderJobTable();
    populateInterviewJobFilter();
    renderInterviewList();
    updateStats();
    closeCreateModal();
    showToast('Đăng tin thành công.', 'success');
  }

  function sidebarNavigate(index) { // Hàm để điều hướng giữa các phần khác nhau của giao diện người dùng khi người dùng nhấp vào các liên kết trong thanh bên, nó sẽ nhận vào index của liên kết được nhấp và xác định phần nào nên được hiển thị dựa trên thuộc tính data-view của liên kết đó. Hàm sẽ kiểm tra xem el.menuLinks có tồn tại và có phần tử tại vị trí index hay không để xác định liên kết đang hoạt động. Nếu không tìm thấy liên kết nào phù hợp, hàm sẽ đặt view thành một chuỗi rỗng. Sau đó, hàm sẽ duyệt qua tất cả các liên kết trong el.menuLinks và thêm hoặc loại bỏ lớp 'active' dựa trên việc chỉ số của liên kết có khớp với index được truyền vào hay không. Dựa trên giá trị của view, hàm sẽ gọi các hàm tương ứng để hiển thị phần cần thiết trên giao diện người dùng, ví dụ như openAccountSettingsModal cho phần cài đặt tài khoản, setVisibleView để hiển thị phần tổng quan hoặc công việc, renderInterviewList để hiển thị danh sách lịch phỏng vấn, renderFeePolicyPanel để hiển thị chính sách phí, và cuộn đến phần tương ứng nếu cần thiết
    var activeLink = el.menuLinks && el.menuLinks[index] ? el.menuLinks[index] : null;
    var view = activeLink ? String(activeLink.getAttribute('data-view') || '') : 'overview';

    Array.prototype.forEach.call(el.menuLinks, function (link, idx) {
      link.classList.toggle('active', idx === index);
    });

    setVisibleView(view);

    if ((view === 'overview' || view === 'jobs') && el.topbar) {
      el.topbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (view === 'jobs' && el.jobPanel) {
      el.jobPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (view === 'applicants' && el.applicantsSection) {
      var preferred = null;
      if (el.applicantJobSelect && el.applicantJobSelect.value) {
        preferred = state.jobs.find(function (job) {
          return Number(job.id) === Number(el.applicantJobSelect.value) && isOwnedByRecruiter(job);
        }) || null;
      }

      if (!preferred) {
        preferred = getPreferredApplicantJob();
      }

      if (preferred) {
        openApplicantPanel(preferred.id);
      }

      if (!preferred) {
        showToast('Chưa có ứng viên ứng tuyển cho các tin hiện tại.', 'info');
      }

      el.applicantsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (view === 'interviews' && el.interviewsSection) {
      renderInterviewList();
      el.interviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (view === 'policy' && el.policySection) {
      renderFeePolicyPanel();
      el.policySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (view === 'settings' && el.settingsSection) {
      renderSettingsOverview();
      el.settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function bindEvents() { // Hàm để gán các sự kiện cho các phần tử trên giao diện người dùng, nó sẽ kiểm tra sự tồn tại của các phần tử như el.jobTableBody, el.applicantList, el.interviewList, el.topSearchInput, el.applicantSearch, el.applicantStatusFilter, el.applicantTimeFilter, el.applicantJobSelect, el.interviewSearch, el.interviewJobFilter, el.interviewStatusFilter, el.interviewDateFilter và các nút mở modal như el.btnOpenCreate và el.btnOpenWallet. Nếu các phần tử này tồn tại, hàm sẽ gán các sự kiện tương ứng cho chúng như click hoặc input để xử lý các hành động của người dùng như toggling trạng thái công việc, duyệt hồ sơ ứng viên, cập nhật trạng thái phỏng vấn, áp dụng bộ lọc tìm kiếm và mở hoặc đóng các modal trên giao diện
    if (el.jobTableBody) {
      el.jobTableBody.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-action');
        var id = Number(btn.getAttribute('data-id'));

        if (action === 'toggle-job') {
          toggleJobStatus(id);
        }

        if (action === 'delete-job') {
          deleteJob(id);
        }
      });
    }

    if (el.applicantList) {
      el.applicantList.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-app-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-app-action');
        var id = Number(btn.getAttribute('data-id'));

        if (action === 'approve') {
          updateApplicationStatus(id, 'approved');
        }

        if (action === 'view-cv') {
          showCandidateCv(id);
        }

        if (action === 'invite') {
          openInviteModal(id);
        }

        if (action === 'delete') {
          deleteApplication(id);
        }
      });
    }

    if (el.interviewList) {
      el.interviewList.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-interview-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-interview-action');
        var id = Number(btn.getAttribute('data-id'));

        if (action === 'view-cv') {
          showCandidateCv(id);
        }

        if (action === 'done') {
          updateInterviewStatus(id, 'done');
        }

        if (action === 'canceled') {
          updateInterviewStatus(id, 'canceled');
        }

        if (action === 'delete') {
          deleteInterview(id);
        }
      });
    }

    if (el.topSearchInput) {
      el.topSearchInput.addEventListener('input', function () {
        state.topKeyword = String(el.topSearchInput.value || '').trim();
        applyTopSearch();
      });
    }

    if (el.applicantSearch) {
      el.applicantSearch.addEventListener('input', function () {
        filterApplicants();
      });
    }

    if (el.applicantStatusFilter) {
      el.applicantStatusFilter.addEventListener('change', function () {
        filterApplicants();
      });
    }

    if (el.applicantTimeFilter) {
      el.applicantTimeFilter.addEventListener('change', function () {
        filterApplicants();
      });
    }

    if (el.applicantJobSelect) {
      el.applicantJobSelect.addEventListener('change', function () {
        var jobId = Number(el.applicantJobSelect.value);
        if (jobId) {
          openApplicantPanel(jobId);
        }
      });
    }

    if (el.interviewSearch) {
      el.interviewSearch.addEventListener('input', function () {
        state.interviewKeyword = String(el.interviewSearch.value || '').trim();
        renderInterviewList();
      });
    }

    if (el.interviewJobFilter) {
      el.interviewJobFilter.addEventListener('change', function () {
        state.interviewJobId = String(el.interviewJobFilter.value || 'all');
        renderInterviewList();
      });
    }

    if (el.interviewStatusFilter) {
      el.interviewStatusFilter.addEventListener('change', function () {
        state.interviewStatus = String(el.interviewStatusFilter.value || 'all');
        renderInterviewList();
      });
    }

    if (el.interviewDateFilter) {
      el.interviewDateFilter.addEventListener('change', function () {
        state.interviewDate = String(el.interviewDateFilter.value || 'all');
        renderInterviewList();
      });
    }

    if (el.btnOpenCreate) el.btnOpenCreate.addEventListener('click', openCreateModal);
    if (el.btnOpenWallet) el.btnOpenWallet.addEventListener('click', openWalletModal);
    if (el.btnOpenAccountSettingsInline) el.btnOpenAccountSettingsInline.addEventListener('click', openAccountSettingsModal);
    if (el.btnOpenWalletInline) el.btnOpenWalletInline.addEventListener('click', openWalletModal);
    if (el.createModalClose) el.createModalClose.addEventListener('click', closeCreateModal);
    if (el.createModalCancel) el.createModalCancel.addEventListener('click', closeCreateModal);
    if (el.createModalSave) el.createModalSave.addEventListener('click', submitCreateJob);

    if (el.accountSettingsClose) el.accountSettingsClose.addEventListener('click', closeAccountSettingsModal);
    if (el.accountSettingsCancel) el.accountSettingsCancel.addEventListener('click', closeAccountSettingsModal);
    if (el.accountSettingsSave) el.accountSettingsSave.addEventListener('click', submitAccountSettings);
    if (el.walletModalClose) el.walletModalClose.addEventListener('click', closeWalletModal);
    if (el.walletModalCancel) el.walletModalCancel.addEventListener('click', closeWalletModal);
    if (el.walletModalSave) el.walletModalSave.addEventListener('click', closeWalletModal);
    if (el.btnGenerateQr) el.btnGenerateQr.addEventListener('click', handleGenerateQr);
    if (el.btnCreateDeposit) el.btnCreateDeposit.addEventListener('click', createDepositRequest);
    if (el.depositAmount) {
      el.depositAmount.addEventListener('input', function () {
        var normalized = formatVndInputValue(el.depositAmount.value);
        el.depositAmount.value = normalized;
        updateGenerateQrState();
        if (el.walletStep2 && !el.walletStep2.classList.contains('hidden')) {
          renderWalletQr();
        }
      });
    }
    if (el.inviteModalClose) el.inviteModalClose.addEventListener('click', closeInviteModal);
    if (el.inviteModalCancel) el.inviteModalCancel.addEventListener('click', closeInviteModal);
    if (el.inviteModalSend) el.inviteModalSend.addEventListener('click', submitInvite);

    if (el.createModalBackdrop) {
      el.createModalBackdrop.addEventListener('click', function (event) {
        if (event.target === el.createModalBackdrop) {
          closeCreateModal();
        }
      });
    }

    var recruiterContactSendEl = document.getElementById('recruiterContactSend');
    if (recruiterContactSendEl) {
      recruiterContactSendEl.addEventListener('click', submitAdminContact);
    }

    if (el.inviteModalBackdrop) {
      el.inviteModalBackdrop.addEventListener('click', function (event) {
        if (event.target === el.inviteModalBackdrop) {
          closeInviteModal();
        }
      });
    }

    if (el.walletModalBackdrop) {
      el.walletModalBackdrop.addEventListener('click', function (event) {
        var copyButton = event.target.closest('[data-copy-target]');
        if (copyButton) {
          copyWalletValue(copyButton.getAttribute('data-copy-target'));
          return;
        }

        if (event.target === el.walletModalBackdrop) {
          closeWalletModal();
        }
      });
    }

    if (el.accountSettingsBackdrop) {
      el.accountSettingsBackdrop.addEventListener('click', function (event) {
        if (event.target === el.accountSettingsBackdrop) {
          closeAccountSettingsModal();
        }
      });
    }

    Array.prototype.forEach.call(el.menuLinks, function (link, idx) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        sidebarNavigate(idx);
      });
    });

    if (el.btnLogout) {
      el.btnLogout.addEventListener('click', function () {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
      });
    }

    window.addEventListener('storage', function () {
      state.jobs = readCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS);
      state.applications = readCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS);
      state.interviews = readJson(STORAGE.INTERVIEWS, []);
      renderJobTable();
      populateInterviewJobFilter();
      updateStats();
      renderRecentActivities();
      renderTrendBars();
      renderInterviewList();
    });
  }

  function init() { // Hàm khởi tạo để thiết lập trạng thái ban đầu và hiển thị giao diện người dùng, nó sẽ kiểm tra xem loadState có trả về true hay không để đảm bảo rằng dữ liệu đã được tải thành công trước khi tiếp tục. Nếu loadState trả về false, hàm sẽ dừng lại và không thực hiện gì thêm. Nếu dữ liệu đã được tải thành công, hàm sẽ gọi một loạt các hàm để thiết lập giao diện người dùng như ensureInviteLocationField, ensureCvModal, populateApplicantJobSelect, populateInterviewJobFilter, renderJobTable, updateStats, renderRecentActivities, renderTrendBars, renderInterviewList và updateRecruiterProfileUI để hiển thị thông tin về công việc, ứng viên và lịch phỏng vấn trên giao diện. Cuối cùng, hàm sẽ gọi bindEvents để gán các sự kiện cho các phần tử trên giao diện và gọi setVisibleView với tham số 'overview' để hiển thị phần tổng quan khi trang được tải lần đầu tiên. Ngoài ra, hàm cũng sẽ gọi sidebarNavigate với tham số 0 để điều hướng đến phần đầu tiên của thanh bên
    if (!loadState()) return;

    ensureInviteLocationField();
    ensureCvModal();
    populateApplicantJobSelect();
    populateInterviewJobFilter();
    renderJobTable();
    updateStats();
    renderRecentActivities();
    renderTrendBars();
    renderInterviewList();
    updateRecruiterProfileUI();
    renderSettingsOverview();
    bindEvents();
    setVisibleView('overview');
    sidebarNavigate(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
