initializeData(false);

var loginForm = document.getElementById('login-form');
var emailInput = document.getElementById('login-email');
var passwordInput = document.getElementById('login-password');
var toggleLoginPasswordBtn = document.getElementById('toggle-login-password');
var termsLink = document.getElementById('terms-link');
var privacyLink = document.getElementById('privacy-link');
var policyModal = document.getElementById('policy-modal');
var policyTitle = document.getElementById('policy-title');
var policyContent = document.getElementById('policy-content');
var policyClose = document.getElementById('policy-close');

function openPolicyModal(type) {
  if (type === 'privacy') {
    policyTitle.textContent = 'Chính sách bảo mật';
    policyContent.innerHTML = [
      '<p>1. Chúng tôi chỉ thu thập thông tin cần thiết để vận hành tài khoản và kết nối tuyển dụng.</p>',
      '<p>2. Dữ liệu đăng nhập và hồ sơ ứng tuyển được lưu trữ theo phạm vi hệ thống demo, không chia sẻ công khai nếu không có sự đồng ý của bạn.</p>',
      '<p>3. Bạn có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân theo chính sách của nền tảng.</p>',
      '<p>4. Người dùng chịu trách nhiệm với nội dung đã nhập và cần bảo mật thông tin tài khoản của mình.</p>'
    ].join('');
  } else {
    policyTitle.textContent = 'Điều khoản sử dụng';
    policyContent.innerHTML = [
      '<p>1. Người dùng cam kết cung cấp thông tin trung thực khi đăng ký và đăng nhập.</p>',
      '<p>2. Không sử dụng hệ thống để đăng tải nội dung sai sự thật, vi phạm pháp luật hoặc xâm phạm quyền lợi của bên thứ ba.</p>',
      '<p>3. Mọi hành vi vi phạm có thể bị khóa tài khoản và xử lý theo quy định pháp luật hiện hành.</p>',
      '<p>4. Việc tiếp tục đăng nhập đồng nghĩa bạn đã đọc và đồng ý với các điều khoản trên.</p>'
    ].join('');
  }

  policyModal.classList.remove('hidden');
  policyModal.classList.add('flex');
}

function closePolicyModal() {
  policyModal.classList.add('hidden');
  policyModal.classList.remove('flex');
}

termsLink.addEventListener('click', function () {
  openPolicyModal('terms');
});

privacyLink.addEventListener('click', function () {
  openPolicyModal('privacy');
});

policyClose.addEventListener('click', closePolicyModal);

policyModal.addEventListener('click', function (event) {
  if (event.target === policyModal) {
    closePolicyModal();
  }
});

function hideErrors() {
  document.getElementById('err-email').classList.add('hidden');
  document.getElementById('err-password').classList.add('hidden');
}

function showError(id, text) {
  var el = document.getElementById(id);
  el.textContent = text;
  el.classList.remove('hidden');
}

if (toggleLoginPasswordBtn) {
  toggleLoginPasswordBtn.addEventListener('click', function () {
    var showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    toggleLoginPasswordBtn.setAttribute('aria-pressed', showing ? 'false' : 'true');
    toggleLoginPasswordBtn.setAttribute('aria-label', showing ? 'Hiển thị mật khẩu' : 'Ẩn mật khẩu');
    toggleLoginPasswordBtn.textContent = showing ? '👁' : '🙈';
  });
}

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  hideErrors();

  var result = Auth.login(emailInput.value, passwordInput.value);
  if (!result.success) {
    if (result.invalidField === 'email') {
      showError('err-email', result.message);
    } else if (result.invalidField === 'password') {
      showError('err-password', result.message);
    } else {
      showError('err-email', result.message);
    }
    return;
  }

  Auth.redirectByRole(result.user);
});

var modal = document.getElementById('forgot-modal');
var step1 = document.getElementById('forgot-step-1');
var step2 = document.getElementById('forgot-step-2');
var resetEmail = '';

document.getElementById('forgot-password-link').addEventListener('click', function () {
  document.getElementById('fp-err-1').classList.add('hidden');
  document.getElementById('fp-err-2').classList.add('hidden');
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
});

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  step1.reset();
  step2.reset();
}

document.getElementById('fp-close-1').addEventListener('click', closeModal);
document.getElementById('fp-close-2').addEventListener('click', closeModal);

step1.addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('fp-email').value.trim();
  var user = Auth.findUserByEmail(email);
  if (!user) {
    var err = document.getElementById('fp-err-1');
    err.textContent = 'Email khong ton tai.';
    err.classList.remove('hidden');
    return;
  }

  resetEmail = email;
  Auth.sendOtpMock();
  document.getElementById('fp-err-1').classList.add('hidden');
  step1.classList.add('hidden');
  step2.classList.remove('hidden');
});

step2.addEventListener('submit', function (e) {
  e.preventDefault();
  var otp = document.getElementById('fp-otp').value.trim();
  var nextPassword = document.getElementById('fp-new-password').value.trim();
  var result = Auth.resetPasswordByEmail(resetEmail, otp, nextPassword);
  if (!result.success) {
    var err = document.getElementById('fp-err-2');
    err.textContent = result.message;
    err.classList.remove('hidden');
    return;
  }

  alert('Cap nhat mat khau thanh cong. Moi ban dang nhap lai.');
  closeModal();
  emailInput.value = resetEmail;
  passwordInput.focus();
});
