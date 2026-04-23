(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  function createRecruiterDashboardApi(deps) {
    var state = deps.state;
    var el = deps.el;
    var STORAGE = deps.STORAGE;
    var normalize = deps.normalize;
    var escapeHtml = deps.escapeHtml;
    var formatDate = deps.formatDate;
    var formatDateTime = deps.formatDateTime;
    var formatCurrency = deps.formatCurrency;
    var showToast = deps.showToast;
    var readJson = deps.readJson;
    var writeJson = deps.writeJson;
    var readCollection = deps.readCollection;
    var writeCollection = deps.writeCollection;

    function getStatusMeta(status) {
      var st = normalize(status);
      if (st === 'open' || st === 'active') {
        return { css: 'open', text: 'Đang mở' };
      }
      if (st === 'closed') {
        return { css: 'closed', text: 'Đã đóng' };
      }
      return { css: 'expired', text: 'Hết hạn' };
    }

    function isOwnedByRecruiter(job) {
      if (!job || !state.recruiter) return false;
      var byId = Number(job.recruiterId) === Number(state.recruiter.id);
      var byEmail = normalize(job.recruiterEmail) === normalize(state.recruiter.email);
      return byId || byEmail;
    }

    function loadState() {
      state.recruiter = deps.getCurrentUser();
      if (!state.recruiter || state.recruiter.role !== 'recruiter') {
        window.location.href = 'login.html';
        return false;
      }

      state.users = deps.getStoredUsers();
      state.recruiter = deps.getStoredUserRecord() || state.recruiter;
      state.jobs = readCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS);
      syncMissingJobViews();
      state.applications = readCollection(STORAGE.APPLICATIONS, STORAGE.LEGACY_APPLICATIONS);
      state.applicants = readJson('applicants', []);
      state.interviews = readJson(STORAGE.INTERVIEWS, []);

      return true;
    }

    function getRecruiterJobs() {
      return state.jobs.filter(isOwnedByRecruiter);
    }

    function getRecruiterApplications() {
      var recruiterJobIds = getRecruiterJobs().map(function (job) {
        return Number(job.id);
      });

      return state.applications.filter(function (app) {
        return recruiterJobIds.indexOf(Number(app.jobId)) >= 0;
      });
    }

    function getAllTransactions() {
      return deps.getAllTransactions();
    }

    function getRecruiterCommissionTransactions() {
      if (!state.recruiter) {
        return [];
      }

      return getAllTransactions().filter(function (tx) {
        if (!tx || normalize(tx.status) !== 'success') {
          return false;
        }

        if (normalize(tx.type) !== 'apply_commission') {
          return false;
        }

        var byId = Number(tx.recruiterId) === Number(state.recruiter.id);
        var byEmail = normalize(tx.recruiterEmail) === normalize(state.recruiter.email);
        return byId || byEmail;
      });
    }

    function getApplicantsForJob(jobId) {
      return state.applications.filter(function (app) {
        return Number(app.jobId) === Number(jobId);
      });
    }

    function getApplicantLimit(job) {
      var raw = Number(job && (job.maxApplicants || job.applicantLimit || 0));
      if (!Number.isFinite(raw) || raw <= 0) {
        return 0;
      }
      return Math.floor(raw);
    }

    function getApplicantQuotaLabel(job) {
      var total = getApplicantsForJob(job.id).length;
      var limit = getApplicantLimit(job);
      if (limit > 0) {
        return total + '/' + limit + ' ho so';
      }
      return total + ' ho so';
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
        writeCollection(STORAGE.JOBS, STORAGE.LEGACY_JOBS, state.jobs);
      }
    }

    function getPreferredApplicantJob() { 
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

    function getRecruiterInterviews() {
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

    function getInterviewStatusMeta(status) {
      var st = normalize(status);
      if (st === 'done') {
        return { css: 'open', text: 'Da xong' };
      }
      if (st === 'canceled') {
        return { css: 'closed', text: 'Da huy' };
      }
      return { css: 'expired', text: 'Da hen' };
    }

    function getInterviewMeta(interview) {
      var app = state.applications.find(function (item) {
        return Number(item.id) === Number(interview.applicationId);
      }) || null;
      var job = app ? state.jobs.find(function (item) {
        return Number(item.id) === Number(app.jobId);
      }) : null;

      return { app: app, job: job };
    }

    function getDaysBetweenNow(value) {
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      var now = new Date();
      var diff = now.getTime() - date.getTime();
      return diff / (1000 * 60 * 60 * 24);
    }

    function filterInterviews(items) {
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

    function renderInterviewList() {
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

    function populateApplicantJobSelect() {
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

    function updateStats() {
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

      var today = deps.getLocalDateKey(new Date());
      var interviewToday = getRecruiterInterviews().filter(function (itv) {
        return deps.getLocalDateKey(itv.interviewDate || itv.createdAt) === today;
      }).length;

      if (el.statOpenPosts) el.statOpenPosts.textContent = String(openPosts);
      if (el.statTotalApplicants) el.statTotalApplicants.textContent = String(allApplicants);
      if (el.statUnread) el.statUnread.textContent = String(unread);
      if (el.statInterviewToday) el.statInterviewToday.textContent = String(interviewToday);

      renderFeePolicyPanel();
    }

    function renderFeePolicyPanel() {
      if (!el.policySection) {
        return;
      }

      var recruiterJobs = getRecruiterJobs();
      var commissionTransactions = getRecruiterCommissionTransactions();
      var approvedCount = commissionTransactions.length;
      var featuredCount = recruiterJobs.filter(function (job) {
        return !!job.featured;
      }).length;

      var estimatedCommission = commissionTransactions.reduce(function (sum, tx) {
        return sum + Math.abs(Number(tx.amount) || 0);
      }, 0);
      var estimatedFeatured = featuredCount * deps.FEATURED_PIN_FEE;
      var estimatedTotal = estimatedCommission + estimatedFeatured;

      if (el.policyFeaturedFee) el.policyFeaturedFee.textContent = formatCurrency(deps.FEATURED_PIN_FEE);
      if (el.policyCommissionPerApproved) el.policyCommissionPerApproved.textContent = formatCurrency(deps.COMMISSION_PER_APPROVED_FEE);
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

      var commissionByJobMap = commissionTransactions.reduce(function (acc, tx) {
        var jobId = Number(tx.jobId) || 0;
        if (!jobId) {
          return acc;
        }
        if (!acc[jobId]) {
          acc[jobId] = { count: 0, amount: 0 };
        }
        acc[jobId].count += 1;
        acc[jobId].amount += Math.abs(Number(tx.amount) || 0);
        return acc;
      }, {});

      var lines = recruiterJobs.map(function (job) {
        var commissionMeta = commissionByJobMap[Number(job.id)] || { count: 0, amount: 0 };
        var approvedByJob = commissionMeta.count;
        var commissionByJob = commissionMeta.amount;
        var featuredByJob = job.featured ? deps.FEATURED_PIN_FEE : 0;
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

    function renderJobTable() {
      if (!el.jobTableBody) return;

      var jobs = getRecruiterJobs();
      if (state.topKeyword) {
        var topKey = normalize(state.topKeyword);
        jobs = jobs.filter(function (job) {
          return normalize(job.title).includes(topKey) || normalize(job.company).includes(topKey);
        });
      }

      if (!jobs.length) {
        el.jobTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chua co tin tuyen dung nao.</td></tr>';
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
            '<td>' + getJobViewCount(job) + '</td>' +
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

    function toggleJobStatus(jobId) {
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

    function deleteJob(jobId) {
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

    function getApplicantStatusMeta(status) {
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

    function deleteApplication(appId) {
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

    function renderApplicantList(items) {
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

    function openApplicantPanel(jobId) {
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

    function filterApplicants() {
      if (!state.activeJobId) return;
      var list = getApplicantsForJob(state.activeJobId);
      renderApplicantList(list);
    }

    function ensureCvModal() {
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

      function closeCvModal() {
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

    function openCvModal(app, jobTitle) {
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
      var candidateEmail = app.candidateEmail || app.email || (profile && profile.email) || 'Chua cap nhat';
      var summaryText = '(Khong co tom tat)';
      var candidateEmail = app.candidateEmail || app.email || (profile && profile.email) || 'Chua cap nhat';
      var summaryText = '(Khong co tom tat)';

      // If application stored cvId, try to load the latest CV record from storage
      try {
        var storedCvs = readJson('candidateCVs', []);
        if (app.cvId && storedCvs && storedCvs.length) {
          var matchedCv = storedCvs.find(function (c) { return Number(c.id) === Number(app.cvId); });
          if (matchedCv) {
            cvName = matchedCv.name || cvName;
            if (matchedCv.skills) {
              skills = Array.isArray(matchedCv.skills) ? matchedCv.skills.join(', ') : String(matchedCv.skills);
            }
            // matchedCv.experience intentionally not used in modal (field removed)
            if (matchedCv.summary) {
              summaryText = String(matchedCv.summary);
            }
            candidateEmail = matchedCv.email || candidateEmail;
          }
        }
      } catch (e) {
        // ignore storage read errors and fallback to app/profile values
      }

      body.innerHTML =
        '<div class="field"><label>Ho ten</label><input type="text" readonly value="' + (app.candidateName || 'Ung vien') + '"></div>' +
        '<div class="field"><label>Email</label><input type="text" readonly value="' + candidateEmail + '"></div>' +
        '<div class="field"><label>Vi tri ung tuyen</label><input type="text" readonly value="' + (jobTitle || 'Khong ro vi tri') + '"></div>' +
        '<div class="field"><label>CV</label><input type="text" readonly value="' + cvName + '"></div>' +
        '<div class="field"><label>Ky nang</label><textarea readonly>' + skills + '</textarea></div>' +
        '<div class="field"><label>Tom tat</label><textarea readonly>' + summaryText + '</textarea></div>' +
        '<div class="field"><label>Trang thai ho so</label><input type="text" readonly value="' + (app.status || 'pending') + '"></div>' +
        '<div class="field"><label>Ngay nop</label><input type="text" readonly value="' + formatDateTime(app.appliedAt) + '"></div>' +
        '<div class="field"><label>Loi nhan ung tuyen</label><textarea readonly>' + (app.message || '(Khong co)') + '</textarea></div>';

      // append CV preview area (iframe for PDF, download for DOCX)
      body.innerHTML += '\n        <div class="field">\n          <label>CV File</label>\n          <div id="cvFilePreview">\n            <iframe id="cvPreviewFrame" style="width:100%;height:420px;border:1px solid #e5e7eb;border-radius:6px;display:block"></iframe>\n            <div style="margin-top:8px">\n              <button id="cvDownloadBtn" class="btn btn-save" type="button">Tải CV</button>\n              <span id="cvFileName" style="margin-left:10px;color:#374151"></span>\n            </div>\n          </div>\n        </div>';

      // Try to find full candidate user record to get stored cvFile
      try {
        var userRecord = (state.users || []).find(function (u) {
          if (!u) return false;
          var byId = app.candidateId && Number(u.id) === Number(app.candidateId);
          var byEmail = u.email && String(u.email).toLowerCase() === String(candidateEmail).toLowerCase();
          return byId || byEmail;
        }) || null;

        var cvFileObj = (userRecord && userRecord.cvFile) ? userRecord.cvFile : null;
        var downloadBtnEl = document.getElementById('cvDownloadBtn');
        var fileNameEl = document.getElementById('cvFileName');
        var frameEl = document.getElementById('cvPreviewFrame');

        function attachDownload(dataUrl, filename) {
          if (!downloadBtnEl) return;
          downloadBtnEl.onclick = function () {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename || 'cv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
        }

        if (cvFileObj && cvFileObj.data) {
          fileNameEl.textContent = cvFileObj.name || '';
          var mime = String(cvFileObj.type || '').toLowerCase();
          if (mime.indexOf('pdf') >= 0) {
            if (frameEl) frameEl.src = cvFileObj.data;
            attachDownload(cvFileObj.data, cvFileObj.name);
          } else {
            // docx: hide iframe and provide download
            if (frameEl) frameEl.style.display = 'none';
            attachDownload(cvFileObj.data, cvFileObj.name);
          }
        } else {
          // no file attached
          if (frameEl) frameEl.style.display = 'none';
          if (fileNameEl) fileNameEl.textContent = '(Chưa có file CV)';
          if (downloadBtnEl) downloadBtnEl.onclick = null;
        }
      } catch (e) {
        // ignore preview errors
      }

      backdrop.setAttribute('data-app-id', String(app.id));
      backdrop.style.display = 'flex';
    }

    function showCandidateCv(appId) {
      var app = state.applications.find(function (item) {
        return Number(item.id) === Number(appId);
      });
      if (!app) return;

      var job = state.jobs.find(function (item) {
        return Number(item.id) === Number(app.jobId);
      });

      openCvModal(app, job ? job.title : 'Khong ro vi tri');
    }

    function applyTopSearch() {
      renderJobTable();
      renderRecentActivities();
    }

    function setVisibleView(view) {
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
        deps.renderSettingsOverview();
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

    function renderRecentActivities() {
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

    function renderTrendBars() {
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

    function openCreateModal() {
      if (el.newJobTitle) el.newJobTitle.value = '';
      if (el.newJobSalary) el.newJobSalary.value = '';
      if (el.newJobDescription) el.newJobDescription.value = '';
      if (el.newJobType) el.newJobType.value = 'fulltime';
      if (el.newJobLocation) el.newJobLocation.value = '';
      if (el.newJobRequirements) el.newJobRequirements.value = '';
      if (el.newJobMaxApplicants) el.newJobMaxApplicants.value = '';
      if (el.newJobFeatured) el.newJobFeatured.checked = false;

      if (el.createModalBackdrop) {
        el.createModalBackdrop.style.display = 'flex';
      }
    }

    function closeCreateModal() {
      if (el.createModalBackdrop) {
        el.createModalBackdrop.style.display = 'none';
      }
    }

    function submitCreateJob() {
      if (!window.JobModule || typeof window.JobModule.createJobFromForm !== 'function') {
        showToast('Không tìm thấy module đăng tin (job.js).', 'error');
        return;
      }

      // Client-side: validate salary doesn't contain negative numbers
      var salaryRaw = el.newJobSalary ? String(el.newJobSalary.value || '').trim() : '';
      try {
        var nums = (salaryRaw.match(/-?\d+(?:\.\d+)?/g) || []).map(function (s) { return Number(s); });
        if (nums.some(function (n) { return Number.isFinite(n) && n < 0; })) {
          showToast('Mức lương không được âm', 'error');
          return;
        }
      } catch (e) {
        // ignore parse errors and continue to server validation
      }

      var result = window.JobModule.createJobFromForm({
        title: el.newJobTitle ? el.newJobTitle.value : '',
        salary: salaryRaw,
        description: el.newJobDescription ? el.newJobDescription.value : '',
        type: el.newJobType ? el.newJobType.value : 'fulltime',
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

    function ensureInviteLocationField() {
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

    function getInviteLocationValue() {
      var input = document.getElementById('inviteLocation');
      return input ? String(input.value || '').trim() : '';
    }

    function setInviteLocationValue(value) {
      var input = document.getElementById('inviteLocation');
      if (input) {
        input.value = value || '';
      }
    }

    function openInviteModal(appId) {
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

    function closeInviteModal() {
      state.inviteAppId = null;
      if (el.inviteModalBackdrop) {
        el.inviteModalBackdrop.style.display = 'none';
      }
    }

    function updateApplicationStatus(appId, nextStatus) {
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
          deps.COMMISSION_PER_APPROVED_FEE,
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
        showToast('Duyệt hồ sơ thành công.', 'success');
      } else {
        showToast('Đã cập nhật trạng thái hồ sơ.', 'info');
      }
    }

    function submitInvite() {
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

    function updateInterviewStatus(interviewId, nextStatus) {
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

    function deleteInterview(interviewId) {
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

    function renderSettingsOverview() {
      deps.renderSettingsOverview();
    }

    function sidebarNavigate(index) {
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

    return {
      getStatusMeta: getStatusMeta,
      isOwnedByRecruiter: isOwnedByRecruiter,
      loadState: loadState,
      getRecruiterJobs: getRecruiterJobs,
      getRecruiterApplications: getRecruiterApplications,
      getRecruiterCommissionTransactions: getRecruiterCommissionTransactions,
      getApplicantsForJob: getApplicantsForJob,
      getApplicantLimit: getApplicantLimit,
      getApplicantQuotaLabel: getApplicantQuotaLabel,
      getSeededJobViewCount: getSeededJobViewCount,
      getJobViewCount: getJobViewCount,
      syncMissingJobViews: syncMissingJobViews,
      getPreferredApplicantJob: getPreferredApplicantJob,
      getRecruiterInterviews: getRecruiterInterviews,
      getInterviewStatusMeta: getInterviewStatusMeta,
      getInterviewMeta: getInterviewMeta,
      getDaysBetweenNow: getDaysBetweenNow,
      filterInterviews: filterInterviews,
      renderInterviewList: renderInterviewList,
      populateApplicantJobSelect: populateApplicantJobSelect,
      populateInterviewJobFilter: populateInterviewJobFilter,
      updateStats: updateStats,
      renderFeePolicyPanel: renderFeePolicyPanel,
      renderJobTable: renderJobTable,
      toggleJobStatus: toggleJobStatus,
      deleteJob: deleteJob,
      getApplicantStatusMeta: getApplicantStatusMeta,
      deleteApplication: deleteApplication,
      renderApplicantList: renderApplicantList,
      openApplicantPanel: openApplicantPanel,
      filterApplicants: filterApplicants,
      ensureCvModal: ensureCvModal,
      openCvModal: openCvModal,
      showCandidateCv: showCandidateCv,
      applyTopSearch: applyTopSearch,
      setVisibleView: setVisibleView,
      updateApplicationStatus: updateApplicationStatus,
      ensureInviteLocationField: ensureInviteLocationField,
      getInviteLocationValue: getInviteLocationValue,
      setInviteLocationValue: setInviteLocationValue,
      openInviteModal: openInviteModal,
      closeInviteModal: closeInviteModal,
      submitInvite: submitInvite,
      updateInterviewStatus: updateInterviewStatus,
      deleteInterview: deleteInterview,
      renderRecentActivities: renderRecentActivities,
      renderTrendBars: renderTrendBars,
      openCreateModal: openCreateModal,
      closeCreateModal: closeCreateModal,
      submitCreateJob: submitCreateJob,
      sidebarNavigate: sidebarNavigate
    };
  }

  window.RecruiterModules.Dashboard = {
    createRecruiterDashboardApi: createRecruiterDashboardApi
  };
})();