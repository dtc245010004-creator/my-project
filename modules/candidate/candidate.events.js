(function () {
  window.CandidateModules = window.CandidateModules || {};

  function createEventsApi(deps) {
    function showView(viewName) {
      Array.prototype.forEach.call(deps.viewSections, function (section) {
        section.classList.toggle("active", section.id === "view-" + viewName);
      });

      Array.prototype.forEach.call(deps.menuLinks, function (link) {
        link.classList.toggle("active", link.getAttribute("data-view") === viewName);
      });
    }

    function bindSidebarNavigation() {
      Array.prototype.forEach.call(deps.menuLinks, function (link) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          var view = link.getAttribute("data-view");
          if (view === "settings") {
            showView(view);
            deps.closeAccountSettingsModal();
            return;
          }
          showView(view);
        });
      });
    }

    function bindEvents() {
      if (deps.el.searchInputEl) {
        deps.el.searchInputEl.addEventListener("input", deps.renderJobs);
      }

      if (deps.el.filterEl) {
        deps.el.filterEl.addEventListener("change", deps.renderJobs);
      }

      if (deps.el.historySearchInputEl) {
        deps.el.historySearchInputEl.addEventListener("input", deps.renderApplicationHistory);
      }

      if (deps.el.historyDateFilterEl) {
        deps.el.historyDateFilterEl.addEventListener("change", deps.renderApplicationHistory);
      }

      if (deps.el.jobListEl) {
        deps.el.jobListEl.addEventListener("click", function (event) {
          var btn = event.target.closest("button[data-action]");
          if (!btn) {
            return;
          }

          var action = btn.getAttribute("data-action");
          var jobId = Number(btn.getAttribute("data-id"));
          var job = deps.state.jobs.find(function (j) {
            return Number(j.id) === jobId;
          });

          if (!job) {
            return;
          }

          if (action === "detail") {
            deps.openJobDetailModal(job);
            return;
          }

          if (action === "apply") {
            deps.openApplyModal(job);
            return;
          }

          if (action === "favorite") {
            deps.toggleFavorite(jobId);
          }
        });
      }

      if (deps.el.cvListEl) {
        deps.el.cvListEl.addEventListener("click", function (event) {
          var btn = event.target.closest("button[data-cv-action]");
          if (!btn) {
            return;
          }

          var action = btn.getAttribute("data-cv-action");
          var cvId = Number(btn.getAttribute("data-id"));
          deps.handleCvAction(action, cvId);
        });
      }

      if (deps.el.favoriteListEl) {
        deps.el.favoriteListEl.addEventListener("click", function (event) {
          var btn = event.target.closest("button[data-favorite-action]");
          if (!btn) {
            return;
          }

          var action = btn.getAttribute("data-favorite-action");
          var jobId = Number(btn.getAttribute("data-id"));

          if (action === "remove") {
            deps.removeFavoriteByJobId(jobId);
            return;
          }

          if (action === "detail") {
            var job = deps.state.jobs.find(function (j) { return Number(j.id) === Number(jobId); });
            if (job) {
              deps.openJobDetailModal(job);
            }
          }
        });
      }

      if (deps.el.historyListEl) {
        deps.el.historyListEl.addEventListener("click", function (event) {
          var btn = event.target.closest("button[data-history-action]");
          if (!btn) {
            return;
          }

          var action = btn.getAttribute("data-history-action");
          var appId = Number(btn.getAttribute("data-id"));
          if (action === "feedback") {
            var app = deps.state.applications.find(function (item) {
              return Number(item.id) === Number(appId);
            });
            if (app) {
              deps.openRecruiterFeedbackModal(app);
            }
            return;
          }

          if (action === "delete") {
            deps.deleteApplicationHistory(appId);
          }
        });
      }

      if (deps.el.modalCloseEl) {
        deps.el.modalCloseEl.addEventListener("click", deps.closeApplyModal);
      }

      if (deps.el.modalCancelEl) {
        deps.el.modalCancelEl.addEventListener("click", deps.closeApplyModal);
      }

      if (deps.el.modalConfirmEl) {
        deps.el.modalConfirmEl.addEventListener("click", deps.submitApplication);
      }

      if (deps.el.modalBackdropEl) {
        deps.el.modalBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.modalBackdropEl) {
            deps.closeApplyModal();
          }
        });
      }

      if (deps.el.jobDetailCloseEl) {
        deps.el.jobDetailCloseEl.addEventListener("click", deps.closeJobDetailModal);
      }

      if (deps.el.jobDetailCloseBtnEl) {
        deps.el.jobDetailCloseBtnEl.addEventListener("click", deps.closeJobDetailModal);
      }

      if (deps.el.jobDetailBackdropEl) {
        deps.el.jobDetailBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.jobDetailBackdropEl) {
            deps.closeJobDetailModal();
          }
        });
      }

      if (deps.el.jobDetailApplyBtnEl) {
        deps.el.jobDetailApplyBtnEl.addEventListener("click", function () {
          if (!deps.el.jobDetailBackdropEl) {
            return;
          }
          var jobId = Number(deps.el.jobDetailBackdropEl.getAttribute("data-job-id"));
          var job = deps.state.jobs.find(function (j) {
            return Number(j.id) === Number(jobId);
          });
          if (!job) {
            return;
          }
          deps.closeJobDetailModal();
          deps.openApplyModal(job);
        });
      }

      if (deps.el.candidateContactSendEl) {
        deps.el.candidateContactSendEl.addEventListener("click", function () {
          deps.submitAdminContact("candidate", "Candidate");
        });
      }

      var candidateNotificationBtnEl = document.getElementById("candidateNotificationBtn");
      var notificationBackdropEl = document.getElementById("notificationBackdrop");
      var notificationCloseEl = document.getElementById("notificationClose");
      var notificationCloseBtnEl = document.getElementById("notificationCloseBtn");
      var notificationMarkReadEl = document.getElementById("notificationMarkRead");

      if (candidateNotificationBtnEl) {
        candidateNotificationBtnEl.addEventListener("click", deps.openNotificationsModal);
      }

      if (notificationCloseEl) {
        notificationCloseEl.addEventListener("click", deps.closeNotificationsModal);
      }

      if (notificationCloseBtnEl) {
        notificationCloseBtnEl.addEventListener("click", deps.closeNotificationsModal);
      }

      if (notificationMarkReadEl) {
        notificationMarkReadEl.addEventListener("click", function () {
          deps.markCandidateNotificationsRead();
          deps.closeNotificationsModal();
        });
      }

      if (notificationBackdropEl) {
        notificationBackdropEl.addEventListener("click", function (event) {
          if (event.target === notificationBackdropEl) {
            deps.closeNotificationsModal();
          }
        });
      }

      if (deps.el.recruiterFeedbackCloseEl) {
        deps.el.recruiterFeedbackCloseEl.addEventListener("click", deps.closeRecruiterFeedbackModal);
      }

      if (deps.el.recruiterFeedbackCloseBtnEl) {
        deps.el.recruiterFeedbackCloseBtnEl.addEventListener("click", deps.closeRecruiterFeedbackModal);
      }

      if (deps.el.recruiterFeedbackBackdropEl) {
        deps.el.recruiterFeedbackBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.recruiterFeedbackBackdropEl) {
            deps.closeRecruiterFeedbackModal();
          }
        });
      }

      if (deps.el.recruiterFeedbackApplyBtnEl) {
        deps.el.recruiterFeedbackApplyBtnEl.addEventListener("click", function () {
          deps.closeRecruiterFeedbackModal();
          showView("jobs");
        });
      }

      if (deps.el.cvPreviewCloseEl) {
        deps.el.cvPreviewCloseEl.addEventListener("click", deps.closeCvPreviewModal);
      }

      if (deps.el.cvPreviewCloseBtnEl) {
        deps.el.cvPreviewCloseBtnEl.addEventListener("click", deps.closeCvPreviewModal);
      }

      if (deps.el.cvPreviewBackdropEl) {
        deps.el.cvPreviewBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.cvPreviewBackdropEl) {
            deps.closeCvPreviewModal();
          }
        });
      }

      if (deps.el.cvPreviewDownloadBtnEl) {
        deps.el.cvPreviewDownloadBtnEl.addEventListener("click", function () {
          var activePreviewCvId = deps.getActivePreviewCvId();
          if (!activePreviewCvId) {
            return;
          }
          deps.handleCvAction("download", activePreviewCvId);
        });
      }

      if (deps.el.cvEditCloseEl) {
        deps.el.cvEditCloseEl.addEventListener("click", deps.closeCvEditModal);
      }

      if (deps.el.cvEditCancelEl) {
        deps.el.cvEditCancelEl.addEventListener("click", deps.closeCvEditModal);
      }

      if (deps.el.cvEditSaveEl) {
        deps.el.cvEditSaveEl.addEventListener("click", deps.submitCvEdit);
      }

      if (deps.el.cvEditBackdropEl) {
        deps.el.cvEditBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.cvEditBackdropEl) {
            deps.closeCvEditModal();
          }
        });
      }

      if (deps.el.openAccountEditBtn) {
        deps.el.openAccountEditBtn.addEventListener("click", deps.openAccountSettingsModal);
      }

      if (deps.el.accountSettingsCloseEl) {
        deps.el.accountSettingsCloseEl.addEventListener("click", function () {
          deps.closeAccountSettingsModal();
        });
      }

      if (deps.el.accountSettingsCancelEl) {
        deps.el.accountSettingsCancelEl.addEventListener("click", function () {
          deps.closeAccountSettingsModal();
        });
      }

      if (deps.el.accountSettingsSaveEl) {
        deps.el.accountSettingsSaveEl.addEventListener("click", deps.submitAccountSettings);
      }

      if (deps.el.accountSettingsBackdropEl) {
        deps.el.accountSettingsBackdropEl.addEventListener("click", function (event) {
          if (event.target === deps.el.accountSettingsBackdropEl) {
            deps.closeAccountSettingsModal();
          }
        });
      }

      bindSidebarNavigation();

      document.addEventListener("candidate:cvs-changed", function () {
        deps.state.cvs = deps.readJson("candidateCVs", []);
        deps.renderCvList();
      });

      window.addEventListener("storage", function () {
        deps.state.jobs = deps.readJson("jobs", []);
        deps.state.applications = deps.readJson("applications", []);
        deps.state.interviews = deps.readJson("interviews", []);
        deps.state.savedJobs = deps.readJson("savedJobs", []);
        deps.state.user = deps.getCurrentUser() || deps.state.user;
        deps.updateStats();
        deps.renderFavoritesSection();
        deps.renderApplicationHistory();

        deps.updateNotificationBadge();
        deps.renderNotifications();
      });
    }

    return {
      showView: showView,
      bindEvents: bindEvents,
      bindSidebarNavigation: bindSidebarNavigation
    };
  }

  window.CandidateModules.Events = {
    createEventsApi: createEventsApi
  };
})();
