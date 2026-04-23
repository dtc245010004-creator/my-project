(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  function createRecruiterProfileApi(deps) {
    function renderSettingsOverview() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!recruiter) {
        return;
      }

      if (deps.el.settingsDisplayName) {
        deps.el.settingsDisplayName.textContent = recruiter.name || recruiter.company || 'Recruiter';
      }
      if (deps.el.settingsDisplayCompany) {
        deps.el.settingsDisplayCompany.textContent = recruiter.company || recruiter.name || 'Dang cap nhat';
      }
      if (deps.el.settingsDisplayEmail) {
        deps.el.settingsDisplayEmail.textContent = recruiter.email || 'Dang cap nhat';
      }
      if (deps.el.settingsDisplayPhone) {
        deps.el.settingsDisplayPhone.textContent = recruiter.phone || 'Chua cap nhat';
      }
    }

    function updateRecruiterProfileUI() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!recruiter) {
        return;
      }

      var displayName = recruiter.company || recruiter.name || 'Recruiter Workspace';
      var subText = [recruiter.email, recruiter.phone].filter(Boolean).join(' • ');

      if (deps.el.companyName) {
        deps.el.companyName.textContent = displayName;
      }

      if (deps.el.companySub) {
        deps.el.companySub.textContent = subText || 'Recruiter Workspace';
      }

      if (deps.el.companyLogo) {
        deps.el.companyLogo.textContent = deps.buildAvatarFromName(displayName);
      }
    }

    function openAccountSettingsModal() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!deps.el.accountSettingsBackdrop || !recruiter) {
        return;
      }

      if (deps.el.accountSettingsTitle) {
        deps.el.accountSettingsTitle.textContent = 'Cài đặt tài khoản';
      }

      if (deps.el.accountName) deps.el.accountName.value = recruiter.name || recruiter.company || '';
      if (deps.el.accountCompany) deps.el.accountCompany.value = recruiter.company || recruiter.name || '';
      if (deps.el.accountEmail) deps.el.accountEmail.value = recruiter.email || '';
      if (deps.el.accountPhone) deps.el.accountPhone.value = recruiter.phone || '';
      if (deps.el.accountCurrentPassword) deps.el.accountCurrentPassword.value = '';
      if (deps.el.accountNewPassword) deps.el.accountNewPassword.value = '';
      if (deps.el.accountConfirmPassword) deps.el.accountConfirmPassword.value = '';

      deps.el.accountSettingsBackdrop.style.display = 'flex';
    }

    function closeAccountSettingsModal() {
      if (!deps.el.accountSettingsBackdrop) {
        return;
      }

      deps.el.accountSettingsBackdrop.style.display = 'none';
    }

    function submitAccountSettings() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!recruiter) {
        return;
      }

      var name = deps.el.accountName ? String(deps.el.accountName.value || '').trim() : '';
      var company = deps.el.accountCompany ? String(deps.el.accountCompany.value || '').trim() : '';
      var email = deps.el.accountEmail ? String(deps.el.accountEmail.value || '').trim() : '';
      var phone = deps.el.accountPhone ? String(deps.el.accountPhone.value || '').trim() : '';
      var currentPassword = deps.el.accountCurrentPassword ? String(deps.el.accountCurrentPassword.value || '').trim() : '';
      var newPassword = deps.el.accountNewPassword ? String(deps.el.accountNewPassword.value || '').trim() : '';
      var confirmPassword = deps.el.accountConfirmPassword ? String(deps.el.accountConfirmPassword.value || '').trim() : '';

      if (!name || !company || !email) {
        deps.showToast('Vui lòng nhập đầy đủ họ tên, công ty và email.', 'error');
        return;
      }

      if (String(recruiter.password || '').trim() !== currentPassword) {
        deps.showToast('Mật khẩu hiện tại không đúng.', 'error');
        return;
      }

      if (newPassword || confirmPassword) {
        if (!newPassword || !confirmPassword) {
          deps.showToast('Vui lòng nhập và xác nhận mật khẩu mới.', 'error');
          return;
        }

        if (newPassword !== confirmPassword) {
          deps.showToast('Mật khẩu mới không khớp.', 'error');
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

      deps.state.users = deps.getStoredUsers().map(function (user) {
        if (Number(user.id) === Number(updatedUser.id)) {
          return updatedUser;
        }
        return user;
      });

      if (!deps.state.users.some(function (user) {
        return Number(user.id) === Number(updatedUser.id);
      })) {
        deps.state.users.push(updatedUser);
      }

      deps.state.jobs = deps.state.jobs.map(function (job) {
        if (Number(job.recruiterId) !== Number(updatedUser.id) && deps.normalize(job.recruiterEmail) !== deps.normalize(oldEmail)) {
          return job;
        }

        return Object.assign({}, job, {
          company: company,
          recruiterName: name,
          recruiterEmail: email
        });
      });

      deps.writeJson('users', deps.state.users);
      deps.writeCollection(deps.STORAGE.JOBS, deps.STORAGE.LEGACY_JOBS, deps.state.jobs);
      deps.persistLoggedInUser(updatedUser);
      updateRecruiterProfileUI();
      deps.renderJobTable();
      deps.populateInterviewJobFilter();
      deps.renderInterviewList();
      deps.updateStats();
      deps.renderRecentActivities();
      deps.renderTrendBars();
      closeAccountSettingsModal();
      deps.showToast('Đã cập nhật thông tin tài khoản.', 'success');
    }

    return {
      renderSettingsOverview: renderSettingsOverview,
      updateRecruiterProfileUI: updateRecruiterProfileUI,
      openAccountSettingsModal: openAccountSettingsModal,
      closeAccountSettingsModal: closeAccountSettingsModal,
      submitAccountSettings: submitAccountSettings
    };
  }

  window.RecruiterModules.Profile = {
    createRecruiterProfileApi: createRecruiterProfileApi
  };
})();