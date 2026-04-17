initializeData(false);

var activeRole = 'candidate';
var pendingPayload = null;

var candidateBtn = document.getElementById('role-candidate');
var recruiterBtn = document.getElementById('role-recruiter');
var candidateForm = document.getElementById('candidate-form');
var recruiterForm = document.getElementById('recruiter-form');
var registerAgree = document.getElementById('register-agree');
var registerTermsLink = document.getElementById('register-terms-link');
var registerPrivacyLink = document.getElementById('register-privacy-link');
var policyModal = document.getElementById('policy-modal');
var policyTitle = document.getElementById('policy-title');
var policyContent = document.getElementById('policy-content');
var policyClose = document.getElementById('policy-close');

function setRole(role) {
  activeRole = role;
  var candidateActive = role === 'candidate';

  candidateForm.classList.toggle('hidden', !candidateActive);
  recruiterForm.classList.toggle('hidden', candidateActive);

  candidateBtn.className = candidateActive
    ? 'auth-toggle auth-toggle-active rounded-xl border-2 px-4 py-2.5 font-semibold'
    : 'auth-toggle auth-toggle-inactive rounded-xl border-2 px-4 py-2.5 font-semibold';
  recruiterBtn.className = candidateActive
    ? 'auth-toggle auth-toggle-inactive rounded-xl border-2 px-4 py-2.5 font-semibold'
    : 'auth-toggle auth-toggle-active rounded-xl border-2 px-4 py-2.5 font-semibold';
}

candidateBtn.addEventListener('click', function () { setRole('candidate'); });
recruiterBtn.addEventListener('click', function () { setRole('recruiter'); });

function openPolicyModal(type) {
  if (type === 'privacy') {
    policyTitle.textContent = 'Chính sách bảo mật';
    policyContent.innerHTML = [
      '<p>1. Chúng tôi chỉ thu thập các thông tin cần thiết cho quá trình đăng ký, xác thực tài khoản và kết nối tuyển dụng.</p>',
      '<p>2. Dữ liệu tài khoản và hồ sơ ứng tuyển được lưu trữ trong phạm vi hệ thống demo, không chia sẻ trái phép cho bên thứ ba.</p>',
      '<p>3. Bạn có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân theo chính sách của nền tảng.</p>',
      '<p>4. Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và nội dung đã cung cấp.</p>'
    ].join('');
  } else {
    policyTitle.textContent = 'Điều khoản đăng ký';
    policyContent.innerHTML = [
      '<p>1. Người dùng cam kết cung cấp thông tin chính xác, hợp lệ khi tạo tài khoản.</p>',
      '<p>2. Không sử dụng hệ thống để đăng tải nội dung sai sự thật, gian lận hoặc vi phạm pháp luật.</p>',
      '<p>3. Tài khoản vi phạm có thể bị tạm khóa hoặc chấm dứt theo chính sách của nền tảng.</p>',
      '<p>4. Việc hoàn tất đăng ký đồng nghĩa bạn đã đọc và đồng ý với các điều khoản nêu trên.</p>'
    ].join('');
  }

  policyModal.classList.remove('hidden');
  policyModal.classList.add('flex');
}

function closePolicyModal() {
  policyModal.classList.add('hidden');
  policyModal.classList.remove('flex');
}

registerTermsLink.addEventListener('click', function () {
  openPolicyModal('terms');
});

registerPrivacyLink.addEventListener('click', function () {
  openPolicyModal('privacy');
});

policyClose.addEventListener('click', closePolicyModal);

policyModal.addEventListener('click', function (event) {
  if (event.target === policyModal) {
    closePolicyModal();
  }
});

function validateAgreement() {
  if (!registerAgree.checked) {
    showRegisterError('Vui lòng đồng ý Điều khoản đăng ký và Chính sách bảo mật trước khi tiếp tục.');
    return false;
  }

  return true;
}

function showRegisterError(text) {
  var el = document.getElementById('register-error');
  el.textContent = text;
  el.classList.remove('hidden');
}

function clearRegisterError() {
  document.getElementById('register-error').classList.add('hidden');
}

function openOtpModal() {
  document.getElementById('otp-error').classList.add('hidden');
  document.getElementById('otp-input').value = '';
  var modal = document.getElementById('otp-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('otp-input').focus();
}

function closeOtpModal() {
  var modal = document.getElementById('otp-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  pendingPayload = null;
}

document.getElementById('otp-cancel').addEventListener('click', closeOtpModal);

candidateForm.addEventListener('submit', function (e) {
  e.preventDefault();
  clearRegisterError();

  if (!validateAgreement()) {
    return;
  }

  pendingPayload = {
    role: 'candidate',
    name: document.getElementById('candidate-name').value.trim(),
    email: document.getElementById('candidate-email').value.trim(),
    password: document.getElementById('candidate-password').value.trim(),
    birthDate: document.getElementById('candidate-birthdate').value,
    location: document.getElementById('candidate-location').value.trim()
  };

  if (Auth.calculateAge(pendingPayload.birthDate) < 16) {
    alert('Duoi 16 tuoi khong the dang ky.');
    return;
  }

  if (Auth.emailExists(pendingPayload.email)) {
    showRegisterError('Email da ton tai. Vui long dung email khac.');
    return;
  }

  Auth.sendOtpMock();
  openOtpModal();
});

recruiterForm.addEventListener('submit', function (e) {
  e.preventDefault();
  clearRegisterError();

  if (!validateAgreement()) {
    return;
  }

  pendingPayload = {
    role: 'recruiter',
    companyName: document.getElementById('recruiter-company').value.trim(),
    email: document.getElementById('recruiter-email').value.trim(),
    phone: document.getElementById('recruiter-phone').value.trim(),
    password: document.getElementById('recruiter-password').value.trim()
  };

  if (Auth.emailExists(pendingPayload.email)) {
    showRegisterError('Email da ton tai. Vui long dung email khac.');
    return;
  }

  Auth.sendOtpMock();
  openOtpModal();
});

document.getElementById('otp-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var otp = document.getElementById('otp-input').value.trim();
  if (otp !== '123456') {
    var otpErr = document.getElementById('otp-error');
    otpErr.textContent = 'OTP khong dung.';
    otpErr.classList.remove('hidden');
    return;
  }

  if (!pendingPayload) {
    closeOtpModal();
    return;
  }

  var result = pendingPayload.role === 'candidate'
    ? Auth.registerCandidate(pendingPayload)
    : Auth.registerRecruiter(pendingPayload);

  if (!result.success) {
    closeOtpModal();
    showRegisterError(result.message || 'Dang ky that bai.');
    return;
  }

  closeOtpModal();
  alert('Dang ky thanh cong. Moi ban dang nhap.');
  window.location.href = 'login.html';
});
