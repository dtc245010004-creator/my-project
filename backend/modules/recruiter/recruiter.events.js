(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  function createRecruiterEventsApi(deps) {
    function bindEvents() {
      if (deps.el.jobTableBody) {
        deps.el.jobTableBody.addEventListener('click', function (event) {
          var btn = event.target.closest('button[data-action]');
          if (!btn) return;

          var action = btn.getAttribute('data-action');
          var id = Number(btn.getAttribute('data-id'));

          if (action === 'toggle-job') {
            deps.toggleJobStatus(id);
          }

          if (action === 'delete-job') {
            deps.deleteJob(id);
          }
        });
      }

      if (deps.el.applicantList) {
        deps.el.applicantList.addEventListener('click', function (event) {
          var btn = event.target.closest('button[data-app-action]');
          if (!btn) return;

          var action = btn.getAttribute('data-app-action');
          var id = Number(btn.getAttribute('data-id'));

          if (action === 'approve') {
            deps.updateApplicationStatus(id, 'approved');
          }

          if (action === 'view-cv') {
            deps.showCandidateCv(id);
          }

          if (action === 'invite') {
            deps.openInviteModal(id);
          }

          if (action === 'delete') {
            deps.deleteApplication(id);
          }
        });
      }

      if (deps.el.interviewList) {
        deps.el.interviewList.addEventListener('click', function (event) {
          var btn = event.target.closest('button[data-interview-action]');
          if (!btn) return;

          var action = btn.getAttribute('data-interview-action');
          var id = Number(btn.getAttribute('data-id'));

          if (action === 'view-cv') {
            deps.showCandidateCv(id);
          }

          if (action === 'done') {
            deps.updateInterviewStatus(id, 'done');
          }

          if (action === 'canceled') {
            deps.updateInterviewStatus(id, 'canceled');
          }

          if (action === 'delete') {
            deps.deleteInterview(id);
          }
        });
      }

      if (deps.el.topSearchInput) {
        deps.el.topSearchInput.addEventListener('input', function () {
          deps.state.topKeyword = String(deps.el.topSearchInput.value || '').trim();
          deps.applyTopSearch();
        });
      }

      if (deps.el.applicantSearch) {
        deps.el.applicantSearch.addEventListener('input', function () {
          deps.filterApplicants();
        });
      }

      if (deps.el.applicantStatusFilter) {
        deps.el.applicantStatusFilter.addEventListener('change', function () {
          deps.filterApplicants();
        });
      }

      if (deps.el.applicantTimeFilter) {
        deps.el.applicantTimeFilter.addEventListener('change', function () {
          deps.filterApplicants();
        });
      }

      if (deps.el.applicantJobSelect) {
        deps.el.applicantJobSelect.addEventListener('change', function () {
          var jobId = Number(deps.el.applicantJobSelect.value);
          if (jobId) {
            deps.openApplicantPanel(jobId);
          }
        });
      }

      if (deps.el.interviewSearch) {
        deps.el.interviewSearch.addEventListener('input', function () {
          deps.state.interviewKeyword = String(deps.el.interviewSearch.value || '').trim();
          deps.renderInterviewList();
        });
      }

      if (deps.el.interviewJobFilter) {
        deps.el.interviewJobFilter.addEventListener('change', function () {
          deps.state.interviewJobId = String(deps.el.interviewJobFilter.value || 'all');
          deps.renderInterviewList();
        });
      }

      if (deps.el.interviewStatusFilter) {
        deps.el.interviewStatusFilter.addEventListener('change', function () {
          deps.state.interviewStatus = String(deps.el.interviewStatusFilter.value || 'all');
          deps.renderInterviewList();
        });
      }

      if (deps.el.interviewDateFilter) {
        deps.el.interviewDateFilter.addEventListener('change', function () {
          deps.state.interviewDate = String(deps.el.interviewDateFilter.value || 'all');
          deps.renderInterviewList();
        });
      }

      if (deps.el.btnOpenCreate) deps.el.btnOpenCreate.addEventListener('click', deps.openCreateModal);
      if (deps.el.btnOpenWallet) deps.el.btnOpenWallet.addEventListener('click', deps.openWalletModal);
      if (deps.el.btnOpenAccountSettingsInline) deps.el.btnOpenAccountSettingsInline.addEventListener('click', deps.openAccountSettingsModal);
      if (deps.el.btnOpenWalletInline) deps.el.btnOpenWalletInline.addEventListener('click', deps.openWalletModal);
      if (deps.el.createModalClose) deps.el.createModalClose.addEventListener('click', deps.closeCreateModal);
      if (deps.el.createModalCancel) deps.el.createModalCancel.addEventListener('click', deps.closeCreateModal);
      if (deps.el.createModalSave) deps.el.createModalSave.addEventListener('click', deps.submitCreateJob);

      if (deps.el.accountSettingsClose) deps.el.accountSettingsClose.addEventListener('click', deps.closeAccountSettingsModal);
      if (deps.el.accountSettingsCancel) deps.el.accountSettingsCancel.addEventListener('click', deps.closeAccountSettingsModal);
      if (deps.el.accountSettingsSave) deps.el.accountSettingsSave.addEventListener('click', deps.submitAccountSettings);
      if (deps.el.walletModalClose) deps.el.walletModalClose.addEventListener('click', deps.closeWalletModal);
      if (deps.el.walletModalCancel) deps.el.walletModalCancel.addEventListener('click', deps.closeWalletModal);
      if (deps.el.walletModalSave) deps.el.walletModalSave.addEventListener('click', deps.closeWalletModal);
      if (deps.el.btnGenerateQr) deps.el.btnGenerateQr.addEventListener('click', deps.handleGenerateQr);
      if (deps.el.btnCreateDeposit) deps.el.btnCreateDeposit.addEventListener('click', deps.createDepositRequest);

      if (deps.el.depositAmount) {
        deps.el.depositAmount.addEventListener('input', function () {
          // format while preserving caret
          if (typeof deps.formatVndInput === 'function') {
            deps.formatVndInput(deps.el.depositAmount);
          } else {
            var normalized = deps.formatCurrency(deps.parseVndAmount(deps.el.depositAmount.value));
            deps.el.depositAmount.value = normalized;
          }
          deps.updateGenerateQrState();
          if (deps.el.walletStep2 && !deps.el.walletStep2.classList.contains('hidden')) {
            deps.renderWalletQr();
          }
        });
      }

      if (deps.el.inviteModalClose) deps.el.inviteModalClose.addEventListener('click', deps.closeInviteModal);
      if (deps.el.inviteModalCancel) deps.el.inviteModalCancel.addEventListener('click', deps.closeInviteModal);
      if (deps.el.inviteModalSend) deps.el.inviteModalSend.addEventListener('click', deps.submitInvite);

      if (deps.el.createModalBackdrop) {
        deps.el.createModalBackdrop.addEventListener('click', function (event) {
          if (event.target === deps.el.createModalBackdrop) {
            deps.closeCreateModal();
          }
        });
      }

      var recruiterContactSendEl = document.getElementById('recruiterContactSend');
      if (recruiterContactSendEl) {
        recruiterContactSendEl.addEventListener('click', function () {
          if (deps.submitAdminContact) {
            deps.submitAdminContact();
          }
        });
      }

      if (deps.el.inviteModalBackdrop) {
        deps.el.inviteModalBackdrop.addEventListener('click', function (event) {
          if (event.target === deps.el.inviteModalBackdrop) {
            deps.closeInviteModal();
          }
        });
      }

      if (deps.el.walletModalBackdrop) {
        deps.el.walletModalBackdrop.addEventListener('click', function (event) {
          var copyButton = event.target.closest('[data-copy-target]');
          if (copyButton) {
            deps.copyWalletValue(copyButton.getAttribute('data-copy-target'));
            return;
          }

          if (event.target === deps.el.walletModalBackdrop) {
            deps.closeWalletModal();
          }
        });
      }

      if (deps.el.accountSettingsBackdrop) {
        deps.el.accountSettingsBackdrop.addEventListener('click', function (event) {
          if (event.target === deps.el.accountSettingsBackdrop) {
            deps.closeAccountSettingsModal();
          }
        });
      }

      Array.prototype.forEach.call(deps.el.menuLinks, function (link, idx) {
        link.addEventListener('click', function (event) {
          event.preventDefault();
          deps.sidebarNavigate(idx);
        });
      });

      if (deps.el.btnLogout) {
        deps.el.btnLogout.addEventListener('click', function () {
          sessionStorage.removeItem('currentUser');
          window.location.href = 'login.html';
        });
      }

      window.addEventListener('storage', function () {
        deps.state.jobs = deps.readCollection(deps.STORAGE.JOBS, deps.STORAGE.LEGACY_JOBS);
        deps.state.applications = deps.readCollection(deps.STORAGE.APPLICATIONS, deps.STORAGE.LEGACY_APPLICATIONS);
        deps.state.interviews = deps.readJson(deps.STORAGE.INTERVIEWS, []);
        deps.renderJobTable();
        deps.populateInterviewJobFilter();
        deps.updateStats();
        deps.renderRecentActivities();
        deps.renderTrendBars();
        deps.renderInterviewList();
      });
    }

    function init() {
      if (!deps.loadState()) return;

      deps.ensureInviteLocationField();
      deps.ensureCvModal();
      deps.populateApplicantJobSelect();
      deps.populateInterviewJobFilter();
      deps.renderJobTable();
      deps.updateStats();
      deps.renderRecentActivities();
      deps.renderTrendBars();
      deps.renderInterviewList();
      deps.updateRecruiterProfileUI();
      deps.renderSettingsOverview();
      bindEvents();
      deps.setVisibleView('overview');
      deps.sidebarNavigate(0);
    }

    return {
      bindEvents: bindEvents,
      init: init
    };
  }

  window.RecruiterModules.Events = {
    createRecruiterEventsApi: createRecruiterEventsApi
  };
})();