// auth.js - Auth helper for demo using localStorage/sessionStorage

(function () {
  //Dùng để lưu trữ các khóa dữ liệu trong localStorage để tránh lỗi chính tả và dễ quản lý hơn
  var STORAGE = {
    JOBS: 'JOBS_DATA',
    APPLICATIONS: 'APPLICATIONS_DATA'
  };

  //Đọc dữ liệu từ localStorage và chuyển đổi từ JSON sang đối tượng JavaScript. Nếu có lỗi hoặc không tồn tại, trả về giá trị mặc định (fallback).
  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) { //ghi dữ liệu vào localStorage sau khi chuyển đổi từ đối tượng JavaScript sang JSON. Nếu có lỗi, nó sẽ không ghi gì cả.
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeed() { //Đảm bảo rằng dữ liệu đã được khởi tạo trong localStorage. Nếu chưa, nó sẽ gọi hàm initializeData để thiết lập dữ liệu mặc định. Hàm này cũng có thể được gọi lại để reset dữ liệu nếu cần.
    if (typeof initializeData === 'function') {
      initializeData(false);
    }
  }

  
  function getUsers() { //Lấy danh sách người dùng từ localStorage. Trước khi truy cập, nó gọi ensureSeed để đảm bảo dữ liệu đã được khởi tạo. Nếu có lỗi hoặc không tồn tại, trả về một mảng rỗng.
    ensureSeed();
    return readJson('users', []);
  }

  function saveUsers(users) { //Lưu danh sách người dùng vào localStorage. Nó chuyển đổi đối tượng JavaScript thành JSON trước khi lưu. Hàm này có thể được sử dụng để cập nhật danh sách người dùng sau khi có sự thay đổi (ví dụ: đăng ký mới, cập nhật thông tin người dùng, v.v.).  
    writeJson('users', users);
  }

  function getJobs() { //Lấy danh sách công việc từ localStorage. Trước khi truy cập, nó gọi ensureSeed để đảm bảo dữ liệu đã được khởi tạo. Nếu có lỗi hoặc không tồn tại, trả về một mảng rỗng.
    ensureSeed();
    var shared = readJson(STORAGE.JOBS, []);
    if (Array.isArray(shared) && shared.length) {
      return shared;
    }
    return readJson('jobs', []);
  }

  function getApplications() { //Lấy danh sách đơn ứng tuyển từ localStorage. Trước khi truy cập, nó gọi ensureSeed để đảm bảo dữ liệu đã được khởi tạo. Nếu có lỗi hoặc không tồn tại, trả về một mảng rỗng.
    ensureSeed();
    var shared = readJson(STORAGE.APPLICATIONS, []);
    if (Array.isArray(shared) && shared.length) {
      return shared;
    }
    return readJson('applications', []);
  }

  function normalizeEmail(email) { //Hàm này chuẩn hóa địa chỉ email bằng cách loại bỏ khoảng trắng ở đầu và cuối, chuyển đổi tất cả ký tự thành chữ thường. Điều này giúp đảm bảo rằng việc so sánh email sẽ không bị ảnh hưởng bởi sự khác biệt về chữ hoa/chữ thường hoặc khoảng trắng không mong muốn.
    return String(email || '').trim().toLowerCase();
  }

  function findUserByEmail(email) { //Tìm kiếm người dùng trong danh sách người dùng dựa trên địa chỉ email. Hàm này sử dụng normalizeEmail để chuẩn hóa email trước khi so sánh, đảm bảo rằng việc tìm kiếm sẽ không bị ảnh hưởng bởi sự khác biệt về chữ hoa/chữ thường hoặc khoảng trắng. Nếu tìm thấy người dùng có email khớp, nó sẽ trả về đối tượng người dùng đó; nếu không tìm thấy, nó sẽ trả về null.
    var normalized = normalizeEmail(email);
    return getUsers().find(function (u) {
      return normalizeEmail(u.email) === normalized;
    }) || null;
  }

  function emailExists(email) { //Kiểm tra xem có người dùng nào đã đăng ký với địa chỉ email đã cho hay không. Hàm này sử dụng findUserByEmail để tìm kiếm người dùng dựa trên email. Nếu tìm thấy người dùng, nó sẽ trả về true; nếu không tìm thấy, nó sẽ trả về false.
    return !!findUserByEmail(email);
  }

  function calculateAge(birthDate) { //Tính toán tuổi dựa trên ngày sinh được cung cấp. Hàm này tạo một đối tượng Date từ chuỗi ngày sinh và so sánh với ngày hiện tại để tính toán tuổi. Nếu ngày sinh không hợp lệ, nó sẽ trả về 0. Nếu ngày sinh hợp lệ, nó sẽ trả về số tuổi tương ứng.
    var birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) {
      return 0;
    }

    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  }

  function registerCandidate(payload) { //Đăng ký người dùng mới với vai trò "candidate". Hàm này nhận một đối tượng payload chứa thông tin đăng ký của người dùng, bao gồm tên, email, mật khẩu, ngày sinh và địa
    var name = String(payload.name || '').trim();
    var email = String(payload.email || '').trim();
    var password = String(payload.password || '').trim();
    var birthDate = String(payload.birthDate || '').trim();
    var location = String(payload.location || '').trim();

    if (!name || !email || !password || !birthDate || !location) {
      return { success: false, message: 'Vui lòng điển đầy đủ thông tin.' };
    }

    if (calculateAge(birthDate) < 16) {
      return { success: false, message: 'Dưới 16 tuổi không thể đăng ký.' };
    }

    if (emailExists(email)) {
      return { success: false, message: 'Email đã tồn tại.' };
    }

    var users = getUsers();
    var nextId = users.reduce(function (max, u) {
      return Math.max(max, Number(u.id) || 0);
    }, 0) + 1;

    var user = {
      id: nextId,
      role: 'candidate',
      name: name,
      email: email,
      password: password,
      birthDate: birthDate,
      location: location,
      phone: '',
      skills: [],
      experience: ''
    };

    users.push(user);
    saveUsers(users);
    return { success: true, user: user };
  }

  function registerRecruiter(payload) { //Đăng ký người dùng mới với vai trò "recruiter". Hàm này nhận một đối tượng payload chứa thông tin đăng ký của người dùng, bao gồm tên công ty, email, mật khẩu và số điện thoại. Nó sẽ kiểm tra tính hợp lệ của dữ liệu đầu vào, đảm bảo rằng tất cả các trường bắt buộc đều được điền đầy đủ và email chưa tồn tại trong hệ thống. Nếu có lỗi, nó sẽ trả về một đối tượng với thuộc tính success là false và thông báo lỗi tương ứng. Nếu đăng ký thành công, nó sẽ tạo một đối tượng người dùng mới với vai trò "recruiter", lưu vào localStorage và trả về một đối tượng với thuộc tính success là true cùng với thông tin người dùng đã đăng ký.
    var companyName = String(payload.companyName || '').trim();
    var email = String(payload.email || '').trim();
    var phone = String(payload.phone || '').trim();
    var password = String(payload.password || '').trim();

    if (!companyName || !email || !phone || !password) {
      return { success: false, message: 'Vui lòng điển đầy đủ thông tin.' };
    }

    if (emailExists(email)) {
      return { success: false, message: 'Email đã tồn tại.' };
    }

    var users = getUsers();
    var nextId = users.reduce(function (max, u) {
      return Math.max(max, Number(u.id) || 0);
    }, 0) + 1;

    var user = {
      id: nextId,
      role: 'recruiter',
      name: companyName,
      company: companyName,
      email: email,
      phone: phone,
      password: password
    };

    users.push(user);
    saveUsers(users);
    return { success: true, user: user };
  }

  // Biến toàn cục lưu OTP tạm thời (demo, không bảo mật)
  var _lastOtp = null;
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  function sendOtpMock() {
    var otp = generateOtp();
    _lastOtp = otp;
    alert('Ma OTP cua ban la: ' + otp);
    return otp;
  }

  function login(email, password) { //Xử lý đăng nhập của người dùng. Hàm này nhận địa chỉ email và mật khẩu từ form đăng nhập, sau đó chuẩn hóa email và kiểm tra tính hợp lệ của dữ liệu đầu vào. Nếu có lỗi, nó sẽ trả về một đối tượng với thuộc tính success là false và thông báo lỗi tương ứng. Nếu email không tồn tại trong hệ thống hoặc mật khẩu không đúng, nó cũng sẽ trả về lỗi. Nếu đăng nhập thành công, nó sẽ lưu thông tin người dùng vào sessionStorage để duy trì trạng thái đăng nhập và trả về một đối tượng với thuộc tính success là true cùng với thông tin người dùng đã đăng nhập.
    var normalized = normalizeEmail(email);
    var pwd = String(password || '').trim();

    if (!normalized || !pwd) {
      return { success: false, message: 'Vui lòng nhập email và mật khẩu.' };
    }

    var user = findUserByEmail(normalized);
    if (!user) {
      return { success: false, message: 'Email không tồn tại.', invalidField: 'email' };
    }

    if (String(user.password) !== pwd) {
      return { success: false, message: 'Mật khẩu không đúng.', invalidField: 'password' };
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user: user };
  }

  function logout() { //Xử lý đăng xuất của người dùng. Hàm này sẽ xóa thông tin người dùng hiện tại khỏi sessionStorage, do đó kết thúc phiên đăng nhập của người dùng. Sau khi xóa thông tin đăng nhập, nó sẽ chuyển hướng người dùng trở lại trang đăng nhập (login.html) để họ có thể đăng nhập lại nếu muốn.
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }

  function bindLogoutButtons() { //Liên kết sự kiện click cho các nút đăng xuất trên trang. Hàm này sẽ tìm tất cả các phần tử có id "logoutBtn" hoặc có thuộc tính data-logout="true" và thêm một trình xử lý sự kiện click cho mỗi phần tử đó. Khi người dùng nhấp vào bất kỳ nút nào trong số này, hàm logout sẽ được gọi để thực hiện quá trình đăng xuất.
    var buttons = document.querySelectorAll('#logoutBtn, [data-logout="true"]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        logout();
      });
    });
  }

  function getCurrentUser() { //Lấy thông tin người dùng hiện tại từ sessionStorage. Hàm này cố gắng đọc dữ liệu người dùng đã đăng nhập từ sessionStorage và chuyển đổi từ JSON sang đối tượng JavaScript. Nếu có lỗi (ví dụ: dữ liệu không hợp lệ hoặc không tồn tại), nó sẽ trả về null. Nếu thành công, nó sẽ trả về đối tượng người dùng hiện tại.
    try {
      var raw = sessionStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function redirectByRole(user) { //Chuyển hướng người dùng đến trang phù hợp dựa trên vai trò của họ. Hàm này nhận một đối tượng người dùng và kiểm tra thuộc tính role của người đó để xác định trang nào họ nên được chuyển hướng đến. Nếu vai trò là "admin", họ sẽ được chuyển hướng đến admin.html; nếu vai trò là "recruiter", họ sẽ được chuyển hướng đến recruiter.html; nếu vai trò là "candidate", họ sẽ được chuyển hướng đến candidate.html. Nếu không có vai trò hợp lệ hoặc người dùng không tồn tại, họ sẽ được chuyển hướng trở lại trang chủ (index.html).
    if (!user || !user.role) {
      window.location.href = 'index.html';
      return;
    }

    if (user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }

    if (user.role === 'recruiter') {
      window.location.href = 'recruiter.html';
      return;
    }

    if (user.role === 'candidate') {
      window.location.href = 'candidate.html';
      return;
    }

    window.location.href = 'index.html';
  }
 
  function checkLogin() { //Kiểm tra xem người dùng đã đăng nhập hay chưa. Hàm này gọi getCurrentUser để lấy thông tin người dùng hiện tại. Nếu không có người dùng nào được đăng nhập (tức là getCurrentUser trả về null), nó sẽ chuyển hướng người dùng đến trang đăng nhập (login.html) và trả về null. Nếu có người dùng đã đăng nhập, nó sẽ trả về đối tượng người dùng đó.
    var user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  function checkRole(requiredRole) { //Kiểm tra xem người dùng đã đăng nhập có vai trò phù hợp hay không. Hàm này gọi checkLogin để đảm bảo rằng người dùng đã đăng nhập và lấy thông tin người dùng hiện tại. Nếu người dùng chưa đăng nhập, checkLogin sẽ chuyển hướng họ đến trang đăng nhập và trả về null. Nếu người dùng đã đăng nhập nhưng vai trò của họ không khớp với requiredRole được yêu cầu, hàm sẽ gọi redirectByRole để chuyển hướng người dùng đến trang phù hợp với vai trò của họ và trả về null. Nếu người dùng đã đăng nhập và có vai trò phù hợp, hàm sẽ trả về đối tượng người dùng đó.
    var user = checkLogin();
    if (!user) {
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      redirectByRole(user);
      return null;
    }

    return user;
  }

  function enforceRecruiterRoute() { //Đảm bảo rằng chỉ những người dùng có vai trò "recruiter" mới có thể truy cập trang recruiter.html. Hàm này kiểm tra đường dẫn hiện tại của trang và nếu nó kết thúc bằng "recruiter.html", nó sẽ gọi getCurrentUser để lấy thông tin người dùng hiện tại. Nếu không có người dùng nào được đăng nhập hoặc vai trò của người dùng không phải là "recruiter", hàm sẽ chuyển hướng người dùng đến trang đăng nhập (login.html). Điều này giúp bảo vệ trang recruiter.html khỏi việc truy cập trái phép bởi những người dùng không phải là nhà tuyển dụng.
    var path = String(window.location.pathname || '').toLowerCase();
    if (!path.endsWith('recruiter.html')) {
      return;
    }

    var user = getCurrentUser();
    if (!user || user.role !== 'recruiter') {
      window.location.href = 'login.html';
    }
  }

  function resetPasswordByEmail(email, otp, newPassword) {//Đặt lại mật khẩu cho người dùng dựa trên địa chỉ email, mã OTP và mật khẩu mới. Hàm này nhận ba tham số: email của người dùng, mã OTP và mật khẩu mới. Nó sẽ chuẩn hóa email và kiểm tra tính hợp lệ của dữ liệu đầu vào. Nếu có lỗi, nó sẽ trả về một đối tượng với thuộc tính success là false và thông báo lỗi tương ứng. Nếu mã OTP không đúng (trong trường hợp này, mã OTP cố định là "123456"), nó sẽ trả về lỗi. Nếu email không tồn tại trong hệ thống, nó cũng sẽ trả về lỗi. Nếu tất cả các điều kiện đều hợp lệ, hàm sẽ cập nhật mật khẩu mới cho người dùng trong localStorage và trả về một đối tượng với thuộc tính success là true.
    var normalized = normalizeEmail(email);
    if (!normalized || !otp || !newPassword) {
      return { success: false, message: 'Vui lòng điển đầy đủ thông tin.' };
    }

    if (String(otp).trim() !== _lastOtp) {
      return { success: false, message: 'OTP không đúng.' };
    }

    var users = getUsers();
    var index = users.findIndex(function (u) {
      return normalizeEmail(u.email) === normalized;
    });

    if (index < 0) {
      return { success: false, message: 'Email không tồn tại.' };
    }

    users[index].password = String(newPassword).trim();
    saveUsers(users);
    return { success: true };
  }

  window.Auth = { //Đóng gói tất cả các hàm liên quan đến xác thực và quản lý người dùng vào một đối tượng duy nhất có tên Auth. Điều này giúp tổ chức mã nguồn tốt hơn và dễ dàng truy cập các chức năng liên quan đến người dùng từ bất kỳ đâu trong ứng dụng.
    getUsers: getUsers,
    saveUsers: saveUsers,
    getJobs: getJobs,
    getApplications: getApplications,
    findUserByEmail: findUserByEmail,
    emailExists: emailExists,
    calculateAge: calculateAge,
    registerCandidate: registerCandidate,
    registerRecruiter: registerRecruiter,
    sendOtpMock: sendOtpMock,
    _lastOtp: function() { return _lastOtp; },
    login: login,
    logout: logout,
    bindLogoutButtons: bindLogoutButtons,
    getCurrentUser: getCurrentUser,
    redirectByRole: redirectByRole,
    checkLogin: checkLogin,
    checkRole: checkRole,
    enforceRecruiterRoute: enforceRecruiterRoute,
    resetPasswordByEmail: resetPasswordByEmail
  };

  enforceRecruiterRoute(); //Gọi hàm enforceRecruiterRoute ngay khi script được tải để đảm bảo rằng chỉ những người dùng có vai trò "recruiter" mới có thể truy cập trang recruiter.html. Nếu người dùng không phải là nhà tuyển dụng hoặc chưa đăng nhập, họ sẽ được chuyển hướng đến trang đăng nhập (login.html).

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLogoutButtons);
  } else {
    bindLogoutButtons();
  }
})();
