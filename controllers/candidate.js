(function () {
  // ==============================
  // Candidate main UI logic
  // UC-1.5 & UC-1.9, UC-1.6, UC-1.8
  // ==============================

  function readJson(key, fallback) { // Hàm tiện ích để đọc dữ liệu JSON từ localStorage với một khóa cụ thể, nếu có lỗi trong quá trình đọc hoặc phân tích JSON, nó sẽ trả về giá trị mặc định được cung cấp. Điều này giúp tránh lỗi khi dữ liệu không tồn tại hoặc bị hỏng, và đảm bảo rằng ứng dụng có thể tiếp tục hoạt động với giá trị mặc định thay vì bị gián đoạn bởi lỗi. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về giá trị fallback
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) { // Hàm tiện ích để ghi dữ liệu JSON vào localStorage với một khóa cụ thể, nó sẽ chuyển đổi giá trị thành chuỗi JSON trước khi lưu. Nếu có lỗi trong quá trình chuyển đổi hoặc lưu dữ liệu, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu, giúp tránh việc lưu dữ liệu
    localStorage.setItem(key, JSON.stringify(value));
  }
  function getAdminContacts() {// Hàm tiện ích để lấy danh sách liên hệ từ admin, đọc dữ liệu từ localStorage với khóa 'ADMIN_CONTACTS', nếu dữ liệu tồn tại và là một mảng, nó sẽ trả về mảng đó, ngược lại sẽ trả về một mảng rỗng. Điều này giúp đảm bảo rằng ứng dụng luôn có một cấu trúc dữ liệu hợp lệ để làm việc khi xử lý các liên hệ từ admin. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về một mảng rỗng
    var items = readJson('ADMIN_CONTACTS', []);
    return Array.isArray(items) ? items : [];
  }

  function saveAdminContacts(items) { // Hàm tiện ích để lưu danh sách liên hệ từ admin vào localStorage, nó sẽ ghi dữ liệu vào localStorage với khóa 'ADMIN_CONTACTS' sau khi chuyển đổi mảng liên hệ thành chuỗi JSON. Nếu có lỗi trong quá trình chuyển đổi hoặc lưu dữ liệu, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu, giúp tránh việc lưu dữ liệu bị hỏng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    writeJson('ADMIN_CONTACTS', items);
  }

  function getCandidateContacts() { // Hàm tiện ích để lấy danh sách liên hệ từ admin dành cho candidate, nó sẽ lọc danh sách liên hệ từ admin dựa trên email của người dùng hiện tại và nguồn liên hệ là 'candidate', giúp candidate chỉ nhận được các liên hệ có liên quan đến họ từ admin. Nếu người dùng chưa đăng nhập hoặc không có email, hàm sẽ trả về một mảng rỗng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về một mảng rỗng
    var contacts = getAdminContacts();
    if (!state.user) {
      return [];
    }

    var email = normalize(state.user.email);
    return contacts.filter(function (contact) {
      return normalize(contact.email) === email && normalize(contact.source) === 'candidate';
    });
  }

  function isCandidateNotificationItem(contact) { // Hàm tiện ích để kiểm tra xem một liên hệ có phải là thông báo dành cho candidate hay không, nó sẽ kiểm tra trạng thái của liên hệ và trả về true nếu trạng thái là 'processing', 'replied' hoặc 'done', ngược lại sẽ trả về false. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về false
    var status = normalize(contact && contact.status);
    return status === 'processing' || status === 'replied' || status === 'done';
  }

  function isCandidateNotificationUnread(contact) { // Hàm tiện ích để kiểm tra xem một thông báo dành cho candidate có chưa được đọc hay không, nó sẽ so sánh thời gian đọc với thời gian cập nhật và trả về true nếu thông báo chưa được đọc, ngược lại sẽ trả về false. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về false
    if (!contact || !isCandidateNotificationItem(contact)) {
      return false;
    }

    var seenAt = new Date(contact.candidateReadAt || 0).getTime();
    var updatedAt = new Date(contact.updatedAt || contact.createdAt || 0).getTime();
    return !seenAt || updatedAt > seenAt;
  }

  function getCandidateNotifications() { // Hàm tiện ích để lấy danh sách thông báo dành cho candidate, nó sẽ lọc danh sách liên hệ từ admin để chỉ lấy các liên hệ có trạng thái phù hợp và sắp xếp chúng theo thời gian cập nhật hoặc tạo mới nhất trước, giúp candidate dễ dàng xem các thông báo mới nhất từ admin. Nếu người dùng chưa đăng nhập hoặc không có email, hàm sẽ trả về một mảng rỗng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về một mảng rỗng
    return getCandidateContacts().filter(isCandidateNotificationItem).slice().sort(function (left, right) {
      return new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime();
    });
  }

  function saveCandidateNotifications(nextContacts) {// Hàm tiện ích để lưu danh sách thông báo dành cho candidate, nó sẽ cập nhật danh sách liên hệ từ admin bằng cách thay thế các liên hệ có cùng email và nguồn 'candidate' với danh sách mới được cung cấp, giúp đảm bảo rằng các thông báo dành cho candidate luôn được cập nhật chính xác trong hệ thống. Nếu người dùng chưa đăng nhập hoặc không có email, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    saveAdminContacts(nextContacts);
  }

  function formatCandidateNotificationLabel(contact) { // Hàm tiện ích để định dạng nhãn cho một thông báo dành cho candidate, nó sẽ dựa trên trạng thái của liên hệ để trả về một chuỗi mô tả phù hợp, giúp candidate dễ dàng hiểu được tình trạng của thông báo từ admin. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về 'Thông báo mới'
    var status = normalize(contact && contact.status);
    if (status === 'processing') return 'Admin đã chuyển xử lý';
    if (status === 'replied') return 'Admin đã phản hồi';
    if (status === 'done') return 'Liên hệ đã xử lý xong';
    return 'Thông báo mới';
  }

  function markCandidateNotificationsRead() { // Hàm tiện ích để đánh dấu tất cả các thông báo dành cho candidate là đã đọc, nó sẽ cập nhật thời gian đọc của tất cả các liên hệ có cùng email và nguồn 'candidate' với thời gian hiện tại, giúp đảm bảo rằng candidate không còn thấy các thông báo cũ là mới nữa. Nếu người dùng chưa đăng nhập hoặc không có email, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return;
    }

    var now = new Date().toISOString();
    var email = normalize(state.user.email);
    var contacts = getAdminContacts().map(function (contact) {
      if (normalize(contact.email) !== email || normalize(contact.source) !== 'candidate') {
        return contact;
      }

      if (!isCandidateNotificationItem(contact)) {
        return contact;
      }

      return Object.assign({}, contact, {
        candidateReadAt: now
      });
    });

    saveCandidateNotifications(contacts);
    updateNotificationBadge();
    renderNotifications();
  }

  function updateNotificationBadge() { // Hàm tiện ích để cập nhật số lượng thông báo chưa đọc trên giao diện, nó sẽ đếm số lượng thông báo dành cho candidate chưa được đọc và cập nhật nội dung và kiểu dáng của phần tử hiển thị số lượng thông báo, giúp candidate dễ dàng nhận biết khi có thông báo mới từ admin. Nếu không có phần tử nào để hiển thị số lượng thông báo, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện cập nhật badge
    var countEl = document.getElementById('candidateNotificationCount');
    var buttonEl = document.getElementById('candidateNotificationBtn');

    if (!countEl || !buttonEl) {
      return;
    }

    var unread = getCandidateNotifications().filter(isCandidateNotificationUnread).length;
    countEl.textContent = '(' + String(unread) + ')';
    buttonEl.style.opacity = unread > 0 ? '1' : '0.95';
  }

  function renderNotifications() { // Hàm tiện ích để hiển thị danh sách thông báo dành cho candidate trên giao diện, nó sẽ lấy danh sách thông báo từ hệ thống, kiểm tra trạng thái đọc của từng thông báo, và xây dựng nội dung HTML để hiển thị các thông báo một cách rõ ràng và dễ hiểu, giúp candidate dễ dàng xem và phân biệt các thông báo mới từ admin. Nếu không có phần tử nào để hiển thị thông báo, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện render thông báo
    var listEl = document.getElementById('notificationList');
    if (!listEl) {
      return;
    }

    var notifications = getCandidateNotifications();
    if (!notifications.length) {
      listEl.innerHTML = '<div class="empty-note">Chưa có thông báo mới từ admin.</div>';
      return;
    }

    listEl.innerHTML = notifications.map(function (contact) {
      var unread = isCandidateNotificationUnread(contact);
      var note = String(contact.adminNote || contact.replyNote || contact.content || '').trim();
      return (
        '<div style="border:1px solid #dbe3f2;border-radius:10px;padding:10px;background:' + (unread ? '#eff6ff' : '#fff') + ';">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">' +
            '<div>' +
              '<div style="font-weight:700;color:#1f3563;">' + escapeHtml(contact.title || 'Thông báo') + '</div>' +
              '<div style="font-size:12px;color:#64748b;margin-top:2px;">' + escapeHtml(formatCandidateNotificationLabel(contact)) + ' • ' + escapeHtml(formatDateTime(contact.updatedAt || contact.createdAt)) + '</div>' +
            '</div>' +
            (unread ? '<span style="font-size:11px;font-weight:700;color:#1d4ed8;background:#dbeafe;border:1px solid #bfdbfe;border-radius:999px;padding:3px 8px;">Mới</span>' : '') +
          '</div>' +
          '<div style="margin-top:8px;font-size:13px;color:#334155;line-height:1.45;">' + escapeHtml(note) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function openNotificationsModal() { //  Hàm tiện ích để mở modal hiển thị thông báo dành cho candidate, nó sẽ hiển thị modal và gọi hàm renderNotifications để đảm bảo rằng các thông báo được cập nhật và hiển thị chính xác, giúp candidate dễ dàng xem các thông báo mới từ admin. Nếu không có phần tử nào để hiển thị modal, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện mở modal
    var backdrop = document.getElementById('notificationBackdrop');
    if (!backdrop) {
      return;
    }

    renderNotifications();
    backdrop.style.display = 'flex';
    markCandidateNotificationsRead();
  }

  function closeNotificationsModal() { // Hàm tiện ích để đóng modal hiển thị thông báo dành cho candidate, nó sẽ ẩn modal khỏi giao diện, giúp candidate có thể quay lại các hoạt động khác sau khi xem thông báo từ admin. Nếu không có phần tử nào để hiển thị modal, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện đóng modal
    var backdrop = document.getElementById('notificationBackdrop');
    if (!backdrop) {
      return;
    }

    backdrop.style.display = 'none';
  }

  function submitAdminContact(sourceRole, sourceName) { // Hàm tiện ích để gửi một liên hệ từ candidate đến admin, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa, thu thập thông tin tiêu đề và nội dung từ các trường nhập liệu, tạo một đối tượng liên hệ mới với thông tin đó và thêm vào danh sách liên hệ của admin, giúp candidate có thể dễ dàng gửi yêu cầu hoặc phản hồi đến admin. Nếu người dùng chưa đăng nhập, hàm sẽ hiển thị thông báo yêu cầu đăng nhập và không thực hiện gì. Nếu không có phần tử nào để thu thập thông tin tiêu đề và nội dung, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      alert('Vui lòng đăng nhập để gửi liên hệ.');
      return;
    }

    var titleEl = document.getElementById('candidateContactTitle');
    var contentEl = document.getElementById('candidateContactContent');
    if (!titleEl || !contentEl) {
      return;
    }

    var title = String(titleEl.value || '').trim();
    var content = String(contentEl.value || '').trim();
    if (!title || !content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung liên hệ.');
      return;
    }

    var contacts = getAdminContacts();
    var nextId = contacts.reduce(function (max, item) {
      return Math.max(max, Number(item.id) || 0);
    }, 0) + 1;

    contacts.unshift({
      id: nextId,
      fullName: state.user.name || sourceName || 'Candidate',
      email: state.user.email || '',
      role: sourceRole,
      source: 'candidate',
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
    alert('Đã gửi liên hệ tới admin.');
  }
  function readCollection(sharedKey, legacyKey) { // Hàm tiện ích để đọc một bộ sưu tập từ localStorage, nó sẽ kiểm tra xem có dữ liệu trong khóa chia sẻ không, nếu có thì trả về dữ liệu đó, nếu không thì sẽ kiểm tra khóa cũ và chuyển dữ liệu sang khóa mới. Nếu cả hai khóa đều không có dữ liệu, hàm sẽ trả về một mảng rỗng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và trả về mảng rỗng
    var shared = readJson(sharedKey, []);
    var legacy = readJson(legacyKey, []);

    if (Array.isArray(shared) && shared.length) {
      if (Array.isArray(legacy) && legacy.length !== shared.length) {
        writeJson(legacyKey, shared);
      }
      return shared;
    }

    if (Array.isArray(legacy) && legacy.length) {
      writeJson(sharedKey, legacy);
      return legacy;
    }

    return [];
  }

  function writeCollection(sharedKey, legacyKey, value) {// Hàm tiện ích để ghi một bộ sưu tập vào localStorage, nó sẽ ghi dữ liệu vào cả khóa chia sẻ và khóa cũ để đảm bảo tính nhất quán của dữ liệu trong hệ thống. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu  
    writeJson(sharedKey, value);
    writeJson(legacyKey, value);
  }

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function escapeHtml(text) { // Hàm tiện ích để thoát các ký tự đặc biệt trong một chuỗi văn bản để tránh lỗi khi hiển thị trên giao diện, nó sẽ thay thế các ký tự như &, <, >, ", ' bằng các thực thể HTML tương ứng, giúp đảm bảo rằng nội dung được hiển thị an
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentUser() {// Hàm tiện ích để lấy thông tin người dùng hiện tại từ sessionStorage hoặc localStorage, nó sẽ cố gắng đọc dữ liệu từ sessionStorage trước, nếu không có thì sẽ đọc từ localStorage, và trả về đối tượng người dùng đã được phân tích từ JSON. Nếu có lỗi trong quá trình đọc hoặc phân tích JSON, hàm sẽ trả về null. Điều này giúp đảm bảo rằng ứng dụng có thể lấy thông tin người dùng một cách an toàn mà không bị gián đoạn bởi lỗi khi dữ liệu không tồn tại hoặc bị hỏng. Nếu localStorage và sessionStorage đều không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về null
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

  function getStoredUsers() {// Hàm tiện ích để lấy danh sách người dùng đã lưu trong hệ thống, nó sẽ đọc dữ liệu từ localStorage với khóa 'users' và trả về một mảng người dùng nếu dữ liệu tồn tại và có định dạng đúng, ngược lại sẽ trả về một mảng rỗng. Điều này giúp đảm bảo rằng ứng dụng luôn có một cấu trúc dữ liệu hợp lệ để làm việc khi xử lý thông tin người dùng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và trả về một mảng rỗng
    var users = readJson('users', []);
    return Array.isArray(users) ? users : [];
  }

  function getStoredUserRecord() { // Hàm tiện ích để lấy thông tin người dùng hiện tại từ danh sách người dùng đã lưu, nó sẽ so sánh thông tin người dùng hiện tại với danh sách người dùng đã lưu để tìm ra bản ghi phù hợp, giúp đảm bảo rằng ứng dụng có thể lấy thông tin chi tiết của người dùng hiện tại một cách chính xác. Nếu người dùng chưa đăng nhập hoặc không có email, hàm sẽ trả về null. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và trả về null
    if (!state.user) {
      return null;
    }

    return state.users.find(function (item) {// So sánh người dùng hiện tại với danh sách người dùng đã lưu để tìm ra bản ghi phù hợp, nó sẽ so sánh cả email và vai trò của người dùng để đảm bảo tính chính xác khi lấy thông tin người dùng hiện tại. Nếu có lỗi trong quá trình truy cập dữ liệu, hàm sẽ trả về null
      return Number(item.id) === Number(state.user.id) && normalize(item.role) === normalize(state.user.role);
    }) || null;
  }

  function persistLoggedInUser(updatedUser) {// Hàm tiện ích để lưu thông tin người dùng đã đăng nhập vào localStorage và sessionStorage, nó sẽ cập nhật thông tin người dùng hiện tại trong trạng thái ứng dụng và lưu thông tin đó vào cả localStorage và sessionStorage để đảm bảo rằng thông tin người dùng được duy trì ngay cả khi trang được tải lại hoặc khi người dùng mở nhiều tab. Nếu localStorage và sessionStorage đều không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    state.user = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
  function getJobCollection() { //  Hàm tiện ích để lấy danh sách tin đăng công việc từ hệ thống, nó sẽ đọc dữ liệu từ localStorage với khóa 'JOBS_DATA' và trả về một mảng tin đăng nếu dữ liệu tồn tại và có định dạng đúng, ngược lại sẽ trả về một mảng rỗng. Điều này giúp đảm bảo rằng ứng dụng luôn có một cấu trúc dữ liệu hợp lệ để làm việc khi xử lý thông tin tin đăng công việc. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và trả về một mảng rỗng
    return readCollection('JOBS_DATA', 'jobs');
  }

  function getApplicationCollection() {// Hàm tiện ích để lấy danh sách đơn ứng tuyển từ hệ thống, nó sẽ đọc dữ liệu từ localStorage với khóa 'APPLICATIONS_DATA' và trả về một mảng đơn ứng tuyển nếu dữ liệu tồn tại và có định dạng đúng, ngược lại sẽ trả về một mảng rỗng. Điều này giúp đảm bảo rằng ứng dụng luôn có một cấu trúc dữ liệu hợp lệ để làm việc khi xử lý thông tin đơn ứng tuyển. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và trả về một mảng rỗng
    return readCollection('APPLICATIONS_DATA', 'applications');
  }

  function buildAvatarFromName(name) {// Hàm tiện ích để xây dựng chuỗi đại diện từ tên của người dùng, nó sẽ lấy hai ký tự đầu tiên của tên, chuyển chúng thành chữ hoa và trả về chuỗi đó. Nếu tên không hợp lệ hoặc không có ký tự nào, hàm sẽ trả về 'NA' để đại diện cho "Not Available". Điều này giúp đảm bảo rằng ứng dụng luôn có một chuỗi đại diện hợp lệ để hiển thị khi thông tin tên không đầy đủ hoặc không hợp lệ. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ trả về 'NA'
    var value = String(name || '').trim();
    return value ? value.slice(0, 2).toUpperCase() : 'NA';
  }

  var state = {
    jobs: [],
    applications: [],
    interviews: [],
    savedJobs: [],
    cvs: [],
    users: [],
    selectedJob: null,
    user: null
  };

  // DOM refs
  var jobListEl = document.getElementById('jobList');
  var searchInputEl = document.getElementById('searchInput');
  var filterEl = document.getElementById('jobFilter');
  var appliedCountEl = document.getElementById('appliedCount');
  var savedCountEl = document.getElementById('savedCount');
  var interviewCountEl = document.getElementById('interviewCount');
  var timelineEl = document.getElementById('timeline');
  var historyListEl = document.getElementById('historyList');
  var historySearchInputEl = document.getElementById('historySearchInput');
  var historyDateFilterEl = document.getElementById('historyDateFilter');
  var favoriteListEl = document.getElementById('favoriteList');
  var cvListEl = document.getElementById('cvList');
  var candidateContactSendEl = document.getElementById('candidateContactSend');

  var menuLinks = document.querySelectorAll('.menu a[data-view]');
  var viewSections = document.querySelectorAll('.view-section');

  var sidebarNameEl = document.getElementById('sidebarUserName');
  var sidebarAvatarEl = document.getElementById('sidebarAvatar');
  var headerNameEl = document.getElementById('headerUserName');

  var modalBackdropEl = document.getElementById('applyModalBackdrop');
  var modalCloseEl = document.getElementById('applyModalClose');
  var modalCancelEl = document.getElementById('applyCancelBtn');
  var modalConfirmEl = document.getElementById('applyConfirmBtn');
  var modalJobTitleEl = document.getElementById('applyJobTitle');
  var modalCvSelectEl = document.getElementById('applyCvSelect');
  var modalMessageEl = document.getElementById('applyMessage');
  var jobDetailBackdropEl = document.getElementById('jobDetailBackdrop');
  var jobDetailCloseEl = document.getElementById('jobDetailClose');
  var jobDetailCloseBtnEl = document.getElementById('jobDetailCloseBtn');
  var jobDetailApplyBtnEl = document.getElementById('jobDetailApplyBtn');
  var jobDetailNameEl = document.getElementById('jobDetailName');
  var jobDetailCompanyEl = document.getElementById('jobDetailCompany');
  var jobDetailSalaryEl = document.getElementById('jobDetailSalary');
  var jobDetailLocationEl = document.getElementById('jobDetailLocation');
  var jobDetailRequirementsEl = document.getElementById('jobDetailRequirements');
  var jobDetailMaxApplicantsEl = document.getElementById('jobDetailMaxApplicants');
  var jobDetailTypeEl = document.getElementById('jobDetailType');
  var jobDetailStatusEl = document.getElementById('jobDetailStatus');
  var jobDetailPostedDateEl = document.getElementById('jobDetailPostedDate');
  var jobDetailDescriptionEl = document.getElementById('jobDetailDescription');
  var recruiterFeedbackBackdropEl = document.getElementById('recruiterFeedbackBackdrop');
  var recruiterFeedbackCloseEl = document.getElementById('recruiterFeedbackClose');
  var recruiterFeedbackCloseBtnEl = document.getElementById('recruiterFeedbackCloseBtn');
  var recruiterFeedbackApplyBtnEl = document.getElementById('recruiterFeedbackApplyBtn');
  var feedbackJobNameEl = document.getElementById('feedbackJobName');
  var feedbackCompanyEl = document.getElementById('feedbackCompany');
  var feedbackStatusEl = document.getElementById('feedbackStatus');
  var feedbackMessageEl = document.getElementById('feedbackMessage');
  var feedbackInterviewEl = document.getElementById('feedbackInterview');
  var feedbackUpdatedAtEl = document.getElementById('feedbackUpdatedAt');

  var cvPreviewBackdropEl = document.getElementById('cvPreviewBackdrop');
  var cvPreviewCloseEl = document.getElementById('cvPreviewClose');
  var cvPreviewCloseBtnEl = document.getElementById('cvPreviewCloseBtn');
  var cvPreviewDownloadBtnEl = document.getElementById('cvPreviewDownloadBtn');
  var cvPreviewNameEl = document.getElementById('cvPreviewName');
  var cvPreviewCandidateEl = document.getElementById('cvPreviewCandidate');
  var cvPreviewPositionEl = document.getElementById('cvPreviewPosition');
  var cvPreviewSkillsEl = document.getElementById('cvPreviewSkills');
  var cvPreviewSummaryEl = document.getElementById('cvPreviewSummary');
  var cvPreviewUpdatedEl = document.getElementById('cvPreviewUpdated');
  var cvEditBackdropEl = document.getElementById('cvEditBackdrop');
  var cvEditCloseEl = document.getElementById('cvEditClose');
  var cvEditCancelEl = document.getElementById('cvEditCancel');
  var cvEditSaveEl = document.getElementById('cvEditSave');
  var cvEditNameEl = document.getElementById('cvEditName');
  var cvEditPositionEl = document.getElementById('cvEditPosition');
  var cvEditSkillsEl = document.getElementById('cvEditSkills');
  var cvEditSummaryEl = document.getElementById('cvEditSummary');
  var accountSettingsBackdropEl = document.getElementById('accountSettingsBackdrop');
  var accountSettingsCloseEl = document.getElementById('accountSettingsClose');
  var accountSettingsCancelEl = document.getElementById('accountSettingsCancel');
  var accountSettingsSaveEl = document.getElementById('accountSettingsSave');
  var accountNameEl = document.getElementById('accountName');
  var accountEmailEl = document.getElementById('accountEmail');
  var accountPhoneEl = document.getElementById('accountPhone');
  var accountCurrentPasswordEl = document.getElementById('accountCurrentPassword');
  var accountNewPasswordEl = document.getElementById('accountNewPassword');
  var accountConfirmPasswordEl = document.getElementById('accountConfirmPassword');

  var activePreviewCvId = null;
  var activeEditCvId = null;

  var cvTotalStatEl = document.getElementById('cvTotalStat');
  var cvDefaultStatEl = document.getElementById('cvDefaultStat');
  var cvLatestStatEl = document.getElementById('cvLatestStat');

  function loadState() { // Hàm tiện ích để tải dữ liệu ban đầu vào trạng thái ứng dụng, nó sẽ đọc danh sách người dùng, tin đăng công việc, đơn ứng tuyển, lịch phỏng vấn, công việc đã lưu và CV từ localStorage hoặc các nguồn dữ liệu tương ứng và lưu chúng vào trạng thái của ứng dụng. Hàm cũng sẽ cố gắng lấy thông tin người dùng hiện tại từ trạng thái hoặc từ localStorage để đảm bảo rằng ứng dụng có thể xác định được người dùng đang sử dụng và hiển thị thông tin phù hợp. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    state.users = getStoredUsers();
    state.jobs = getJobCollection();
    syncMissingJobViews();
    state.applications = getApplicationCollection();
    state.interviews = readJson('interviews', []);
    state.savedJobs = readJson('savedJobs', []);
    state.cvs = readJson('candidateCVs', []);
    state.user = getCurrentUser();

    if (!state.user || state.user.role !== 'candidate') {
      state.user = readJson('currentUser', null);
    }
  }

  function getUserApplications() { // Hàm tiện ích để lấy danh sách đơn ứng tuyển của người dùng hiện tại, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa và nếu đã đăng nhập, nó sẽ lọc danh sách đơn ứng tuyển trong trạng thái ứng dụng để chỉ trả về những đơn ứng tuyển có candidateId khớp với ID của người dùng hiện tại. Điều này giúp đảm bảo rằng người dùng chỉ thấy các đơn ứng tuyển mà họ đã nộp và không bị lẫn với các đơn ứng tuyển của người dùng khác. Nếu người dùng chưa đăng nhập, hàm sẽ trả về một mảng rỗng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return [];
    }
    return state.applications.filter(function (a) {
      return Number(a.candidateId) === Number(state.user.id);
    });
  }

  function getSavedForUser() { // Hàm tiện ích để lấy danh sách công việc đã lưu của người dùng hiện tại, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa và nếu đã đăng nhập, nó sẽ lọc danh sách công việc đã lưu trong trạng thái ứng dụng để chỉ trả về những công việc có userId khớp với ID của người dùng hiện tại. Điều này giúp đảm bảo rằng người dùng chỉ thấy các công việc mà họ đã lưu và không bị lẫn với các công việc đã lưu của người dùng khác. Nếu người dùng chưa đăng nhập, hàm sẽ trả về một mảng rỗng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return [];
    }
    return state.savedJobs.filter(function (item) {
      return Number(item.userId) === Number(state.user.id);
    });
  }

  function updateStats() { // Hàm tiện ích để cập nhật các thống kê liên quan đến người dùng hiện tại, nó sẽ lấy danh sách đơn ứng tuyển và công việc đã lưu của người dùng, sau đó tính toán số lượng đơn ứng tuyển đang trong trạng thái phỏng vấn dựa trên cả trạng thái của đơn ứng tuyển và lịch phỏng vấn, giúp người dùng có cái nhìn tổng quan về quá trình ứng tuyển của họ. Cuối cùng, hàm sẽ cập nhật nội dung của các phần tử hiển thị số lượng đơn ứng tuyển, công việc đã lưu và phỏng vấn trên giao diện để phản ánh thông tin mới nhất. Nếu không có phần tử nào để hiển thị thống kê, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var userApplications = getUserApplications();
    var userSaved = getSavedForUser();
    var interviewByStatus = userApplications.filter(function (app) {
      var st = normalize(app.status);
      return st.indexOf('phong van') >= 0 || st.indexOf('interview') >= 0;
    }).length;

    var appIds = userApplications.map(function (app) { return Number(app.id); });
    var interviewBySchedule = state.interviews.filter(function (itv) {
      return appIds.indexOf(Number(itv.applicationId)) >= 0;
    }).length;

    var interviewCount = Math.max(interviewByStatus, interviewBySchedule);

    appliedCountEl.textContent = String(userApplications.length);
    savedCountEl.textContent = String(userSaved.length);
    if (interviewCountEl) {
      interviewCountEl.textContent = String(interviewCount);
    }
  }

  function formatDateTime(value) { // Hàm tiện ích để định dạng một giá trị thời gian thành một chuỗi hiển thị theo định dạng ngày giờ của Việt Nam, nó sẽ kiểm tra xem giá trị đầu vào có hợp lệ hay không và nếu hợp lệ, nó sẽ tạo một đối tượng Date từ giá trị đó và sử dụng phương thức toLocaleString với tham số 'vi-VN' để định dạng ngày giờ theo phong cách của Việt Nam. Nếu giá trị đầu vào không hợp lệ hoặc không thể chuyển đổi thành một đối tượng Date, hàm sẽ trả về một chuỗi thông báo lỗi. Điều này giúp đảm bảo rằng tất cả các hiển thị thời gian trong ứng dụng đều nhất quán và dễ hiểu đối với người dùng Việt Nam. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!value) {
      return 'Khong ro thoi gian';
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Khong ro thoi gian';
    }
    return date.toLocaleString('vi-VN');
  }

  function updateUserInfoUI() { //  Hàm tiện ích để cập nhật thông tin người dùng trên giao diện, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa và nếu đã đăng nhập, nó sẽ lấy thông tin người dùng từ trạng thái hoặc từ localStorage, sau đó xây dựng tên hiển thị và avatar dựa trên thông tin đó. Hàm sẽ cập nhật nội dung của các phần tử hiển thị tên và avatar của người dùng trên thanh bên và tiêu đề để phản ánh thông tin mới nhất. Nếu người dùng chưa đăng nhập, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return;
    }

    var storedUser = getStoredUserRecord() || state.user;
    var name = storedUser.name || storedUser.email || 'Candidate User';
    var avatar = storedUser.avatar || buildAvatarFromName(name);

    if (sidebarNameEl) {
      sidebarNameEl.textContent = name;
    }

    if (sidebarAvatarEl) {
      sidebarAvatarEl.textContent = avatar;
    }

    if (headerNameEl) {
      headerNameEl.textContent = 'Xin chao, ' + name;
    }
  }

  function openAccountSettingsModal() { // Hàm tiện ích để mở modal cài đặt tài khoản, nó sẽ kiểm tra xem phần tử chứa modal và người dùng đã đăng nhập hay chưa, nếu có, nó sẽ lấy thông tin người dùng từ trạng thái hoặc từ localStorage và điền vào các trường tương ứng trong modal để người dùng có thể xem và chỉnh sửa thông tin của mình. Sau đó, hàm sẽ hiển thị modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex'. Nếu phần tử chứa modal không tồn tại hoặc người dùng chưa đăng nhập, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!accountSettingsBackdropEl || !state.user) {
      return;
    }

    var storedUser = getStoredUserRecord() || state.user;
    if (accountNameEl) accountNameEl.value = storedUser.name || '';
    if (accountEmailEl) accountEmailEl.value = storedUser.email || '';
    if (accountPhoneEl) accountPhoneEl.value = storedUser.phone || '';
    if (accountCurrentPasswordEl) accountCurrentPasswordEl.value = '';
    if (accountNewPasswordEl) accountNewPasswordEl.value = '';
    if (accountConfirmPasswordEl) accountConfirmPasswordEl.value = '';

    accountSettingsBackdropEl.style.display = 'flex';
  }

  function closeAccountSettingsModal() { // Hàm tiện ích để đóng modal cài đặt tài khoản, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none'. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!accountSettingsBackdropEl) {
      return;
    }

    accountSettingsBackdropEl.style.display = 'none';
  }

  function submitAccountSettings() { // Hàm tiện ích để xử lý việc lưu cài đặt tài khoản, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa và nếu đã đăng nhập, nó sẽ lấy thông tin mới từ các trường trong modal, kiểm tra tính hợp lệ của thông tin (như tên và email không được để trống, mật khẩu mới phải khớp với xác nhận mật khẩu, mật khẩu hiện tại phải đúng nếu có thay đổi mật khẩu), sau đó cập nhật thông tin người dùng trong trạng thái ứng dụng và lưu vào localStorage. Cuối cùng, hàm sẽ cập nhật giao diện với thông tin mới và đóng modal. Nếu người dùng chưa đăng nhập hoặc phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return;
    }

    var storedUser = getStoredUserRecord() || {};
    var nextName = accountNameEl ? String(accountNameEl.value || '').trim() : '';
    var nextEmail = accountEmailEl ? String(accountEmailEl.value || '').trim() : '';
    var nextPhone = accountPhoneEl ? String(accountPhoneEl.value || '').trim() : '';
    var currentPassword = accountCurrentPasswordEl ? String(accountCurrentPasswordEl.value || '').trim() : '';
    var newPassword = accountNewPasswordEl ? String(accountNewPasswordEl.value || '').trim() : '';
    var confirmPassword = accountConfirmPasswordEl ? String(accountConfirmPasswordEl.value || '').trim() : '';

    if (!nextName || !nextEmail) {
      alert('Vui lòng nhập họ tên và email.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword && storedUser.password && currentPassword !== storedUser.password) {
      alert('Mật khẩu hiện tại không đúng.');
      return;
    }

    var updatedUser = Object.assign({}, storedUser, {
      id: state.user.id,
      role: state.user.role,
      name: nextName,
      email: nextEmail,
      phone: nextPhone || storedUser.phone || '',
      avatar: buildAvatarFromName(nextName)
    });

    if (newPassword) {
      updatedUser.password = newPassword;
    }

    var replaced = false;
    state.users = state.users.map(function (item) {
      if (Number(item.id) === Number(updatedUser.id) && normalize(item.role) === normalize(updatedUser.role)) {
        replaced = true;
        return updatedUser;
      }
      return item;
    });

    if (!replaced) {
      state.users.push(updatedUser);
    }

    writeJson('users', state.users);
    persistLoggedInUser(updatedUser);
    updateUserInfoUI();
    closeAccountSettingsModal();
    alert('Đã cập nhật cài đặt tài khoản.');
  }

  function isFavorite(jobId) { // Hàm tiện ích để kiểm tra xem một công việc có phải là công việc yêu thích của người dùng hiện tại hay không, nó sẽ lấy danh sách công việc đã lưu của người dùng và kiểm tra xem có công việc nào trong danh sách đó có jobId khớp với jobId được truyền vào hay không. Nếu tìm thấy một công việc có jobId khớp, hàm sẽ trả về true, ngược lại sẽ trả về false. Điều này giúp xác định xem người dùng đã đánh dấu một công việc cụ thể là yêu thích hay chưa, từ đó có thể hiển thị trạng thái yêu thích trên giao diện một cách chính xác. Nếu người dùng chưa đăng nhập hoặc localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var userSaved = getSavedForUser();
    return userSaved.some(function (item) {
      return Number(item.jobId) === Number(jobId);
    });
  }

  function getJobTechTags(job) { // Hàm tiện ích để trích xuất các thẻ công nghệ từ thông tin của một công việc, nó sẽ kết hợp tiêu đề, mô tả và loại công việc thành một chuỗi duy nhất, sau đó so sánh chuỗi này với một từ điển các từ khóa công nghệ phổ biến để xác định những thẻ nào phù hợp với công việc đó. Nếu tìm thấy các từ khóa phù hợp, hàm sẽ trả về một mảng chứa các nhãn tương ứng với những thẻ đó. Nếu không tìm thấy thẻ nào phù hợp, hàm sẽ trả về một mảng mặc định với các thẻ chung như 'Remote', 'Teamwork', 'Fast Growth'. Cuối cùng, hàm sẽ giới hạn số lượng thẻ trả về tối đa là 6 để đảm bảo rằng giao diện hiển thị gọn gàng và dễ đọc. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var source = [job.title, job.description, job.type].join(' ').toLowerCase();
    var dictionary = [
      { key: 'react', label: 'ReactJS' },
      { key: 'node', label: 'Node.js' },
      { key: 'python', label: 'Python' },
      { key: 'ai', label: 'AI/ML' },
      { key: 'data', label: 'Data Science' },
      { key: 'sql', label: 'PostgreSQL' },
      { key: 'ui', label: 'UI/UX' },
      { key: 'design', label: 'Design' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'devops', label: 'DevOps' }
    ];

    var tags = dictionary.filter(function (item) {
      return source.indexOf(item.key) >= 0;
    }).map(function (item) {
      return item.label;
    });

    if (!tags.length) {
      tags = ['Remote', 'Teamwork', 'Fast Growth'];
    }

    return tags.slice(0, 6);
  }

  function getSeededJobViewCount(job) {
    return 120 + (Number(job && job.id) || 0) * 11;
  }

  function getJobViewCount(job) {
    var raw = Number(job && job.views);
    if (Number.isFinite(raw) && raw > 0) {
      return Math.floor(raw);
    }
    return getSeededJobViewCount(job);
  }

  function syncMissingJobViews() {
    var changed = false;

    state.jobs = state.jobs.map(function (job) {
      var raw = Number(job && job.views);
      if (Number.isFinite(raw) && raw > 0) {
        return job;
      }
      changed = true;
      return Object.assign({}, job, { views: getSeededJobViewCount(job) });
    });

    if (changed) {
      writeCollection('JOBS_DATA', 'jobs', state.jobs);
    }
  }

  function increaseJobViewCount(jobId) {
    var targetId = Number(jobId);
    if (!targetId) {
      return null;
    }

    var updatedJob = null;
    state.jobs = state.jobs.map(function (job) {
      if (Number(job.id) !== targetId) {
        return job;
      }

      var nextViews = getJobViewCount(job) + 1;
      updatedJob = Object.assign({}, job, { views: nextViews });
      return updatedJob;
    });

    if (updatedJob) {
      writeCollection('JOBS_DATA', 'jobs', state.jobs);
    }

    return updatedJob;
  }

  function getApplicationCountForJob(jobId) { // Hàm tiện ích để đếm số lượng đơn ứng tuyển đã nộp cho một công việc cụ thể, nó sẽ lọc danh sách đơn ứng tuyển trong trạng thái ứng dụng để chỉ tính những đơn ứng tuyển có jobId khớp với jobId được truyền vào, sau đó trả về số lượng đơn ứng tuyển đó. Điều này giúp xác định mức độ quan tâm của ứng viên đối với một công việc cụ thể và có thể được sử dụng để hiển thị thông tin về số lượng ứng viên đã nộp cho công việc đó trên giao diện. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    return state.applications.filter(function (item) {
      return Number(item.jobId) === Number(jobId);
    }).length;
  }

  function getJobApplicantLimit(job) { // Hàm tiện ích để lấy giới hạn số lượng ứng viên cho một công việc cụ thể, nó sẽ kiểm tra các thuộc tính khác nhau trong đối tượng công việc như maxApplicants hoặc applicantLimit để xác định giới hạn này. Nếu giá trị được tìm thấy là một số hợp lệ và lớn hơn 0, hàm sẽ trả về giá trị đó sau khi làm tròn xuống. Nếu không tìm thấy giá trị hợp lệ hoặc giá trị đó không lớn hơn 0, hàm sẽ trả về 0, có nghĩa là không có giới hạn về số lượng ứng viên cho công việc đó. Điều này giúp quản lý số lượng ứng viên mà một công việc có thể nhận được và có thể được sử dụng để hiển thị thông tin về tình trạng ứng tuyển của công việc đó trên giao diện. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var raw = Number(job && (job.maxApplicants || job.applicantLimit || 0));
    if (!Number.isFinite(raw) || raw <= 0) {
      return 0;
    }
    return Math.floor(raw);
  }

  function isJobApplicantLimitReached(job) { // Hàm tiện ích để kiểm tra xem một công việc cụ thể đã đạt đến giới hạn số lượng ứng viên hay chưa, nó sẽ sử dụng hàm getJobApplicantLimit để lấy giới hạn số lượng ứng viên cho công việc đó và sau đó so sánh với số lượng đơn ứng tuyển đã nộp cho công việc đó bằng cách sử dụng hàm getApplicationCountForJob. Nếu giới hạn số lượng ứng viên lớn hơn 0 và số lượng đơn ứng tuyển đã nộp cho công việc đó lớn hơn hoặc bằng giới hạn, hàm sẽ trả về true, ngược lại sẽ trả về false. Điều này giúp xác định xem công việc đó có còn nhận được đơn ứng tuyển mới hay không và có thể được sử dụng để hiển thị trạng thái ứng tuyển của công việc đó trên giao diện. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var limit = getJobApplicantLimit(job);
    if (limit <= 0) {
      return false;
    }
    return getApplicationCountForJob(job.id) >= limit;
  }

  function getJobAbbr(job) { // Hàm tiện ích để tạo một chữ viết tắt cho tên công ty của một công việc cụ thể, nó sẽ lấy tên công ty từ đối tượng công việc, sau đó tách tên này thành các từ riêng biệt và lấy ký tự đầu tiên của hai từ đầu tiên để tạo thành chữ viết tắt. Nếu tên công ty không có đủ hai từ, hàm sẽ sử dụng ký tự thứ hai của từ đầu tiên hoặc ký tự 'C' làm ký tự thứ hai trong chữ viết tắt. Nếu tên công ty không tồn tại hoặc không có ký tự nào, hàm sẽ trả về 'TC' làm chữ viết tắt mặc định. Điều này giúp tạo ra một biểu tượng ngắn gọn và dễ nhận diện cho công ty trên giao diện hiển thị danh sách công việc. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var words = String(job.company || 'TC').trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      return 'TC';
    }
    var first = words[0].charAt(0) || 'T';
    var second = words.length > 1 ? words[1].charAt(0) : (words[0].charAt(1) || 'C');
    return (first + second).toUpperCase();
  }

  function getDisplaySalary(value) { // Hàm tiện ích để định dạng mức lương hiển thị cho một công việc cụ thể, nó sẽ nhận giá trị lương từ đối tượng công việc và kiểm tra xem giá trị này có hợp lệ hay không. Nếu giá trị lương là một số hợp lệ và lớn hơn 0, hàm sẽ trả về một chuỗi định dạng với đơn vị "VND" và sử dụng dấu chấm để phân cách hàng nghìn. Nếu giá trị lương không hợp lệ hoặc không lớn hơn 0, hàm sẽ trả về một chuỗi mặc định "Thuong luong", có nghĩa là mức lương sẽ được thương lượng giữa ứng viên và nhà tuyển dụng. Điều này giúp hiển thị thông tin về mức lương của công việc một cách rõ ràng và dễ hiểu trên giao diện. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var text = String(value || '').trim();
    if (!text) {
      return 'Thỏa thuận';
    }
    return text;
  }

  function getJobCode(job) { // Hàm tiện ích để tạo một mã ngắn gọn cho tiêu đề của một công việc cụ thể, nó sẽ lấy tiêu đề từ đối tượng công việc, sau đó tách tiêu đề này thành các từ riêng biệt và lấy ký tự đầu tiên của hai hoặc ba từ đầu tiên để tạo thành mã. Nếu tiêu đề không có đủ hai từ, hàm sẽ sử dụng ký tự đầu tiên của từ đầu tiên để tạo thành mã. Nếu tiêu đề không tồn tại hoặc không có ký tự nào, hàm sẽ trả về 'JOB' làm mã mặc định. Điều này giúp tạo ra một biểu tượng ngắn gọn và dễ nhận diện cho công việc trên giao diện hiển thị danh sách công việc. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var title = String(job.title || '').trim();
    if (!title) {
      return 'JOB';
    }

    var words = title.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0) + (words[2] ? words[2].charAt(0) : '')).toUpperCase().slice(0, 3);
    }

    return words[0].slice(0, 3).toUpperCase();
  }

  function renderJobs() { // Hàm tiện ích để hiển thị danh sách công việc trên giao diện, nó sẽ lấy giá trị tìm kiếm và bộ lọc từ các trường nhập liệu, sau đó lọc danh sách công việc trong trạng thái ứng dụng dựa trên các tiêu chí này. Công việc sẽ được lọc theo từ khóa tìm kiếm trong tiêu đề, tên công ty và địa điểm, cũng như theo trạng thái của công việc nếu bộ lọc được áp dụng. Sau khi lọc, danh sách công việc sẽ được sắp xếp theo thứ tự ưu tiên: công việc được ghim bởi quản trị viên sẽ đứng đầu, tiếp theo là công việc nổi bật, sau đó là công việc mới nhất dựa trên ngày đăng hoặc ngày tạo. Cuối cùng, hàm sẽ xây dựng HTML để hiển thị danh sách công việc đã lọc và sắp xếp này trên giao diện. Nếu không có công việc nào phù hợp với tiêu chí tìm kiếm và bộ lọc, hàm sẽ hiển thị một thông báo cho người dùng biết rằng không tìm thấy công việc phù hợp. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var key = normalize(searchInputEl.value);
    var filterValue = filterEl.value;

    var items = state.jobs.filter(function (job) {
      var byKeyword =
        !key ||
        normalize(job.title).includes(key) ||
        normalize(job.company).includes(key) ||
        normalize(job.location).includes(key);

      var byFilter = filterValue === 'all' ? true : normalize(job.status) === filterValue;
      return byKeyword && byFilter;
    }).sort(function (a, b) {
      var pinA = a.pinnedByAdmin ? 1 : 0;
      var pinB = b.pinnedByAdmin ? 1 : 0;
      if (pinB !== pinA) return pinB - pinA;

      var featuredA = a.featured ? 1 : 0;
      var featuredB = b.featured ? 1 : 0;
      if (featuredB !== featuredA) return featuredB - featuredA;

      var dateA = new Date(a.pinnedAt || a.postedDate || a.createdAt || 0).getTime();
      var dateB = new Date(b.pinnedAt || b.postedDate || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;

      return Number(b.id || 0) - Number(a.id || 0);
    });

    if (!items.length) {
      jobListEl.innerHTML =
        "<div class='job-empty'><strong>Không tìm thấy công việc phù hợp.</strong><div style='margin-top:6px;'>Thử tìm từ khóa khác hoặc bộ lọc khác.</div></div>";
      return;
    }

    jobListEl.innerHTML = items
      .map(function (job) {
        var favoriteText = isFavorite(job.id) ? '♥' : '♡';
        var statusText = normalize(job.status || 'open') === 'closed' ? 'Đã đóng' : 'Đang mở';
        var isClosed = normalize(job.status || 'open') === 'closed';
        var tags = getJobTechTags(job);
        var applyCount = getApplicationCountForJob(job.id);
        var applicantLimit = getJobApplicantLimit(job);
        var isLimitReached = applicantLimit > 0 && applyCount >= applicantLimit;
        var applyDisabled = isClosed || isLimitReached;
        var applyLabel = isClosed ? 'Đã đóng' : (isLimitReached ? 'Đã đủ hồ sơ' : 'Ứng tuyển');
        var viewCount = getJobViewCount(job);
        var logo = getJobAbbr(job);
        var code = getJobCode(job);

        return (
          "<div class='job-item'>" +
            "<div class='job-head'>" +
              "<div class='job-brand'>" + escapeHtml(logo) + "</div>" +
              "<div>" +
                "<div class='job-head-title'>" + escapeHtml(code) + "</div>" +
                "<div class='job-head-role'>" + escapeHtml(job.title || 'Vị trí đang cập nhật') + "</div>" +
                "<div class='job-head-company'>" + escapeHtml(job.company || 'Công ty') + "</div>" +
              "</div>" +
              "<div class='job-head-icons'><span>💻</span><span>🧠</span></div>" +
            "</div>" +

            "<div class='job-pill-row'>" +
              "<div class='job-meta-pill'><span>📍</span><span>" + escapeHtml(getDisplaySalary(job.salary)) + "</span><span style='opacity:0.45;'>|</span><span>" + escapeHtml(job.location || 'Đang cập nhật') + "</span></div>" +
              "<div class='job-status-pill " + (isClosed ? 'closed' : 'open') + "'><span>🔒 Trạng thái: " + statusText + "</span><span class='job-status-dot'></span></div>" +
            "</div>" +

            "<div class='job-tech'>" + tags.map(function (tag) {
              return "<span class='job-tech-chip'>" + escapeHtml(tag) + "</span>";
            }).join('') + "</div>" +

            "<div class='job-insight'>" +
              "<div class='job-insight-item'><span>👥</span><span>Đã ứng tuyển: " + applyCount + (applicantLimit > 0 ? ('/ ' + applicantLimit) : '') + "</span></div>" +
              "<div class='job-insight-sep'></div>" +
              "<div class='job-insight-item'><span>👁️</span><span>Views: " + viewCount + "</span></div>" +
            "</div>" +

            "<div class='job-actions'>" +
              "<button class='btn-job apply' data-action='apply' data-id='" + job.id + "'" + (applyDisabled ? ' disabled' : '') + "><span>＋</span><span class='job-btn-label'>" + applyLabel + "</span></button>" +
              "<button class='btn-job detail' data-action='detail' data-id='" + job.id + "'><span>ⓘ</span><span class='job-btn-label'>Xem chi tiết</span></button>" +
              "<button class='btn-job favorite' data-action='favorite' data-id='" + job.id + "' aria-label='Yêu thích'>" + favoriteText + "</button>" +
            "</div>" +
          "</div>"
        );
      })
      .join('');
  }

  function renderApplicationHistory() { // Hàm tiện ích để hiển thị lịch sử ứng tuyển của người dùng trên giao diện, nó sẽ lấy giá trị tìm kiếm và bộ lọc ngày từ các trường nhập liệu, sau đó lọc danh sách đơn ứng tuyển của người dùng dựa trên các tiêu chí này. Đơn ứng tuyển sẽ được lọc theo từ khóa tìm kiếm trong tiêu đề công việc và tên công ty, cũng như theo ngày ứng tuyển nếu bộ lọc ngày được áp dụng. Sau khi lọc, danh sách đơn ứng tuyển sẽ được sắp xếp theo thứ tự thời gian ứng tuyển mới nhất trước. Cuối cùng, hàm sẽ xây dựng HTML để hiển thị danh sách đơn ứng tuyển đã lọc và sắp xếp này trên giao diện. Nếu không có đơn ứng tuyển nào phù hợp với tiêu chí tìm kiếm và bộ lọc, hàm sẽ hiển thị một thông báo cho người dùng biết rằng không có lịch sử ứng tuyển phù hợp với bộ lọc hiện tại. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!historyListEl) {
      return;
    }

    var searchKey = normalize(historySearchInputEl ? historySearchInputEl.value : '');
    var dateFilter = String(historyDateFilterEl ? historyDateFilterEl.value : '').trim();

    var items = getUserApplications().slice().sort(function (a, b) {
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

    items = items.filter(function (item) {
      var jobMeta = getHistoryJobMeta(item);
      var byName = !searchKey ||
        normalize(jobMeta.title).includes(searchKey) ||
        normalize(jobMeta.company).includes(searchKey);

      var byDate = true;
      if (dateFilter) {
        var appliedDate = String(item.appliedAt || '').split('T')[0];
        byDate = appliedDate === dateFilter;
      }

      return byName && byDate;
    });

    if (!items.length) {
      historyListEl.innerHTML = '<li class="empty-note">Khong co lich su phu hop voi bo loc hien tai.</li>';
      return;
    }

    historyListEl.innerHTML = items
      .map(function (item) {
        var jobMeta = getHistoryJobMeta(item);
        var statusMeta = getHistoryStatusMeta(item.status);

        return (
          '<li class="history-card">' +
            '<div>' +
              '<div class="history-title">' + escapeHtml(jobMeta.title) + ' - ' + escapeHtml(jobMeta.company) + '</div>' +
              '<div class="history-meta">' +
                '<span class="history-status ' + statusMeta.css + '">' + statusMeta.icon + ' ' + statusMeta.text + '</span>' +
                '<span>Ngay ung tuyen: ' + escapeHtml(formatDateTime(item.appliedAt)) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="history-actions">' +
              '<button class="history-feedback" type="button" data-history-action="feedback" data-id="' + item.id + '">Xem phan hoi</button>' +
              '<button class="history-delete" type="button" data-history-action="delete" data-id="' + item.id + '">Xoa</button>' +
            '</div>' +
          '</li>'
        );
      })
      .join('');
  }

  function getRecruiterFeedback(application) { // Hàm tiện ích để lấy phản hồi từ nhà tuyển dụng cho một đơn ứng tuyển cụ thể, nó sẽ tìm kiếm trong danh sách lịch phỏng vấn để xem có lịch phỏng vấn nào liên quan đến đơn ứng tuyển đó hay không. Nếu tìm thấy một lịch phỏng vấn phù hợp, hàm sẽ sử dụng thông tin từ lịch phỏng vấn đó để xây dựng phản hồi chi tiết hơn. Sau đó, hàm sẽ xác định trạng thái của đơn ứng tuyển và xây dựng một thông điệp phản hồi dựa trên trạng thái đó, cũng như thông tin về lịch phỏng vấn nếu có. Cuối cùng, hàm sẽ trả về một đối tượng chứa thông tin về trạng thái, thông điệp phản hồi, thông tin về lịch phỏng vấn và thời gian cập nhật cuối cùng của đơn ứng tuyển. Điều này giúp người dùng hiểu rõ hơn về tình trạng của đơn ứng tuyển và những bước tiếp theo có thể xảy ra trong quá trình tuyển dụng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu  
    var interview = state.interviews.find(function (item) {
      return Number(item.applicationId) === Number(application.id);
    }) || null;

    var statusMeta = getHistoryStatusMeta(application.status);
    var feedbackText =
      application.recruiterFeedback ||
      application.recruiterResponse ||
      application.reviewNote ||
      application.interviewNote ||
      (statusMeta.css === 'approved' ? 'Hồ sơ của bạn đã được duyệt. Nhà tuyển dụng sẽ liên hệ bước tiếp theo.' : null) ||
      (statusMeta.css === 'interview' ? 'Bạn đã được mời phỏng vấn. Vui lòng kiểm tra lịch hẹn bên dưới.' : null) ||
      (statusMeta.css === 'rejected' ? 'Hồ sơ chưa phù hợp ở thời điểm hiện tại. Bạn có thể cập nhật CV và ứng tuyển lại.' : null) ||
      'Nhà tuyển dụng chưa gửi phản hồi chi tiết cho hồ sơ này.';

    var interviewInfo = 'Chưa có lịch phỏng vấn.';
    if (interview || application.interviewDate || application.interviewLocation) {
      var iDate = (interview && interview.interviewDate) || application.interviewDate;
      var iLocation = (interview && interview.interviewLocation) || application.interviewLocation || 'Đang cập nhật';
      var iNote = (interview && interview.interviewNote) || application.interviewNote || '(Không có ghi chú)';
      var iStatus = (interview && interview.status) || 'scheduled';
      interviewInfo =
        'Thời gian: ' + formatDateTime(iDate) + '\n' +
        'Địa điểm: ' + iLocation + '\n' +
        'Trạng thái: ' + iStatus + '\n' +
        'Ghi chú: ' + iNote;
    }

    return {
      statusText: statusMeta.text,
      message: feedbackText,
      interviewInfo: interviewInfo,
      updatedAt: application.updatedAt || application.appliedAt
    };
  }

  function openRecruiterFeedbackModal(application) { // Hàm tiện ích để mở modal hiển thị phản hồi từ nhà tuyển dụng cho một đơn ứng tuyển cụ thể, nó sẽ kiểm tra xem phần tử chứa modal và đối tượng đơn ứng tuyển có tồn tại hay không. Nếu có, nó sẽ lấy thông tin về công việc từ đơn ứng tuyển, cũng như phản hồi từ nhà tuyển dụng bằng cách sử dụng hàm getRecruiterFeedback. Sau đó, hàm sẽ điền thông tin này vào các trường tương ứng trong modal để người dùng có thể xem chi tiết về phản hồi và lịch phỏng vấn nếu có. Cuối cùng, hàm sẽ hiển thị modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex'. Nếu phần tử chứa modal hoặc đối tượng đơn ứng tuyển không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!application || !recruiterFeedbackBackdropEl) {
      return;
    }

    var jobMeta = getHistoryJobMeta(application);
    var feedback = getRecruiterFeedback(application);

    if (feedbackJobNameEl) feedbackJobNameEl.value = jobMeta.title;
    if (feedbackCompanyEl) feedbackCompanyEl.value = jobMeta.company;
    if (feedbackStatusEl) feedbackStatusEl.value = feedback.statusText;
    if (feedbackMessageEl) feedbackMessageEl.value = feedback.message;
    if (feedbackInterviewEl) feedbackInterviewEl.value = feedback.interviewInfo;
    if (feedbackUpdatedAtEl) feedbackUpdatedAtEl.value = formatDateTime(feedback.updatedAt);

    recruiterFeedbackBackdropEl.style.display = 'flex';
  }

  function closeRecruiterFeedbackModal() { // Hàm tiện ích để đóng modal hiển thị phản hồi từ nhà tuyển dụng, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none'. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!recruiterFeedbackBackdropEl) {
      return;
    }
    recruiterFeedbackBackdropEl.style.display = 'none';
  }

  function getHistoryJobMeta(item) { // Hàm tiện ích để lấy thông tin về công việc từ một đơn ứng tuyển cụ thể, nó sẽ tìm kiếm trong danh sách công việc để tìm công việc có id khớp với jobId trong đơn ứng tuyển đó. Nếu tìm thấy công việc phù hợp, hàm sẽ sử dụng thông tin từ công việc đó để xây dựng tiêu đề và tên công ty. Nếu không tìm thấy công việc nào phù hợp, hàm sẽ trả về tiêu đề và tên công ty mặc định là 'Vi tri dang cap nhat' và 'Cong ty dang cap nhat'. Điều này giúp đảm bảo rằng ngay cả khi thông tin về công việc đã được cập nhật hoặc không còn tồn tại, người dùng vẫn có thể thấy một số thông tin cơ bản về vị trí mà họ đã ứng tuyển trong lịch sử ứng tuyển của mình. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var job = state.jobs.find(function (j) {
      return Number(j.id) === Number(item.jobId);
    }) || null;

    return {
      title: item.jobTitle || (job && job.title) || 'Vị trí đang cập nhật',
      company: item.company || (job && job.company) || 'Công ty đang cập nhật'
    };
  }

  function getHistoryStatusMeta(status) { // Hàm tiện ích để ánh xạ trạng thái của một đơn ứng tuyển sang một đối tượng chứa thông tin về CSS class, văn bản hiển thị và biểu tượng tương ứng, nó sẽ chuẩn hóa chuỗi trạng thái bằng cách loại bỏ dấu và chuyển về chữ thường, sau đó kiểm tra xem chuỗi này có chứa các từ khóa nhất định để xác định trạng thái của đơn ứng tuyển. Nếu trạng thái chứa từ khóa 'pending' hoặc 'cho', hàm sẽ trả về đối tượng với CSS class 'pending', văn bản 'Cho duyet' và biểu tượng đồng hồ cát. Nếu trạng thái chứa từ khóa 'approved', 'reviewed' hoặc 'duyet', hàm sẽ trả về đối tượng với CSS class 'approved', văn bản 'Da duyet' và biểu tượng dấu kiểm. Nếu trạng thái chứa từ khóa 'phong van' hoặc 'interview', hàm sẽ trả về đối tượng với CSS class 'interview', văn bản 'Moi phong van' và biểu tượng lịch. Nếu trạng thái chứa từ khóa 'rejected', 'tu choi' hoặc 'huy', hàm sẽ trả về đối tượng với CSS class 'rejected', văn bản 'Khong phu hop' và biểu tượng cấm. Nếu không khớp với bất kỳ trường hợp nào, hàm sẽ trả về đối tượng mặc định với CSS class 'default', văn bản là giá trị của status hoặc 'Dang xu ly' nếu status không tồn tại, và biểu tượng thông tin. Điều này giúp hiển thị trạng thái của đơn ứng tuyển một cách trực quan và dễ hiểu trên giao diện người dùng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var st = normalize(status);

    if (st.indexOf('pending') >= 0 || st.indexOf('cho') >= 0) {
      return { css: 'pending', text: 'Chờ duyệt', icon: '⏳' };
    }

    if (st.indexOf('approved') >= 0 || st.indexOf('reviewed') >= 0 || st.indexOf('duyet') >= 0) {
      return { css: 'approved', text: 'Đã duyệt', icon: '✅' };
    }

    if (st.indexOf('phong van') >= 0 || st.indexOf('interview') >= 0) {
      return { css: 'interview', text: 'Mời phỏng vấn', icon: '📅' };
    }

    if (st.indexOf('rejected') >= 0 || st.indexOf('tu choi') >= 0 || st.indexOf('huy') >= 0) {
      return { css: 'rejected', text: 'Không phù hợp', icon: '⛔' };
    }

    return { css: 'default', text: status || 'Đang xử lý', icon: 'ℹ️' };
  }

  function persistApplications() { // Hàm tiện ích để lưu trữ danh sách đơn ứng tuyển của người dùng vào localStorage, nó sẽ sử dụng hàm
    writeCollection('APPLICATIONS_DATA', 'applications', state.applications);
  }

  function deleteApplicationHistory(appId) { // Hàm tiện ích để xóa một đơn ứng tuyển cụ thể khỏi lịch sử ứng tuyển của người dùng, nó sẽ kiểm tra xem đơn ứng tuyển có tồn tại trong danh sách đơn ứng tuyển của người dùng hay không bằng cách so sánh id của đơn ứng tuyển với appId được truyền vào và đảm bảo rằng đơn ứng tuyển đó thuộc về người dùng hiện tại. Nếu tìm thấy đơn ứng tuyển phù hợp, hàm sẽ hiển thị một hộp thoại xác nhận để hỏi người dùng có chắc chắn muốn xóa mục lịch sử ứng tuyển này hay không. Nếu người dùng xác nhận, hàm sẽ lọc danh sách đơn ứng tuyển để loại bỏ đơn ứng tuyển có id khớp với appId và sau đó gọi hàm persistApplications để lưu trữ lại danh sách đã cập nhật vào localStorage. Cuối cùng, hàm sẽ gọi updateStats và renderApplicationHistory để cập nhật lại giao diện hiển thị lịch sử ứng tuyển của người dùng. Nếu không tìm thấy đơn ứng tuyển phù hợp hoặc người dùng không xác nhận việc xóa, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var found = state.applications.some(function (item) {
      return Number(item.id) === Number(appId) && Number(item.candidateId) === Number(state.user && state.user.id);
    });

    if (!found) {
      return;
    }

    var ok = window.confirm('Ban chac chan muon xoa muc lich su ung tuyen nay?');
    if (!ok) {
      return;
    }

    state.applications = state.applications.filter(function (item) {
      return Number(item.id) !== Number(appId);
    });

    persistApplications();
    updateStats();
    renderApplicationHistory();
  }

  function renderFavoritesSection() { // Hàm tiện ích để hiển thị danh sách công việc yêu thích của người dùng trên giao diện, nó sẽ kiểm tra xem phần tử chứa danh sách yêu thích có tồn tại hay không. Nếu có, hàm sẽ lấy danh sách công việc yêu thích đã lưu trữ cho người dùng hiện tại bằng cách sử dụng hàm getSavedForUser. Nếu danh sách yêu thích trống, hàm sẽ hiển thị một thông báo cho người dùng biết rằng họ chưa lưu công việc nào. Nếu có công việc yêu thích, hàm sẽ xây dựng HTML để hiển thị danh sách công việc yêu thích này trên giao diện. Mỗi mục trong danh sách sẽ hiển thị tiêu đề và tên công ty của công việc, cũng như các nút để xem chi tiết hoặc xóa công việc khỏi danh sách yêu thích. Nếu một công việc trong danh sách yêu thích không còn tồn tại trong danh sách công việc hiện tại, mục đó sẽ hiển thị thông báo rằng tin tuyển dụng đã không còn tồn tại. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!favoriteListEl) {
      return;
    }

    var saved = getSavedForUser();
    if (!saved.length) {
      favoriteListEl.innerHTML = '<li class="empty-note">Ban chua luu cong viec nao.</li>';
      return;
    }

    favoriteListEl.innerHTML = saved
      .map(function (item) {
        var job = state.jobs.find(function (j) {
          return Number(j.id) === Number(item.jobId);
        });
        if (!job) {
          return (
              '<li class="favorite-card">' +
                '<div class="favorite-title">Tin ID ' + item.jobId + ' (không còn tồn tại)</div>' +
              '<div class="favorite-actions">' +
                '<button class="favorite-btn remove" type="button" data-favorite-action="remove" data-id="' + item.jobId + '">Xóa khỏi yêu thích</button>' +
              '</div>' +
            '</li>'
          );
        }

        return (
          '<li class="favorite-card">' +
            '<div class="favorite-title">' + escapeHtml(job.title) + ' - ' + escapeHtml(job.company) + '</div>' +
            '<div class="favorite-meta">' +
              'Địa điểm: ' + escapeHtml(job.location || 'Đang cập nhật') + '<br>' +
              'Lương: ' + escapeHtml(job.salary || 'Thỏa thuận') + '<br>' +
              'Trạng thái: ' + escapeHtml(mapJobStatus(job.status)) +
            '</div>' +
            '<div class="favorite-actions">' +
              '<button class="favorite-btn" type="button" data-favorite-action="detail" data-id="' + job.id + '">Xem chi tiết</button>' +
              '<button class="favorite-btn remove" type="button" data-favorite-action="remove" data-id="' + job.id + '">Xóa khỏi yêu thích</button>' +
            '</div>' +
          '</li>'
        );
      })
      .join('');
  }

  function removeFavoriteByJobId(jobId) { // Hàm tiện ích để xóa một công việc khỏi danh sách yêu thích của người dùng dựa trên jobId, nó sẽ kiểm tra xem công việc có tồn tại trong danh sách yêu thích của người dùng hay không bằng cách so sánh jobId với các mục trong danh sách yêu thích và đảm bảo rằng mục đó thuộc về người dùng hiện tại. Nếu tìm thấy công việc phù hợp, hàm sẽ lọc danh sách yêu thích để loại bỏ mục có jobId khớp với jobId được truyền vào và sau đó gọi hàm writeJson để lưu trữ lại danh sách đã cập nhật vào localStorage. Cuối cùng, hàm sẽ gọi updateStats, renderFavoritesSection và renderJobs để cập nhật lại giao diện hiển thị danh sách yêu thích và danh sách công việc. Nếu không tìm thấy công việc phù hợp, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var before = state.savedJobs.length;
    state.savedJobs = state.savedJobs.filter(function (item) {
      return !(Number(item.userId) === Number(state.user && state.user.id) && Number(item.jobId) === Number(jobId));
    });

    if (state.savedJobs.length === before) {
      return;
    }

    writeJson('savedJobs', state.savedJobs);
    updateStats();
    renderFavoritesSection();
    renderJobs();
  }

  function renderCvList() { // Hàm tiện ích để hiển thị danh sách CV của người dùng trên giao diện, nó sẽ kiểm tra xem phần tử chứa danh sách CV có tồn tại hay không. Nếu có, hàm sẽ lấy danh sách CV từ trạng thái ứng dụng và xác định CV mặc định dựa trên giá trị đã lưu trữ trong localStorage. Nếu CV mặc định không còn tồn tại trong danh sách CV hiện tại, hàm sẽ tự động đặt CV đầu tiên trong danh sách làm CV mặc định mới và cập nhật lại localStorage. Nếu danh sách CV trống, hàm sẽ hiển thị một thông báo cho người dùng biết rằng họ chưa có CV nào và khuyến khích họ tạo mới hoặc tải lên CV để bắt đầu ứng tuyển. Nếu có CV, hàm sẽ xây dựng HTML để hiển thị danh sách CV này trên giao diện, mỗi mục trong danh sách sẽ hiển thị tên CV, nguồn gốc (tạo nhanh hay tải lên), thời gian cập nhật và các nút hành động như xem nhanh, sửa, tải xuống, đặt làm mặc định hoặc xóa. Cuối cùng, hàm sẽ gọi updateCvStats để cập nhật các thống kê liên quan đến CV trên giao diện. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!cvListEl) {
      return;
    }

    var defaultCvId = getDefaultCvId();

    if (state.cvs.length && !state.cvs.some(function (cv) { return Number(cv.id) === Number(defaultCvId); })) {
      defaultCvId = Number(state.cvs[0].id);
      setDefaultCvId(defaultCvId);
    }

    if (!state.cvs.length) {
      cvListEl.innerHTML = '<li class="empty-note">Bạn chưa có CV nào. Hãy tạo mới hoặc tải CV để bắt đầu ứng tuyển.</li>';
      updateCvStats();
      return;
    }

    cvListEl.innerHTML = state.cvs
      .map(function (cv) {
        var isDefault = Number(cv.id) === Number(defaultCvId);
        var sourceText = cv.source === 'upload' ? 'Tải lên' : 'Tạo nhanh';
        var timeValue = cv.updatedAt || cv.createdAt;
        var defaultChip = isDefault ? '<span class="cv-chip default">Mặc định</span>' : '<span class="cv-chip">Sẵn sàng</span>';
        var defaultAction = isDefault
          ? '<button class="btn-cv default" type="button" disabled>Đang mặc định</button>'
          : '<button class="btn-cv default" type="button" data-cv-action="set-default" data-id="' + cv.id + '">Đặt mặc định</button>';

        return (
          '<li class="cv-card">' +
            '<div class="cv-card-main">' +
              '<div class="cv-card-title"><span aria-hidden="true">📄</span>' + escapeHtml(cv.name) + '</div>' +
              defaultChip +
              '<div class="cv-card-meta">Nguon: ' + escapeHtml(sourceText) + ' | Cap nhat: ' + escapeHtml(formatDateTime(timeValue)) + '</div>' +
            '</div>' +
            '<div class="cv-card-actions">' +
              '<button class="btn-cv" type="button" data-cv-action="preview" data-id="' + cv.id + '">Xem nhanh</button>' +
              '<button class="btn-cv" type="button" data-cv-action="edit" data-id="' + cv.id + '">Sua</button>' +
              '<button class="btn-cv" type="button" data-cv-action="download" data-id="' + cv.id + '">Tai xuong</button>' +
              defaultAction +
              '<button class="btn-cv delete" type="button" data-cv-action="delete" data-id="' + cv.id + '">Xoa</button>' +
            '</div>' +
          '</li>'
        );
      })
      .join('');

    updateCvStats();
  }

  function getDefaultCvStorageKey() { // Hàm tiện ích để tạo khóa lưu trữ trong localStorage cho CV mặc định của người dùng, nó sẽ kiểm tra xem người dùng hiện tại có thông tin id hay không và sử dụng id đó để tạo một khóa duy nhất cho mỗi người dùng. Nếu người dùng không có thông tin id, hàm sẽ sử dụng 'guest' làm phần định danh trong khóa. Điều này giúp đảm bảo rằng mỗi người dùng có thể lưu trữ và truy cập CV mặc định của riêng họ mà không bị xung đột với người dùng khác khi sử dụng cùng một trình duyệt. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var userId = state.user && state.user.id ? String(state.user.id) : 'guest';
    return 'candidateDefaultCv_' + userId;
  }

  function getDefaultCvId() { // Hàm tiện ích để lấy id của CV mặc định của người dùng từ localStorage, nó sẽ sử dụng khóa được tạo bởi hàm getDefaultCvStorageKey để truy cập giá trị đã lưu trữ. Nếu có giá trị hợp lệ được tìm thấy, hàm sẽ trả về giá trị đó dưới dạng số. Nếu không có giá trị nào được tìm thấy hoặc giá trị không hợp lệ, hàm sẽ trả về 0, biểu thị rằng không có CV mặc định nào được đặt. Điều này giúp ứng dụng xác định được CV nào nên được sử dụng làm mặc định khi người dùng thực hiện các hành động liên quan đến CV mà không chỉ định rõ ràng một CV cụ thể. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    return Number(localStorage.getItem(getDefaultCvStorageKey()) || 0);
  }

  function setDefaultCvId(cvId) {// Hàm tiện ích để đặt id của CV mặc định của người dùng vào localStorage, nó sẽ sử dụng khóa được tạo bởi hàm getDefaultCvStorageKey để lưu trữ giá trị cvId được truyền vào. Giá trị này sẽ được lưu dưới dạng chuỗi trong localStorage. Khi người dùng chọn một CV làm mặc định, hàm này sẽ được gọi để cập nhật giá trị trong localStorage, cho phép ứng dụng nhớ lựa chọn của người dùng ngay cả khi họ tải lại trang hoặc quay lại sau một thời gian. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    localStorage.setItem(getDefaultCvStorageKey(), String(cvId || 0));
  }

  function updateCvStats() {// Hàm tiện ích để cập nhật các thống kê liên quan đến CV trên giao diện người dùng, nó sẽ kiểm tra xem các phần tử chứa thống kê có tồn tại hay không và nếu có, nó sẽ cập nhật nội dung của chúng dựa trên dữ liệu hiện tại trong trạng thái ứng dụng. Thống kê bao gồm tổng số CV mà người dùng đã tạo, tên của CV mặc định (nếu có) và thời gian cập nhật của CV mới nhất. Điều này giúp người dùng có cái nhìn tổng quan về số lượng CV họ đã tạo, CV nào đang được đặt làm mặc định và khi nào họ đã cập nhật CV gần đây nhất. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (cvTotalStatEl) {
      cvTotalStatEl.textContent = String(state.cvs.length);
    }

    var defaultCvId = getDefaultCvId();
    var defaultCv = state.cvs.find(function (cv) {
      return Number(cv.id) === Number(defaultCvId);
    });

    if (cvDefaultStatEl) {
      cvDefaultStatEl.textContent = defaultCv ? defaultCv.name : 'Chua dat';
    }

    if (cvLatestStatEl) {
      var latest = state.cvs.slice().sort(function (a, b) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })[0];
      cvLatestStatEl.textContent = latest ? formatDateTime(latest.createdAt) : '--';
    }
  }

  function openCvPreviewModal(cv) { // Hàm tiện ích để mở modal xem trước nội dung của một CV cụ thể, nó sẽ kiểm tra xem phần tử chứa modal và đối tượng CV có tồn tại hay không. Nếu có, hàm sẽ lấy thông tin về ứng viên từ trạng thái ứng dụng, cũng như các chi tiết của CV như nguồn gốc, vị trí mục tiêu, kỹ năng và tóm tắt. Sau đó, hàm sẽ điền thông tin này vào các trường tương ứng trong modal để người dùng có thể xem trước nội dung của CV một cách rõ ràng và đầy đủ. Cuối cùng, hàm sẽ hiển thị modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex'. Nếu phần tử chứa modal hoặc đối tượng CV không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!cvPreviewBackdropEl || !cv) {
      return;
    }

    activePreviewCvId = Number(cv.id);

    var candidateName = (state.user && (state.user.name || state.user.email)) || 'Ung vien';
    var sourceText = cv.source === 'upload' ? 'Upload file' : 'Tao nhanh';
    var targetPosition = cv.targetPosition || 'Frontend Developer / Fullstack Developer';
    var skills = cv.skills || 'HTML/CSS/JavaScript\nReact co ban\nResponsive UI\nGit va teamwork';
    var summary = cv.summary || ('Nguon CV: ' + sourceText + '.\nUng vien co muc tieu phat trien trong linh vuc CNTT va san sang tham gia cac du an thuc te.');
    var timeValue = cv.updatedAt || cv.createdAt;

    if (cvPreviewNameEl) {
      cvPreviewNameEl.value = cv.name || 'CV Candidate';
    }
    if (cvPreviewCandidateEl) {
      cvPreviewCandidateEl.value = candidateName;
    }
    if (cvPreviewPositionEl) {
      cvPreviewPositionEl.value = targetPosition;
    }
    if (cvPreviewSkillsEl) {
      cvPreviewSkillsEl.value = skills;
    }
    if (cvPreviewSummaryEl) {
      cvPreviewSummaryEl.value = summary;
    }
    if (cvPreviewUpdatedEl) {
      cvPreviewUpdatedEl.value = formatDateTime(timeValue);
    }

    cvPreviewBackdropEl.style.display = 'flex';
  }

  function closeCvPreviewModal() { // Hàm tiện ích để đóng modal xem trước nội dung của CV, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none' và đặt activePreviewCvId về null. Điều này giúp đảm bảo rằng khi người dùng đóng modal xem trước, trạng thái của ứng dụng được cập nhật để phản ánh rằng không còn CV nào đang được xem trước nữa. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!cvPreviewBackdropEl) {
      return;
    }
    cvPreviewBackdropEl.style.display = 'none';
    activePreviewCvId = null;
  }

  function openCvEditModal(cv) { // Hàm tiện ích để mở modal chỉnh sửa thông tin của một CV cụ thể, nó sẽ kiểm tra xem phần tử chứa modal và đối tượng CV có tồn tại hay không. Nếu có, hàm sẽ lấy thông tin chi tiết của CV như tên, vị trí mục tiêu, kỹ năng và tóm tắt, sau đó điền thông tin này vào các trường tương ứng trong modal để người dùng có thể chỉnh sửa một cách dễ dàng. Cuối cùng, hàm sẽ hiển thị modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex'. Nếu phần tử chứa modal hoặc đối tượng CV không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!cvEditBackdropEl || !cv) {
      return;
    }

    activeEditCvId = Number(cv.id);
    if (cvEditNameEl) {
      cvEditNameEl.value = cv.name || '';
    }
    if (cvEditPositionEl) {
      cvEditPositionEl.value = cv.targetPosition || '';
    }
    if (cvEditSkillsEl) {
      cvEditSkillsEl.value = cv.skills || '';
    }
    if (cvEditSummaryEl) {
      cvEditSummaryEl.value = cv.summary || '';
    }

    cvEditBackdropEl.style.display = 'flex';
  }

  function closeCvEditModal() { // Hàm tiện ích để đóng modal chỉnh sửa thông tin của CV, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none' và đặt activeEditCvId về null. Điều này giúp đảm bảo rằng khi người dùng đóng modal chỉnh sửa, trạng thái của ứng dụng được cập nhật để phản ánh rằng không còn CV nào đang được chỉnh sửa nữa. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!cvEditBackdropEl) {
      return;
    }
    cvEditBackdropEl.style.display = 'none';
    activeEditCvId = null;
  }

  function submitCvEdit() { // Hàm tiện ích để xử lý việc lưu các thay đổi được thực hiện trong modal chỉnh sửa CV, nó sẽ kiểm tra xem có CV nào đang được chỉnh sửa hay không bằng cách kiểm tra giá trị của activeEditCvId. Nếu không có CV nào đang được chỉnh sửa, hàm sẽ không thực hiện gì. Nếu có, hàm sẽ lấy các giá trị mới từ các trường nhập liệu trong modal, sau đó cập nhật thông tin của CV tương ứng trong danh sách CV của người dùng dựa trên id của CV đang được chỉnh sửa. Sau khi cập nhật thông tin, hàm sẽ lưu lại danh sách CV đã cập nhật vào localStorage và gọi renderCvList để cập nhật lại giao diện hiển thị danh sách CV. Cuối cùng, hàm sẽ đóng modal chỉnh sửa bằng cách gọi closeCvEditModal. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!activeEditCvId) {
      return;
    }

    var nextName = cvEditNameEl ? String(cvEditNameEl.value || '').trim() : '';
    var nextPosition = cvEditPositionEl ? String(cvEditPositionEl.value || '').trim() : '';
    var nextSkills = cvEditSkillsEl ? String(cvEditSkillsEl.value || '').trim() : '';
    var nextSummary = cvEditSummaryEl ? String(cvEditSummaryEl.value || '').trim() : '';

    if (!nextName) {
      alert('Vui long nhap ten CV.');
      return;
    }

    state.cvs = state.cvs.map(function (cv) {
      if (Number(cv.id) !== Number(activeEditCvId)) {
        return cv;
      }

      return Object.assign({}, cv, {
        name: nextName,
        targetPosition: nextPosition,
        skills: nextSkills,
        summary: nextSummary,
        updatedAt: new Date().toISOString()
      });
    });

    writeJson('candidateCVs', state.cvs);
    renderCvList();
    closeCvEditModal();
  }

  function handleCvAction(action, cvId) { // Hàm tiện ích để xử lý các hành động khác nhau mà người dùng có thể thực hiện trên một CV cụ thể trong danh sách CV của họ, nó sẽ nhận vào một hành động và id của CV mà hành động đó được áp dụng. Hàm sẽ tìm kiếm CV tương ứng trong danh sách CV của người dùng dựa trên id được truyền vào. Nếu không tìm thấy CV nào phù hợp, hàm sẽ không thực hiện gì. Nếu tìm thấy CV, hàm sẽ kiểm tra loại hành động được yêu cầu và thực hiện các thao tác tương ứng như mở modal xem trước, mở modal chỉnh sửa, tải xuống nội dung CV dưới dạng file văn bản, đặt CV làm mặc định hoặc xóa CV khỏi danh sách. Mỗi loại hành động sẽ có logic riêng để xử lý, ví dụ như khi tải xuống, hàm sẽ tạo một Blob chứa thông tin về CV và sử dụng URL.createObjectURL để tạo liên kết tải xuống cho người dùng. Khi xóa, hàm sẽ hiển thị hộp thoại xác nhận trước khi thực hiện xóa và cập nhật lại danh sách CV sau khi xóa thành công. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var cv = state.cvs.find(function (item) {
      return Number(item.id) === Number(cvId);
    });

    if (!cv) {
      return;
    }

    if (action === 'preview') {
      openCvPreviewModal(cv);
      return;
    }

    if (action === 'edit') {
      openCvEditModal(cv);
      return;
    }

    if (action === 'download') {
      var blob = new Blob([
        'Candidate CV\n',
        'Name: ' + cv.name + '\n',
        'Source: ' + (cv.source || 'unknown') + '\n',
        'Updated At: ' + formatDateTime(cv.createdAt) + '\n'
      ], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (cv.name || 'cv').replace(/\s+/g, '_') + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    if (action === 'set-default') {
      setDefaultCvId(cv.id);
      renderCvList();
      return;
    }

    if (action === 'delete') {
      var ok = window.confirm('Ban chac chan muon xoa CV "' + cv.name + '"?');
      if (!ok) {
        return;
      }

      state.cvs = state.cvs.filter(function (item) {
        return Number(item.id) !== Number(cv.id);
      });
      writeJson('candidateCVs', state.cvs);

      var defaultCvId = getDefaultCvId();
      if (Number(defaultCvId) === Number(cv.id)) {
        setDefaultCvId(state.cvs.length ? state.cvs[0].id : 0);
      }

      renderCvList();
    }
  }

  function showView(viewName) { // Hàm tiện ích để hiển thị một phần cụ thể của giao diện người dùng dựa trên tên của phần đó, nó sẽ nhận vào tên của phần mà người dùng muốn xem và sau đó cập nhật giao diện để chỉ hiển thị phần đó trong khi ẩn các phần khác. Hàm sẽ tìm kiếm tất cả các phần có lớp 'view-section' và tất cả các liên kết điều hướng trong thanh bên có lớp 'menu-link'. Sau đó, nó sẽ lặp qua từng phần và liên kết để kiểm tra xem id của phần có khớp với tên phần được yêu cầu hay không, nếu khớp thì phần đó sẽ được hiển thị (bằng cách thêm lớp 'active'), ngược lại sẽ bị ẩn (bằng cách loại bỏ lớp 'active'). Tương tự, đối với các liên kết điều hướng, nếu thuộc tính 'data-view' của liên kết khớp với tên phần được yêu cầu thì liên kết đó sẽ được đánh dấu là đang hoạt động. Điều này giúp người dùng dễ dàng chuyển đổi giữa các phần khác nhau của ứng dụng mà không cần tải lại trang. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    Array.prototype.forEach.call(viewSections, function (section) {
      section.classList.toggle('active', section.id === 'view-' + viewName);
    });

    Array.prototype.forEach.call(menuLinks, function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });
  }

  function bindSidebarNavigation() { // Hàm tiện ích để gắn sự kiện cho các liên kết điều hướng trong thanh bên của giao diện người dùng, nó sẽ tìm kiếm tất cả các liên kết có lớp 'menu-link' và thêm một trình xử lý sự kiện 'click' cho mỗi liên kết. Khi người dùng nhấp vào một liên kết, trình xử lý sẽ ngăn chặn hành động mặc định của trình duyệt (chẳng hạn như điều hướng đến một URL mới) và thay vào đó sẽ lấy giá trị của thuộc tính 'data-view' từ liên kết đó để xác định phần nào của giao diện nên được hiển thị. Nếu giá trị 'data-view' là 'settings', hàm sẽ gọi openAccountSettingsModal để mở modal cài đặt tài khoản, nếu không, nó sẽ gọi showView với tên phần được yêu cầu để cập nhật giao diện hiển thị phần đó. Điều này giúp tạo ra một trải nghiệm người dùng mượt mà khi chuyển đổi giữa các phần khác nhau của ứng dụng mà không cần tải lại trang. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var view = link.getAttribute('data-view');
        if (view === 'settings') {
          openAccountSettingsModal();
          return;
        }
        showView(view);
      });
    });
  }

  function addTimeline(text) { // Hàm tiện ích để thêm một mục mới vào phần lịch sử hoạt động (timeline) của người dùng, nó sẽ nhận vào một chuỗi văn bản mô tả sự kiện hoặc hoạt động mà người dùng muốn ghi lại. Hàm sẽ kiểm tra xem phần tử chứa lịch sử hoạt động có tồn tại hay không, nếu không tồn tại thì hàm sẽ không thực hiện gì. Nếu phần tử tồn tại, hàm sẽ tạo một đối tượng Date mới để lấy thời gian hiện tại và định dạng giờ và phút theo định dạng 24 giờ. Sau đó, hàm sẽ tạo một phần tử 'li' mới và điền nội dung của nó bằng chuỗi văn bản được truyền vào cùng với thời gian hiện tại. Cuối cùng, phần tử 'li' mới này sẽ được thêm vào đầu danh sách trong phần lịch sử hoạt động để đảm bảo rằng các sự kiện mới nhất luôn hiển thị ở trên cùng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!timelineEl) {
      return;
    }

    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');

    var item = document.createElement('li');
    item.innerHTML = text + '<small>' + hh + ':' + mm + ' - Hom nay</small>';
    timelineEl.prepend(item);
  }

  function openApplyModal(job) { // Hàm tiện ích để mở modal ứng tuyển cho một tin tuyển dụng cụ thể, nó sẽ nhận vào một đối tượng job đại diện cho tin tuyển dụng mà người dùng muốn ứng tuyển. Hàm sẽ kiểm tra xem phần tử chứa modal và đối tượng job có tồn tại hay không, nếu không tồn tại thì hàm sẽ không thực hiện gì. Nếu cả hai đều tồn tại, hàm sẽ kiểm tra trạng thái của tin tuyển dụng để đảm bảo rằng nó đang mở (không phải đã đóng) và kiểm tra xem số lượng hồ sơ ứng tuyển đã đạt giới hạn mà nhà tuyển dụng đặt ra hay chưa. Nếu tin tuyển dụng đã đóng hoặc đã đạt giới hạn ứng viên, hàm sẽ hiển thị thông báo lỗi tương ứng và không mở modal. Nếu mọi điều kiện đều hợp lệ, hàm sẽ cập nhật trạng thái của ứng dụng để lưu trữ thông tin về tin tuyển dụng được chọn, điền tiêu đề của tin tuyển dụng vào trường tiêu đề trong modal, xóa nội dung của trường thông điệp và xây dựng danh sách các CV của người dùng để hiển thị trong dropdown chọn CV. Cuối cùng, modal sẽ được hiển thị bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex'. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!job) {
      return;
    }

    if (normalize(job.status || 'open') === 'closed') {
      alert('Tin tuyển dụng đã đóng, không thể ứng tuyển.');
      return;
    }

    if (isJobApplicantLimitReached(job)) {
      alert('Tin tuyển dụng đã đủ số lượng hồ sơ được nhà tuyển dụng tiếp nhận.');
      return;
    }

    state.selectedJob = job;
    modalJobTitleEl.value = job.title + ' - ' + job.company;
    modalMessageEl.value = '';

    var defaultCvId = getDefaultCvId();

    var options = state.cvs
      .map(function (cv) {
        var selected = Number(cv.id) === Number(defaultCvId) ? ' selected' : '';
        var suffix = Number(cv.id) === Number(defaultCvId) ? ' (Mặc định)' : '';
        return '<option value="' + cv.id + '"' + selected + '>' + cv.name + suffix + '</option>';
      })
      .join('');

    modalCvSelectEl.innerHTML = '<option value="">-- Chọn CV --</option>' + options;
    modalBackdropEl.style.display = 'flex';
  }

  function mapJobType(type) { // Hàm tiện ích để chuyển đổi giá trị loại công việc từ định dạng thô (raw) sang định dạng thân thiện hơn để hiển thị trên giao diện người dùng, nó sẽ nhận vào một chuỗi đại diện cho loại công việc và sau đó chuẩn hóa chuỗi này bằng cách loại bỏ khoảng trắng và chuyển đổi thành chữ thường. Sau đó, hàm sẽ so sánh giá trị đã chuẩn hóa với các giá trị được định nghĩa trước như 'fulltime', 'parttime', 'remote' và 'hybrid' để trả về một chuỗi mô tả tương ứng như 'Full-time', 'Part-time', 'Remote' hoặc 'Hybrid'. Nếu giá trị loại công việc không khớp với bất kỳ giá trị nào trong số này, hàm sẽ trả về chính giá trị gốc đã được truyền vào hoặc một chuỗi mặc định 'Dang cap nhat' nếu giá trị gốc không hợp lệ. Điều này giúp đảm bảo rằng thông tin về loại công việc được hiển thị một cách rõ ràng và dễ hiểu cho người dùng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var raw = normalize(type);
    if (raw === 'fulltime' || raw === 'full-time') return 'Toàn thời gian';
    if (raw === 'parttime' || raw === 'part-time') return 'Bán thời gian';
    if (raw === 'remote') return 'Remote';
    if (raw === 'hybrid') return 'Hybrid';
    return type || 'Đang cập nhật';
  }

  function mapJobStatus(status) { // Hàm tiện ích để chuyển đổi giá trị trạng thái công việc từ định dạng thô (raw) sang định dạng thân thiện hơn để hiển thị trên giao diện người dùng, nó sẽ nhận vào một chuỗi đại diện cho trạng thái công việc và sau đó chuẩn hóa chuỗi này bằng cách loại bỏ khoảng trắng và chuyển đổi thành chữ thường. Sau đó, hàm sẽ so sánh giá trị đã chuẩn hóa với các giá trị được định nghĩa trước như 'open', 'active' và 'closed' để trả về một chuỗi mô tả tương ứng như 'Dang mo' cho cả 'open' và 'active', hoặc 'Da dong' cho 'closed'. Nếu giá trị trạng thái công việc không khớp với bất kỳ giá trị nào trong số này, hàm sẽ trả về chính giá trị gốc đã được truyền vào hoặc một chuỗi mặc định 'Dang cap nhat' nếu giá trị gốc không hợp lệ. Điều này giúp đảm bảo rằng thông tin về trạng thái công việc được hiển thị một cách rõ ràng và dễ hiểu cho người dùng. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    var raw = normalize(status);
    if (raw === 'open' || raw === 'active') return 'Đang mở';
    if (raw === 'closed') return 'Đã đóng';
    return status || 'Đang cập nhật';
  }

  function openJobDetailModal(job) { // Hàm tiện ích để mở modal hiển thị chi tiết thông tin của một tin tuyển dụng cụ thể, nó sẽ nhận vào một đối tượng job đại diện cho tin tuyển dụng mà người dùng muốn xem chi tiết. Hàm sẽ kiểm tra xem phần tử chứa modal và đối tượng job có tồn tại hay không, nếu không tồn tại thì hàm sẽ không thực hiện gì. Nếu cả hai đều tồn tại, hàm sẽ điền các thông tin chi tiết của tin tuyển dụng như tiêu đề, công ty, mức lương, địa điểm, loại hình công việc, trạng thái, ngày đăng và mô tả vào các trường tương ứng trong modal. Nếu bất kỳ thông tin nào không có sẵn trong đối tượng job, hàm sẽ sử dụng các giá trị mặc định như 'Dang cap nhat' hoặc 'Thuong luong' để đảm bảo rằng giao diện vẫn hiển thị đầy đủ thông tin cho người dùng. Cuối cùng, modal sẽ được hiển thị bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'flex' và gắn thuộc tính 'data-job-id' với id của tin tuyển dụng để tiện cho việc xử lý sau này. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!job || !jobDetailBackdropEl) {
      return;
    }

    var currentJob = state.jobs.find(function (item) {
      return Number(item.id) === Number(job.id);
    }) || job;
    var updatedJob = increaseJobViewCount(currentJob.id);
    var detailJob = updatedJob || currentJob;

    if (jobDetailNameEl) jobDetailNameEl.value = detailJob.title || 'Đang cập nhật';
    if (jobDetailCompanyEl) jobDetailCompanyEl.value = detailJob.company || 'Đang cập nhật';
    if (jobDetailSalaryEl) jobDetailSalaryEl.value = detailJob.salary || 'Thỏa thuận';
    if (jobDetailLocationEl) jobDetailLocationEl.value = detailJob.location || 'Đang cập nhật';
    if (jobDetailRequirementsEl) jobDetailRequirementsEl.value = detailJob.requirements || 'Chưa cập nhật yêu cầu cho vị trí này.';
    if (jobDetailMaxApplicantsEl) {
      var limit = getJobApplicantLimit(detailJob);
      jobDetailMaxApplicantsEl.value = limit > 0 ? String(limit) : 'Không giới hạn';
    }
    if (jobDetailTypeEl) jobDetailTypeEl.value = mapJobType(detailJob.type);
    if (jobDetailStatusEl) jobDetailStatusEl.value = mapJobStatus(detailJob.status);
    if (jobDetailPostedDateEl) jobDetailPostedDateEl.value = detailJob.postedDate || 'Đang cập nhật';
    if (jobDetailDescriptionEl) jobDetailDescriptionEl.value = detailJob.description || 'Công ty chưa cập nhật mô tả chi tiết cho vị trí này.';

    jobDetailBackdropEl.setAttribute('data-job-id', String(detailJob.id));
    jobDetailBackdropEl.style.display = 'flex';
  }

  function closeJobDetailModal() { // Hàm tiện ích để đóng modal hiển thị chi tiết thông tin của tin tuyển dụng, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none' và loại bỏ thuộc tính 'data-job-id'. Điều này giúp đảm bảo rằng khi người dùng đóng modal chi tiết công việc, trạng thái của ứng dụng được cập nhật để phản ánh rằng không còn tin tuyển dụng nào đang được xem chi tiết nữa. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!jobDetailBackdropEl) {
      return;
    }
    jobDetailBackdropEl.style.display = 'none';
    jobDetailBackdropEl.removeAttribute('data-job-id');
  }

  function closeApplyModal() { // Hàm tiện ích để đóng modal ứng tuyển, nó sẽ kiểm tra xem phần tử chứa modal có tồn tại hay không và nếu có, nó sẽ ẩn modal bằng cách thay đổi kiểu hiển thị của phần tử chứa modal thành 'none' và đặt state.selectedJob về null. Điều này giúp đảm bảo rằng khi người dùng đóng modal ứng tuyển, trạng thái của ứng dụng được cập nhật để phản ánh rằng không còn tin tuyển dụng nào đang được chọn để ứng tuyển nữa. Nếu phần tử chứa modal không tồn tại, hàm sẽ không thực hiện gì. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    modalBackdropEl.style.display = 'none';
    state.selectedJob = null;
  }

  function submitApplication() { // Hàm tiện ích để xử lý việc gửi đơn ứng tuyển cho một tin tuyển dụng cụ thể, nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa và đã chọn tin tuyển dụng nào để ứng tuyển hay chưa. Nếu người dùng chưa đăng nhập, hàm sẽ hiển thị thông báo lỗi yêu cầu người dùng đăng nhập trước khi có thể ứng tuyển. Nếu người dùng đã đăng nhập nhưng chưa chọn tin tuyển dụng nào, hàm sẽ không thực hiện gì. Nếu cả hai điều kiện đều hợp lệ, hàm sẽ tải lại danh sách tin tuyển dụng và đơn ứng tuyển mới nhất để đảm bảo rằng các kiểm tra về hạn mức ứng viên và trạng thái của tin tuyển dụng là chính xác nhất. Sau đó, hàm sẽ tìm kiếm tin tuyển dụng đã chọn trong danh sách mới tải lại để đảm bảo rằng nó vẫn tồn tại và đang mở. Nếu tin tuyển dụng đã bị xóa hoặc đã đóng, hàm sẽ hiển thị thông báo lỗi tương ứng và yêu cầu người dùng tải lại danh sách công việc. Nếu mọi điều kiện đều hợp lệ, hàm sẽ tiếp tục kiểm tra xem người dùng đã chọn CV nào để nộp đơn hay chưa. Nếu chưa chọn CV, hàm sẽ hiển thị thông báo lỗi yêu cầu người dùng chọn CV trước khi gửi đơn. Nếu đã chọn CV, hàm sẽ tính toán phí hoa hồng dựa trên id của tin tuyển dụng và kiểm tra xem việc tính phí có thành công hay không (ví dụ như kiểm tra số dư của người dùng). Nếu việc tính phí không thành công, hàm sẽ hiển thị thông báo lỗi với lý do cụ thể nếu có. Nếu tất cả các bước kiểm tra đều thành công, hàm sẽ tạo một đối tượng đơn ứng tuyển mới với tất cả các thông tin cần thiết như id, jobId, candidateId, message, cvName và thời gian nộp đơn. Đơn ứng tuyển mới này sẽ được thêm vào danh sách đơn ứng tuyển của trạng thái ứng dụng và lưu lại vào bộ nhớ. Cuối cùng, hàm sẽ cập nhật giao diện người dùng để phản ánh sự thay đổi này và đóng modal ứng tuyển. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      alert('Khong tim thay thong tin dang nhap.');
      return;
    }

    if (!state.selectedJob) {
      return;
    }

    // Reload latest collections before applying to avoid stale quota checks.
    state.jobs = getJobCollection();
    state.applications = getApplicationCollection();
    var latestJob = state.jobs.find(function (item) {
      return Number(item.id) === Number(state.selectedJob.id);
    });

    if (!latestJob) {
      alert('Tin tuyển dụng không còn tồn tại. Vui lòng tải lại danh sách việc.');
      closeApplyModal();
      renderJobs();
      return;
    }

    if (normalize(latestJob.status || 'open') === 'closed') {
      alert('Tin tuyển dụng đã đóng, không thể ứng tuyển.');
      closeApplyModal();
      renderJobs();
      return;
    }

    if (isJobApplicantLimitReached(latestJob)) {
      alert('Tin tuyển dụng đã đủ số lượng hồ sơ được nhà tuyển dụng tiếp nhận.');
      closeApplyModal();
      renderJobs();
      return;
    }

    state.selectedJob = latestJob;

    var cvId = Number(modalCvSelectEl.value);
    if (!cvId) {
      alert('Vui lòng chọn CV trước khi gửi ứng tuyển.');
      return;
    }

    var selectedCv = state.cvs.find(function (cv) {
      return Number(cv.id) === cvId;
    });

    var newId = state.applications.reduce(function (max, item) {
      return Math.max(max, Number(item.id) || 0);
    }, 0) + 1;

    var newApplication = {
      id: newId,
      jobId: state.selectedJob.id,
      jobTitle: state.selectedJob.title,
      company: state.selectedJob.company,
      candidateId: state.user.id,
      candidateName: state.user.name,
      recruiterEmail: state.selectedJob.recruiterEmail || '',
      recruiterName: state.selectedJob.recruiterName || '',
      status: 'pending',
      message: String(modalMessageEl.value || '').trim(),
      cvName: selectedCv ? selectedCv.name : '',
      appliedAt: new Date().toISOString()
    };

    state.applications.push(newApplication);
    persistApplications();

    updateStats();
    renderApplicationHistory();
    addTimeline('Đã ứng tuyển vị trí ' + state.selectedJob.title + ' tại ' + state.selectedJob.company);
    alert('Ứng tuyển thành công!');
    closeApplyModal();
  }

  function toggleFavorite(jobId) { // Hàm tiện ích để thêm hoặc xóa một tin tuyển dụng khỏi danh sách yêu thích của người dùng, nó sẽ nhận vào id của tin tuyển dụng mà người dùng muốn thêm hoặc xóa khỏi danh sách yêu thích. Hàm sẽ kiểm tra xem người dùng đã đăng nhập hay chưa, nếu chưa đăng nhập thì hàm sẽ không thực hiện gì. Nếu người dùng đã đăng nhập, hàm sẽ tìm kiếm trong danh sách công việc đã lưu của người dùng để xem tin tuyển dụng có tồn tại hay không dựa trên id được truyền vào. Nếu tin tuyển dụng không tồn tại trong danh sách công việc đã lưu, hàm sẽ không thực hiện gì. Nếu tin tuyển dụng tồn tại, hàm sẽ kiểm tra xem tin tuyển dụng đó đã có trong danh sách yêu thích của người dùng hay chưa bằng cách tìm kiếm trong state.savedJobs. Nếu tin tuyển dụng đã có trong danh sách yêu thích, hàm sẽ xóa nó khỏi danh sách và ghi lại vào bộ nhớ, đồng thời thêm một mục mới vào timeline để ghi lại hoạt động này. Nếu tin tuyển dụng chưa có trong danh sách yêu thích, hàm sẽ thêm nó vào danh sách với thông tin về userId, jobId và thời gian lưu, sau đó ghi lại vào bộ nhớ và cập nhật timeline. Cuối cùng, hàm sẽ cập nhật lại giao diện hiển thị danh sách yêu thích và danh sách công việc để phản ánh sự thay đổi này. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (!state.user) {
      return;
    }

    var idx = state.savedJobs.findIndex(function (item) {
      return Number(item.userId) === Number(state.user.id) && Number(item.jobId) === Number(jobId);
    });

    if (idx >= 0) {
      state.savedJobs.splice(idx, 1);
      addTimeline('Đã bỏ lưu việc làm ID ' + jobId);
    } else {
      state.savedJobs.push({
        userId: state.user.id,
        jobId: jobId,
        savedAt: new Date().toISOString()
      });
      addTimeline('Đã thêm việc làm ID ' + jobId + ' vào danh sách yêu thích');
    }

    writeJson('savedJobs', state.savedJobs);
    updateStats();
    renderFavoritesSection();
    renderJobs();
  }

  function bindEvents() { // Hàm tiện ích để gắn sự kiện cho các phần tử tương tác trong giao diện người dùng, nó sẽ tìm kiếm các phần tử như ô nhập liệu tìm kiếm, bộ lọc, danh sách công việc, danh sách CV, danh sách yêu thích, danh sách lịch sử ứng tuyển và các nút trong modal. Sau đó, hàm sẽ thêm các trình xử lý sự kiện tương ứng cho từng phần tử để đảm bảo rằng khi người dùng tương tác với chúng, các chức năng như tìm kiếm công việc, lọc công việc, xem chi tiết công việc, ứng tuyển, quản lý CV và xem lịch sử ứng tuyển sẽ hoạt động một cách mượt mà. Ví dụ, khi người dùng nhập vào ô tìm kiếm hoặc thay đổi bộ lọc, hàm sẽ gọi renderJobs để cập nhật lại danh sách công việc hiển thị dựa trên tiêu chí mới. Khi người dùng nhấp vào các nút trong danh sách công việc hoặc CV, hàm sẽ xác định hành động được yêu cầu và gọi các hàm tiện ích tương ứng như openJobDetailModal hoặc openApplyModal để thực hiện hành động đó. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (searchInputEl) {
      searchInputEl.addEventListener('input', renderJobs);
    }

    if (filterEl) {
      filterEl.addEventListener('change', renderJobs);
    }

    if (historySearchInputEl) {
      historySearchInputEl.addEventListener('input', renderApplicationHistory);
    }

    if (historyDateFilterEl) {
      historyDateFilterEl.addEventListener('change', renderApplicationHistory);
    }

    if (jobListEl) {
      jobListEl.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-action]');
        if (!btn) {
          return;
        }

        var action = btn.getAttribute('data-action');
        var jobId = Number(btn.getAttribute('data-id'));
        var job = state.jobs.find(function (j) {
          return Number(j.id) === jobId;
        });

        if (!job) {
          return;
        }

        if (action === 'detail') {
          openJobDetailModal(job);
          return;
        }

        if (action === 'apply') {
          openApplyModal(job);
          return;
        }

        if (action === 'favorite') {
          toggleFavorite(jobId);
        }
      });
    }

    if (cvListEl) {
      cvListEl.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-cv-action]');
        if (!btn) {
          return;
        }

        var action = btn.getAttribute('data-cv-action');
        var cvId = Number(btn.getAttribute('data-id'));
        handleCvAction(action, cvId);
      });
    }

    if (favoriteListEl) {
      favoriteListEl.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-favorite-action]');
        if (!btn) {
          return;
        }

        var action = btn.getAttribute('data-favorite-action');
        var jobId = Number(btn.getAttribute('data-id'));

        if (action === 'remove') {
          removeFavoriteByJobId(jobId);
          return;
        }

        if (action === 'detail') {
          var job = state.jobs.find(function (j) { return Number(j.id) === Number(jobId); });
          if (job) {
            openJobDetailModal(job);
          }
        }
      });
    }

    if (historyListEl) {
      historyListEl.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-history-action]');
        if (!btn) {
          return;
        }

        var action = btn.getAttribute('data-history-action');
        var appId = Number(btn.getAttribute('data-id'));
        if (action === 'feedback') {
          var app = state.applications.find(function (item) {
            return Number(item.id) === Number(appId);
          });
          if (app) {
            openRecruiterFeedbackModal(app);
          }
          return;
        }

        if (action === 'delete') {
          deleteApplicationHistory(appId);
        }
      });
    }

    if (modalCloseEl) {
      modalCloseEl.addEventListener('click', closeApplyModal);
    }

    if (modalCancelEl) {
      modalCancelEl.addEventListener('click', closeApplyModal);
    }

    if (modalConfirmEl) {
      modalConfirmEl.addEventListener('click', submitApplication);
    }

    if (modalBackdropEl) {
      modalBackdropEl.addEventListener('click', function (event) {
        if (event.target === modalBackdropEl) {
          closeApplyModal();
        }
      });
    }

    if (jobDetailCloseEl) {
      jobDetailCloseEl.addEventListener('click', closeJobDetailModal);
    }

    if (jobDetailCloseBtnEl) {
      jobDetailCloseBtnEl.addEventListener('click', closeJobDetailModal);
    }

    if (jobDetailBackdropEl) {
      jobDetailBackdropEl.addEventListener('click', function (event) {
        if (event.target === jobDetailBackdropEl) {
          closeJobDetailModal();
        }
      });
    }

    if (jobDetailApplyBtnEl) {
      jobDetailApplyBtnEl.addEventListener('click', function () {
        if (!jobDetailBackdropEl) {
          return;
        }
        var jobId = Number(jobDetailBackdropEl.getAttribute('data-job-id'));
        var job = state.jobs.find(function (j) {
          return Number(j.id) === Number(jobId);
        });
        if (!job) {
          return;
        }
        closeJobDetailModal();
        openApplyModal(job);
      });
    }

    if (candidateContactSendEl) {
      candidateContactSendEl.addEventListener('click', function () {
        submitAdminContact('candidate', 'Candidate');
      });
    }

    var candidateNotificationBtnEl = document.getElementById('candidateNotificationBtn');
    var notificationBackdropEl = document.getElementById('notificationBackdrop');
    var notificationCloseEl = document.getElementById('notificationClose');
    var notificationCloseBtnEl = document.getElementById('notificationCloseBtn');
    var notificationMarkReadEl = document.getElementById('notificationMarkRead');

    if (candidateNotificationBtnEl) {
      candidateNotificationBtnEl.addEventListener('click', openNotificationsModal);
    }

    if (notificationCloseEl) {
      notificationCloseEl.addEventListener('click', closeNotificationsModal);
    }

    if (notificationCloseBtnEl) {
      notificationCloseBtnEl.addEventListener('click', closeNotificationsModal);
    }

    if (notificationMarkReadEl) {
      notificationMarkReadEl.addEventListener('click', function () {
        markCandidateNotificationsRead();
        closeNotificationsModal();
      });
    }

    if (notificationBackdropEl) {
      notificationBackdropEl.addEventListener('click', function (event) {
        if (event.target === notificationBackdropEl) {
          closeNotificationsModal();
        }
      });
    }

    if (recruiterFeedbackCloseEl) {
      recruiterFeedbackCloseEl.addEventListener('click', closeRecruiterFeedbackModal);
    }

    if (recruiterFeedbackCloseBtnEl) {
      recruiterFeedbackCloseBtnEl.addEventListener('click', closeRecruiterFeedbackModal);
    }

    if (recruiterFeedbackBackdropEl) {
      recruiterFeedbackBackdropEl.addEventListener('click', function (event) {
        if (event.target === recruiterFeedbackBackdropEl) {
          closeRecruiterFeedbackModal();
        }
      });
    }

    if (recruiterFeedbackApplyBtnEl) {
      recruiterFeedbackApplyBtnEl.addEventListener('click', function () {
        closeRecruiterFeedbackModal();
        showView('jobs');
      });
    }

    if (cvPreviewCloseEl) {
      cvPreviewCloseEl.addEventListener('click', closeCvPreviewModal);
    }

    if (cvPreviewCloseBtnEl) {
      cvPreviewCloseBtnEl.addEventListener('click', closeCvPreviewModal);
    }

    if (cvPreviewBackdropEl) {
      cvPreviewBackdropEl.addEventListener('click', function (event) {
        if (event.target === cvPreviewBackdropEl) {
          closeCvPreviewModal();
        }
      });
    }

    if (cvPreviewDownloadBtnEl) {
      cvPreviewDownloadBtnEl.addEventListener('click', function () {
        if (!activePreviewCvId) {
          return;
        }
        handleCvAction('download', activePreviewCvId);
      });
    }

    if (cvEditCloseEl) {
      cvEditCloseEl.addEventListener('click', closeCvEditModal);
    }

    if (cvEditCancelEl) {
      cvEditCancelEl.addEventListener('click', closeCvEditModal);
    }

    if (cvEditSaveEl) {
      cvEditSaveEl.addEventListener('click', submitCvEdit);
    }

    if (cvEditBackdropEl) {
      cvEditBackdropEl.addEventListener('click', function (event) {
        if (event.target === cvEditBackdropEl) {
          closeCvEditModal();
        }
      });
    }

    if (accountSettingsCloseEl) {
      accountSettingsCloseEl.addEventListener('click', closeAccountSettingsModal);
    }

    if (accountSettingsCancelEl) {
      accountSettingsCancelEl.addEventListener('click', closeAccountSettingsModal);
    }

    if (accountSettingsSaveEl) {
      accountSettingsSaveEl.addEventListener('click', submitAccountSettings);
    }

    if (accountSettingsBackdropEl) {
      accountSettingsBackdropEl.addEventListener('click', function (event) {
        if (event.target === accountSettingsBackdropEl) {
          closeAccountSettingsModal();
        }
      });
    }

    bindSidebarNavigation();

    document.addEventListener('candidate:cvs-changed', function () {
      state.cvs = readJson('candidateCVs', []);
      renderCvList();
    });

    window.addEventListener('storage', function () {
      state.jobs = readJson('jobs', []);
      state.applications = readJson('applications', []);
      state.interviews = readJson('interviews', []);
      state.savedJobs = readJson('savedJobs', []);
      state.user = getCurrentUser() || state.user;
      updateStats();
      renderFavoritesSection();
      renderApplicationHistory();

      updateNotificationBadge();
      renderNotifications();
    });
  }

  function initCandidateModule() { // Hàm khởi tạo chính để thiết lập trạng thái ban đầu và gắn sự kiện cho module ứng viên, nó sẽ được gọi khi tài liệu đã sẵn sàng. Hàm sẽ kiểm tra xem có hàm initializeData nào được định nghĩa hay không và nếu có, nó sẽ gọi hàm đó với đối số false để thực hiện bất kỳ khởi tạo dữ liệu nào cần thiết trước khi tải trạng thái và cập nhật giao diện người dùng. Sau đó, hàm sẽ gọi các hàm tiện ích để tải trạng thái từ bộ nhớ, cập nhật thông tin người dùng trên giao diện, cập nhật thống kê, hiển thị danh sách công việc, lịch sử ứng tuyển, danh sách yêu thích, danh sách CV và tin nhắn hỗ trợ. Cuối cùng, hàm sẽ gắn các sự kiện tương tác cho các phần tử trong giao diện người dùng để đảm bảo rằng người dùng có thể tương tác với ứng dụng một cách mượt mà. Nếu localStorage không hỗ trợ hoặc có lỗi khi truy cập, hàm sẽ hiển thị thông báo lỗi và không thực hiện ghi dữ liệu
    if (typeof initializeData === 'function') {
      initializeData(false);
    }

    loadState();
    updateUserInfoUI();
    updateStats();
    renderJobs();
    renderApplicationHistory();
    renderFavoritesSection();
    renderCvList();
    updateNotificationBadge();
    renderNotifications();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCandidateModule);
  } else {
    initCandidateModule();
  }
})();
