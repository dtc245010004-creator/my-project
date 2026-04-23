(function () {
  window.CandidateModules = window.CandidateModules || {};

  function createJobsApi(deps) {
    function isFavorite(jobId) {
      var userSaved = deps.getSavedForUser();
      return userSaved.some(function (item) {
        return Number(item.jobId) === Number(jobId);
      });
    }

    function getJobTechTags(job) {
      var source = [job.title, job.description, job.type].join(" ").toLowerCase();
      var dictionary = [
        { key: "react", label: "ReactJS" },
        { key: "node", label: "Node.js" },
        { key: "python", label: "Python" },
        { key: "ai", label: "AI/ML" },
        { key: "data", label: "Data Science" },
        { key: "sql", label: "PostgreSQL" },
        { key: "ui", label: "UI/UX" },
        { key: "design", label: "Design" },
        { key: "mobile", label: "Mobile" },
        { key: "devops", label: "DevOps" }
      ];

      var tags = dictionary.filter(function (item) {
        return source.indexOf(item.key) >= 0;
      }).map(function (item) {
        return item.label;
      });

      if (!tags.length) {
        tags = ["Remote", "Teamwork", "Fast Growth"];
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

      deps.state.jobs = deps.state.jobs.map(function (job) {
        var raw = Number(job && job.views);
        if (Number.isFinite(raw) && raw > 0) {
          return job;
        }
        changed = true;
        return Object.assign({}, job, { views: getSeededJobViewCount(job) });
      });

      if (changed) {
        deps.writeCollection("JOBS_DATA", "jobs", deps.state.jobs);
      }
    }

    function increaseJobViewCount(jobId) {
      var targetId = Number(jobId);
      if (!targetId) {
        return null;
      }

      var updatedJob = null;
      deps.state.jobs = deps.state.jobs.map(function (job) {
        if (Number(job.id) !== targetId) {
          return job;
        }

        var nextViews = getJobViewCount(job) + 1;
        updatedJob = Object.assign({}, job, { views: nextViews });
        return updatedJob;
      });

      if (updatedJob) {
        deps.writeCollection("JOBS_DATA", "jobs", deps.state.jobs);
      }

      return updatedJob;
    }

    function getApplicationCountForJob(jobId) {
      return deps.state.applications.filter(function (item) {
        return Number(item.jobId) === Number(jobId);
      }).length;
    }

    function getJobApplicantLimit(job) {
      var raw = Number(job && (job.maxApplicants || job.applicantLimit || 0));
      if (!Number.isFinite(raw) || raw <= 0) {
        return 0;
      }
      return Math.floor(raw);
    }

    function isJobApplicantLimitReached(job) {
      var limit = getJobApplicantLimit(job);
      if (limit <= 0) {
        return false;
      }
      return getApplicationCountForJob(job.id) >= limit;
    }

    function getJobAbbr(job) {
      var words = String(job.company || "TC").trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        return "TC";
      }
      var first = words[0].charAt(0) || "T";
      var second = words.length > 1 ? words[1].charAt(0) : (words[0].charAt(1) || "C");
      return (first + second).toUpperCase();
    }

    function getDisplaySalary(value) {
      var text = String(value || "").trim();
      if (!text) {
        return "Thỏa thuận";
      }
      return text;
    }

    function getJobCode(job) {
      var title = String(job.title || "").trim();
      if (!title) {
        return "JOB";
      }

      var words = title.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0) + (words[2] ? words[2].charAt(0) : "")).toUpperCase().slice(0, 3);
      }

      return words[0].slice(0, 3).toUpperCase();
    }

    function renderJobs() {
      var key = deps.normalize(deps.el.searchInputEl && deps.el.searchInputEl.value);
      var filterValue = deps.el.filterEl ? deps.el.filterEl.value : "all";

      var items = deps.state.jobs.filter(function (job) {
        var byKeyword =
          !key ||
          deps.normalize(job.title).includes(key) ||
          deps.normalize(job.company).includes(key) ||
          deps.normalize(job.location).includes(key);

        var byFilter = filterValue === "all" ? true : deps.normalize(job.status) === filterValue;
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
        if (deps.el.jobListEl) {
          deps.el.jobListEl.innerHTML = "<div class='job-empty'><strong>Không tìm thấy công việc phù hợp.</strong><div style='margin-top:6px;'>Thử tìm từ khóa khác hoặc bộ lọc khác.</div></div>";
        }
        return;
      }

      if (!deps.el.jobListEl) {
        return;
      }

      deps.el.jobListEl.innerHTML = items
        .map(function (job) {
          var favoriteText = isFavorite(job.id) ? "♥" : "♡";
          var statusText = deps.normalize(job.status || "open") === "closed" ? "Đã đóng" : "Đang mở";
          var isClosed = deps.normalize(job.status || "open") === "closed";
          var tags = getJobTechTags(job);
          var applyCount = getApplicationCountForJob(job.id);
          var applicantLimit = getJobApplicantLimit(job);
          var isLimitReached = applicantLimit > 0 && applyCount >= applicantLimit;
          var applyDisabled = isClosed || isLimitReached;
          var applyLabel = isClosed ? "Đã đóng" : (isLimitReached ? "Đã đủ hồ sơ" : "Ứng tuyển");
          var viewCount = getJobViewCount(job);
          var logo = getJobAbbr(job);
          var code = getJobCode(job);

          return (
            "<div class='job-item'>" +
              "<div class='job-head'>" +
                        "<div class='job-brand'>" + deps.escapeHtml(logo) + "</div>" +
                    "<div>" +
                      "<div class='job-head-title'>" + deps.escapeHtml(code) + "</div>" +
                      "<div class='job-head-role'>" + deps.escapeHtml(job.title || 'Vị trí đang cập nhật') + "</div>" +
                      "<div class='job-head-company'>" + deps.escapeHtml(job.company || 'Công ty') + "</div>" +
                    "</div>" +
                    
                  "</div>" +
                  "<div class='status-floating'><span class=\"job-status " + (isClosed ? 'closed' : 'open') + "\">" + statusText + "</span></div>" +
              "<div class='job-pill-row'>" +
                "<div class='job-meta-pill'><span>📍</span><span>" + deps.escapeHtml(getDisplaySalary(job.salary)) + "</span><span style='opacity:0.45;'>|</span><span>" + deps.escapeHtml(job.location || "Đang cập nhật") + "</span></div>" +
                "<div class='job-status-pill " + (isClosed ? "closed" : "open") + "'><span>🔒 Trạng thái: " + statusText + "</span><span class='job-status-dot'></span></div>" +
              "</div>" +
              "<div class='job-tech'>" + tags.map(function (tag) { return "<span class='job-tech-chip'>" + deps.escapeHtml(tag) + "</span>"; }).join("") + "</div>" +
              "<div class='job-insight'>" +
                "<div class='job-insight-item'><span>👥</span><span>Đã ứng tuyển: " + applyCount + (applicantLimit > 0 ? ("/ " + applicantLimit) : "") + "</span></div>" +
                "<div class='job-insight-sep'></div>" +
                "<div class='job-insight-item'><span>👁️</span><span>Views: " + viewCount + "</span></div>" +
              "</div>" +
              "<div class='job-actions'>" +
                "<button class='btn-job apply' data-action='apply' data-id='" + job.id + "'" + (applyDisabled ? " disabled" : "") + "><span>＋</span><span class='job-btn-label'>" + applyLabel + "</span></button>" +
                "<button class='btn-job detail' data-action='detail' data-id='" + job.id + "'><span>ⓘ</span><span class='job-btn-label'>Xem chi tiết</span></button>" +
                "<button class='btn-job favorite' data-action='favorite' data-id='" + job.id + "' aria-label='Yêu thích'>" + favoriteText + "</button>" +
              "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    function getHistoryJobMeta(item) {
      var job = deps.state.jobs.find(function (j) {
        return Number(j.id) === Number(item.jobId);
      }) || null;

      return {
        title: item.jobTitle || (job && job.title) || "Vị trí đang cập nhật",
        company: item.company || (job && job.company) || "Công ty đang cập nhật"
      };
    }

    function getHistoryStatusMeta(status) {
      var st = deps.normalize(status);

      if (st.indexOf("pending") >= 0 || st.indexOf("cho") >= 0) {
        return { css: "pending", text: "Chờ duyệt", icon: "⏳" };
      }

      if (st.indexOf("approved") >= 0 || st.indexOf("reviewed") >= 0 || st.indexOf("duyet") >= 0) {
        return { css: "approved", text: "Đã duyệt", icon: "✅" };
      }

      if (st.indexOf("phong van") >= 0 || st.indexOf("interview") >= 0) {
        return { css: "interview", text: "Mời phỏng vấn", icon: "📅" };
      }

      if (st.indexOf("rejected") >= 0 || st.indexOf("tu choi") >= 0 || st.indexOf("huy") >= 0) {
        return { css: "rejected", text: "Không phù hợp", icon: "⛔" };
      }

      return { css: "default", text: status || "Đang xử lý", icon: "ℹ️" };
    }

    function renderApplicationHistory() {
      if (!deps.el.historyListEl) {
        return;
      }

      var searchKey = deps.normalize(deps.el.historySearchInputEl ? deps.el.historySearchInputEl.value : "");
      var dateFilter = String(deps.el.historyDateFilterEl ? deps.el.historyDateFilterEl.value : "").trim();

      var items = deps.getUserApplications().slice().sort(function (a, b) {
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });

      items = items.filter(function (item) {
        var jobMeta = getHistoryJobMeta(item);
        var byName = !searchKey ||
          deps.normalize(jobMeta.title).includes(searchKey) ||
          deps.normalize(jobMeta.company).includes(searchKey);

        var byDate = true;
        if (dateFilter) {
          var appliedDate = String(item.appliedAt || "").split("T")[0];
          byDate = appliedDate === dateFilter;
        }

        return byName && byDate;
      });

      if (!items.length) {
        deps.el.historyListEl.innerHTML = '<li class="empty-note">Khong co lich su phu hop voi bo loc hien tai.</li>';
        return;
      }

      deps.el.historyListEl.innerHTML = items
        .map(function (item) {
          var jobMeta = getHistoryJobMeta(item);
          var statusMeta = getHistoryStatusMeta(item.status);

          return (
            '<li class="history-card">' +
              '<div>' +
                '<div class="history-title">' + deps.escapeHtml(jobMeta.title) + ' - ' + deps.escapeHtml(jobMeta.company) + '</div>' +
                '<div class="history-meta">' +
                  '<span class="history-status ' + statusMeta.css + '">' + statusMeta.icon + ' ' + statusMeta.text + '</span>' +
                  '<span>Ngay ung tuyen: ' + deps.escapeHtml(deps.formatDateTime(item.appliedAt)) + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="history-actions">' +
                '<button class="history-feedback" type="button" data-history-action="feedback" data-id="' + item.id + '">Xem phan hoi</button>' +
                '<button class="history-delete" type="button" data-history-action="delete" data-id="' + item.id + '">Xoa</button>' +
              '</div>' +
            '</li>'
          );
        })
        .join("");
    }

    function getRecruiterFeedback(application) {
      var interview = deps.state.interviews.find(function (item) {
        return Number(item.applicationId) === Number(application.id);
      }) || null;

      var statusMeta = getHistoryStatusMeta(application.status);
      var feedbackText =
        application.recruiterFeedback ||
        application.recruiterResponse ||
        application.reviewNote ||
        application.interviewNote ||
        (statusMeta.css === "approved" ? "Hồ sơ của bạn đã được duyệt. Nhà tuyển dụng sẽ liên hệ bước tiếp theo." : null) ||
        (statusMeta.css === "interview" ? "Bạn đã được mời phỏng vấn. Vui lòng kiểm tra lịch hẹn bên dưới." : null) ||
        (statusMeta.css === "rejected" ? "Hồ sơ chưa phù hợp ở thời điểm hiện tại. Bạn có thể cập nhật CV và ứng tuyển lại." : null) ||
        "Nhà tuyển dụng chưa gửi phản hồi chi tiết cho hồ sơ này.";

      var interviewInfo = "Chưa có lịch phỏng vấn.";
      if (interview || application.interviewDate || application.interviewLocation) {
        var iDate = (interview && interview.interviewDate) || application.interviewDate;
        var iLocation = (interview && interview.interviewLocation) || application.interviewLocation || "Đang cập nhật";
        var iNote = (interview && interview.interviewNote) || application.interviewNote || "(Không có ghi chú)";
        var iStatus = (interview && interview.status) || "scheduled";
        interviewInfo =
          "Thời gian: " + deps.formatDateTime(iDate) + "\n" +
          "Địa điểm: " + iLocation + "\n" +
          "Trạng thái: " + iStatus + "\n" +
          "Ghi chú: " + iNote;
      }

      return {
        statusText: statusMeta.text,
        message: feedbackText,
        interviewInfo: interviewInfo,
        updatedAt: application.updatedAt || application.appliedAt
      };
    }

    function openRecruiterFeedbackModal(application) {
      if (!application || !deps.el.recruiterFeedbackBackdropEl) {
        return;
      }

      var jobMeta = getHistoryJobMeta(application);
      var feedback = getRecruiterFeedback(application);

      if (deps.el.feedbackJobNameEl) deps.el.feedbackJobNameEl.value = jobMeta.title;
      if (deps.el.feedbackCompanyEl) deps.el.feedbackCompanyEl.value = jobMeta.company;
      if (deps.el.feedbackStatusEl) deps.el.feedbackStatusEl.value = feedback.statusText;
      if (deps.el.feedbackMessageEl) deps.el.feedbackMessageEl.value = feedback.message;
      if (deps.el.feedbackInterviewEl) deps.el.feedbackInterviewEl.value = feedback.interviewInfo;
      if (deps.el.feedbackUpdatedAtEl) deps.el.feedbackUpdatedAtEl.value = deps.formatDateTime(feedback.updatedAt);

      deps.el.recruiterFeedbackBackdropEl.style.display = "flex";
    }

    function closeRecruiterFeedbackModal() {
      if (!deps.el.recruiterFeedbackBackdropEl) {
        return;
      }
      deps.el.recruiterFeedbackBackdropEl.style.display = "none";
    }

    function persistApplications() {
      deps.writeCollection("APPLICATIONS_DATA", "applications", deps.state.applications);
    }

    function deleteApplicationHistory(appId) {
      var found = deps.state.applications.some(function (item) {
        return Number(item.id) === Number(appId) && Number(item.candidateId) === Number(deps.state.user && deps.state.user.id);
      });

      if (!found) {
        return;
      }

      var ok = window.confirm("Ban chac chan muon xoa muc lich su ung tuyen nay?");
      if (!ok) {
        return;
      }

      deps.state.applications = deps.state.applications.filter(function (item) {
        return Number(item.id) !== Number(appId);
      });

      persistApplications();
      deps.updateStats();
      renderApplicationHistory();
    }

    function mapJobType(type) {
      var raw = deps.normalize(type);
      if (raw === "fulltime" || raw === "full-time") return "Toàn thời gian";
      if (raw === "parttime" || raw === "part-time") return "Bán thời gian";
      if (raw === "remote") return "Remote";
      if (raw === "hybrid") return "Hybrid";
      return type || "Đang cập nhật";
    }

    function mapJobStatus(status) {
      var raw = deps.normalize(status);
      if (raw === "open" || raw === "active") return "Đang mở";
      if (raw === "closed") return "Đã đóng";
      return status || "Đang cập nhật";
    }

    function renderFavoritesSection() {
      if (!deps.el.favoriteListEl) {
        return;
      }

      var saved = deps.getSavedForUser();
      if (!saved.length) {
        deps.el.favoriteListEl.innerHTML = '<li class="empty-note">Ban chua luu cong viec nao.</li>';
        return;
      }

      deps.el.favoriteListEl.innerHTML = saved
        .map(function (item) {
          var job = deps.state.jobs.find(function (j) {
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
              '<div class="favorite-title">' + deps.escapeHtml(job.title) + ' - ' + deps.escapeHtml(job.company) + '</div>' +
              '<div class="favorite-meta">' +
                'Địa điểm: ' + deps.escapeHtml(job.location || 'Đang cập nhật') + '<br>' +
                'Lương: ' + deps.escapeHtml(job.salary || 'Thỏa thuận') + '<br>' +
                'Trạng thái: ' + deps.escapeHtml(mapJobStatus(job.status)) +
              '</div>' +
              '<div class="favorite-actions">' +
                '<button class="favorite-btn" type="button" data-favorite-action="detail" data-id="' + job.id + '">Xem chi tiết</button>' +
                '<button class="favorite-btn remove" type="button" data-favorite-action="remove" data-id="' + job.id + '">Xóa khỏi yêu thích</button>' +
              '</div>' +
            '</li>'
          );
        })
        .join("");
    }

    function removeFavoriteByJobId(jobId) {
      var before = deps.state.savedJobs.length;
      deps.state.savedJobs = deps.state.savedJobs.filter(function (item) {
        return !(Number(item.userId) === Number(deps.state.user && deps.state.user.id) && Number(item.jobId) === Number(jobId));
      });

      if (deps.state.savedJobs.length === before) {
        return;
      }

      deps.writeJson("savedJobs", deps.state.savedJobs);
      deps.updateStats();
      renderFavoritesSection();
      renderJobs();
    }

    function addTimeline(text) {
      if (!deps.el.timelineEl) {
        return;
      }

      var now = new Date();
      var hh = String(now.getHours()).padStart(2, "0");
      var mm = String(now.getMinutes()).padStart(2, "0");

      var item = document.createElement("li");
      item.innerHTML = text + "<small>" + hh + ":" + mm + " - Hom nay</small>";
      deps.el.timelineEl.prepend(item);
    }

    function openApplyModal(job) {
      if (!job) {
        return;
      }

      if (deps.normalize(job.status || "open") === "closed") {
        alert("Tin tuyển dụng đã đóng, không thể ứng tuyển.");
        return;
      }

      if (isJobApplicantLimitReached(job)) {
        alert("Tin tuyển dụng đã đủ số lượng hồ sơ được nhà tuyển dụng tiếp nhận.");
        return;
      }

      deps.state.selectedJob = job;
      if (deps.el.modalJobTitleEl) deps.el.modalJobTitleEl.value = job.title + " - " + job.company;
      if (deps.el.modalMessageEl) deps.el.modalMessageEl.value = "";

      var defaultCvId = deps.getDefaultCvId();

      var options = deps.state.cvs
        .map(function (cv) {
          var selected = Number(cv.id) === Number(defaultCvId) ? " selected" : "";
          var suffix = Number(cv.id) === Number(defaultCvId) ? " (Mặc định)" : "";
          return '<option value="' + cv.id + '"' + selected + '>' + cv.name + suffix + '</option>';
        })
        .join("");

      if (deps.el.modalCvSelectEl) {
        deps.el.modalCvSelectEl.innerHTML = '<option value="">-- Chọn CV --</option>' + options;
      }
      if (deps.el.modalBackdropEl) deps.el.modalBackdropEl.style.display = "flex";
    }

    function openJobDetailModal(job) {
      if (!job || !deps.el.jobDetailBackdropEl) {
        return;
      }

      var currentJob = deps.state.jobs.find(function (item) {
        return Number(item.id) === Number(job.id);
      }) || job;
      var updatedJob = increaseJobViewCount(currentJob.id);
      var detailJob = updatedJob || currentJob;

      if (deps.el.jobDetailNameEl) deps.el.jobDetailNameEl.value = detailJob.title || "Đang cập nhật";
      if (deps.el.jobDetailCompanyEl) deps.el.jobDetailCompanyEl.value = detailJob.company || "Đang cập nhật";
      if (deps.el.jobDetailSalaryEl) deps.el.jobDetailSalaryEl.value = detailJob.salary || "Thỏa thuận";
      if (deps.el.jobDetailLocationEl) deps.el.jobDetailLocationEl.value = detailJob.location || "Đang cập nhật";
      if (deps.el.jobDetailRequirementsEl) deps.el.jobDetailRequirementsEl.value = detailJob.requirements || "Chưa cập nhật yêu cầu cho vị trí này.";
      if (deps.el.jobDetailMaxApplicantsEl) {
        var limit = getJobApplicantLimit(detailJob);
        deps.el.jobDetailMaxApplicantsEl.value = limit > 0 ? String(limit) : "Không giới hạn";
      }
      if (deps.el.jobDetailTypeEl) deps.el.jobDetailTypeEl.value = mapJobType(detailJob.type);
      if (deps.el.jobDetailStatusEl) deps.el.jobDetailStatusEl.value = mapJobStatus(detailJob.status);
      if (deps.el.jobDetailPostedDateEl) deps.el.jobDetailPostedDateEl.value = detailJob.postedDate || "Đang cập nhật";
      if (deps.el.jobDetailDescriptionEl) deps.el.jobDetailDescriptionEl.value = detailJob.description || "Công ty chưa cập nhật mô tả chi tiết cho vị trí này.";

      deps.el.jobDetailBackdropEl.setAttribute("data-job-id", String(detailJob.id));
      deps.el.jobDetailBackdropEl.style.display = "flex";
    }

    function closeJobDetailModal() {
      if (!deps.el.jobDetailBackdropEl) {
        return;
      }
      deps.el.jobDetailBackdropEl.style.display = "none";
      deps.el.jobDetailBackdropEl.removeAttribute("data-job-id");
    }

    function closeApplyModal() {
      if (deps.el.modalBackdropEl) deps.el.modalBackdropEl.style.display = "none";
      deps.state.selectedJob = null;
    }

    function submitApplication() {
      if (!deps.state.user) {
        alert("Khong tim thay thong tin dang nhap.");
        return;
      }

      if (!deps.state.selectedJob) {
        return;
      }

      deps.state.jobs = deps.getJobCollection();
      deps.state.applications = deps.getApplicationCollection();
      var latestJob = deps.state.jobs.find(function (item) {
        return Number(item.id) === Number(deps.state.selectedJob.id);
      });

      if (!latestJob) {
        alert("Tin tuyển dụng không còn tồn tại. Vui lòng tải lại danh sách việc.");
        closeApplyModal();
        renderJobs();
        return;
      }

      if (deps.normalize(latestJob.status || "open") === "closed") {
        alert("Tin tuyển dụng đã đóng, không thể ứng tuyển.");
        closeApplyModal();
        renderJobs();
        return;
      }

      if (isJobApplicantLimitReached(latestJob)) {
        alert("Tin tuyển dụng đã đủ số lượng hồ sơ được nhà tuyển dụng tiếp nhận.");
        closeApplyModal();
        renderJobs();
        return;
      }

      deps.state.selectedJob = latestJob;

      var cvId = Number(deps.el.modalCvSelectEl && deps.el.modalCvSelectEl.value);
      if (!cvId) {
        alert("Vui lòng chọn CV trước khi gửi ứng tuyển.");
        return;
      }

      var selectedCv = deps.state.cvs.find(function (cv) {
        return Number(cv.id) === cvId;
      });

      var newId = deps.state.applications.reduce(function (max, item) {
        return Math.max(max, Number(item.id) || 0);
      }, 0) + 1;

      var newApplication = {
        id: newId,
        jobId: deps.state.selectedJob.id,
        jobTitle: deps.state.selectedJob.title,
        company: deps.state.selectedJob.company,
        candidateId: deps.state.user.id,
        candidateName: deps.state.user.name,
        candidateEmail: deps.state.user.email || '',
        recruiterEmail: deps.state.selectedJob.recruiterEmail || "",
        recruiterName: deps.state.selectedJob.recruiterName || "",
        status: "pending",
        message: String((deps.el.modalMessageEl && deps.el.modalMessageEl.value) || "").trim(),
        cvId: selectedCv ? selectedCv.id : 0,
        cvName: selectedCv ? selectedCv.name : "",
        appliedAt: new Date().toISOString()
      };

      deps.state.applications.push(newApplication);
      persistApplications();

      deps.updateStats();
      renderApplicationHistory();
      addTimeline("Đã ứng tuyển vị trí " + deps.state.selectedJob.title + " tại " + deps.state.selectedJob.company);
      alert("Ứng tuyển thành công!");
      closeApplyModal();
    }

    function toggleFavorite(jobId) {
      if (!deps.state.user) {
        return;
      }

      var idx = deps.state.savedJobs.findIndex(function (item) {
        return Number(item.userId) === Number(deps.state.user.id) && Number(item.jobId) === Number(jobId);
      });

      if (idx >= 0) {
        deps.state.savedJobs.splice(idx, 1);
        addTimeline("Đã bỏ lưu việc làm ID " + jobId);
      } else {
        deps.state.savedJobs.push({
          userId: deps.state.user.id,
          jobId: jobId,
          savedAt: new Date().toISOString()
        });
        addTimeline("Đã thêm việc làm ID " + jobId + " vào danh sách yêu thích");
      }

      deps.writeJson("savedJobs", deps.state.savedJobs);
      deps.updateStats();
      renderFavoritesSection();
      renderJobs();
    }

    return {
      isFavorite: isFavorite,
      getJobTechTags: getJobTechTags,
      getSeededJobViewCount: getSeededJobViewCount,
      getJobViewCount: getJobViewCount,
      syncMissingJobViews: syncMissingJobViews,
      increaseJobViewCount: increaseJobViewCount,
      getApplicationCountForJob: getApplicationCountForJob,
      getJobApplicantLimit: getJobApplicantLimit,
      isJobApplicantLimitReached: isJobApplicantLimitReached,
      getJobAbbr: getJobAbbr,
      getDisplaySalary: getDisplaySalary,
      getJobCode: getJobCode,
      getHistoryJobMeta: getHistoryJobMeta,
      getHistoryStatusMeta: getHistoryStatusMeta,
      getRecruiterFeedback: getRecruiterFeedback,
      persistApplications: persistApplications,
      addTimeline: addTimeline,
      renderJobs: renderJobs,
      renderApplicationHistory: renderApplicationHistory,
      renderFavoritesSection: renderFavoritesSection,
      openRecruiterFeedbackModal: openRecruiterFeedbackModal,
      closeRecruiterFeedbackModal: closeRecruiterFeedbackModal,
      deleteApplicationHistory: deleteApplicationHistory,
      removeFavoriteByJobId: removeFavoriteByJobId,
      openApplyModal: openApplyModal,
      openJobDetailModal: openJobDetailModal,
      closeJobDetailModal: closeJobDetailModal,
      closeApplyModal: closeApplyModal,
      submitApplication: submitApplication,
      mapJobType: mapJobType,
      mapJobStatus: mapJobStatus,
      toggleFavorite: toggleFavorite
    };
  }

  window.CandidateModules.Jobs = {
    createJobsApi: createJobsApi
  };
})();
