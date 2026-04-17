(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  function createRecruiterCoreApi() {
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

    function readJson(key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    function writeJson(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    function readCollection(sharedKey, legacyKey) {
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

    function writeCollection(sharedKey, legacyKey, value) {
      writeJson(sharedKey, value);
      writeJson(legacyKey, value);
    }

    function normalize(text) {
      return String(text || '').trim().toLowerCase();
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getCurrentUser() {
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

    function getStoredUsers() {
      var users = readJson('users', []);
      return Array.isArray(users) ? users : [];
    }

    function getAdminContacts() {
      var items = readJson('ADMIN_CONTACTS', []);
      return Array.isArray(items) ? items : [];
    }

    function saveAdminContacts(items) {
      writeJson('ADMIN_CONTACTS', items);
    }

    function getStoredUserRecord() {
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

    function persistLoggedInUser(updatedUser) {
      state.recruiter = updatedUser;
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    function buildAvatarFromName(name) {
      var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
      if (!parts.length) {
        return 'RC';
      }

      var first = parts[0].charAt(0);
      var second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : (parts[0].charAt(1) || 'C');
      return (first + second).toUpperCase().slice(0, 2);
    }

    function formatDate(dateText) {
      var date = new Date(dateText + 'T00:00:00');
      if (Number.isNaN(date.getTime())) {
        return dateText || 'N/A';
      }
      var dd = String(date.getDate()).padStart(2, '0');
      var mm = String(date.getMonth() + 1).padStart(2, '0');
      var yy = date.getFullYear();
      return dd + '/' + mm + '/' + yy;
    }

    function formatDateTime(value) {
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return 'Không rõ thời gian';
      }
      return date.toLocaleString('vi-VN');
    }

    function formatCurrency(amount) {
      return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
    }

    function parseVndAmount(rawValue) {
      return Number(String(rawValue || '').replace(/[^\d]/g, '')) || 0;
    }

    function getLocalDateKey(value) {
      var date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      var y = date.getFullYear();
      var m = String(date.getMonth() + 1).padStart(2, '0');
      var d = String(date.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    function showToast(message, type) {
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

    function submitAdminContact() {
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

    return {
      STORAGE: STORAGE,
      QR_PAYMENT_INFO: QR_PAYMENT_INFO,
      FEATURED_PIN_FEE: FEATURED_PIN_FEE,
      COMMISSION_PER_APPROVED_FEE: COMMISSION_PER_APPROVED_FEE,
      state: state,
      el: el,
      readJson: readJson,
      writeJson: writeJson,
      readCollection: readCollection,
      writeCollection: writeCollection,
      normalize: normalize,
      escapeHtml: escapeHtml,
      getCurrentUser: getCurrentUser,
      getStoredUsers: getStoredUsers,
      getAdminContacts: getAdminContacts,
      saveAdminContacts: saveAdminContacts,
      getStoredUserRecord: getStoredUserRecord,
      persistLoggedInUser: persistLoggedInUser,
      buildAvatarFromName: buildAvatarFromName,
      formatDate: formatDate,
      formatDateTime: formatDateTime,
      formatCurrency: formatCurrency,
      parseVndAmount: parseVndAmount,
      getLocalDateKey: getLocalDateKey,
      showToast: showToast,
      submitAdminContact: submitAdminContact
    };
  }

  window.RecruiterModules.Core = {
    createRecruiterCoreApi: createRecruiterCoreApi
  };
})();