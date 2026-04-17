(function () {
  window.CandidateModules = window.CandidateModules || {};

  function createCvProfileApi(deps) {
    var activePreviewCvId = null;
    var activeEditCvId = null;

    function updateUserInfoUI() {
      if (!deps.state.user) {
        return;
      }

      var storedUser = deps.getStoredUserRecord() || deps.state.user;
      var name = storedUser.name || storedUser.email || "Candidate User";
      var avatar = storedUser.avatar || deps.buildAvatarFromName(name);
      var company = storedUser.company || storedUser.companyName || "-";
      var email = storedUser.email || "-";
      var phone = storedUser.phone || "-";

      if (deps.el.sidebarNameEl) {
        deps.el.sidebarNameEl.textContent = name;
      }

      if (deps.el.sidebarAvatarEl) {
        deps.el.sidebarAvatarEl.textContent = avatar;
      }

      if (deps.el.headerNameEl) {
        deps.el.headerNameEl.textContent = "Xin chao, " + name;
      }

      if (deps.el.accountNameDisplayEl) deps.el.accountNameDisplayEl.textContent = name;
      if (deps.el.accountCompanyDisplayEl) deps.el.accountCompanyDisplayEl.textContent = company;
      if (deps.el.accountEmailDisplayEl) deps.el.accountEmailDisplayEl.textContent = email;
      if (deps.el.accountPhoneDisplayEl) deps.el.accountPhoneDisplayEl.textContent = phone;
    }

    function openAccountSettingsModal() {
      if (!deps.state.user) {
        return;
      }

      var storedUser = deps.getStoredUserRecord() || deps.state.user;
      if (deps.el.accountNameEl) deps.el.accountNameEl.value = storedUser.name || "";
      if (deps.el.accountEmailEl) deps.el.accountEmailEl.value = storedUser.email || "";
      if (deps.el.accountPhoneEl) deps.el.accountPhoneEl.value = storedUser.phone || "";
      if (deps.el.accountCurrentPasswordEl) deps.el.accountCurrentPasswordEl.value = "";
      if (deps.el.accountNewPasswordEl) deps.el.accountNewPasswordEl.value = "";
      if (deps.el.accountConfirmPasswordEl) deps.el.accountConfirmPasswordEl.value = "";

      if (deps.el.accountEditPanelEl) {
        deps.el.accountEditPanelEl.classList.add("open");
      }

    }

    function closeAccountSettingsModal() {
      if (deps.el.accountEditPanelEl) {
        deps.el.accountEditPanelEl.classList.remove("open");
      }
    }

    function submitAccountSettings() {
      if (!deps.state.user) {
        return;
      }

      var storedUser = deps.getStoredUserRecord() || {};
      var nextName = deps.el.accountNameEl ? String(deps.el.accountNameEl.value || "").trim() : "";
      var nextEmail = deps.el.accountEmailEl ? String(deps.el.accountEmailEl.value || "").trim() : "";
      var nextPhone = deps.el.accountPhoneEl ? String(deps.el.accountPhoneEl.value || "").trim() : "";
      var currentPassword = deps.el.accountCurrentPasswordEl ? String(deps.el.accountCurrentPasswordEl.value || "").trim() : "";
      var newPassword = deps.el.accountNewPasswordEl ? String(deps.el.accountNewPasswordEl.value || "").trim() : "";
      var confirmPassword = deps.el.accountConfirmPasswordEl ? String(deps.el.accountConfirmPasswordEl.value || "").trim() : "";

      if (!nextName || !nextEmail) {
        alert("Vui lòng nhập họ tên và email.");
        return;
      }

      if (newPassword && newPassword !== confirmPassword) {
        alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        return;
      }

      if (newPassword && storedUser.password && currentPassword !== storedUser.password) {
        alert("Mật khẩu hiện tại không đúng.");
        return;
      }

      var updatedUser = Object.assign({}, storedUser, {
        id: deps.state.user.id,
        role: deps.state.user.role,
        name: nextName,
        email: nextEmail,
        phone: nextPhone || storedUser.phone || "",
        avatar: deps.buildAvatarFromName(nextName)
      });

      if (newPassword) {
        updatedUser.password = newPassword;
      }

      var replaced = false;
      deps.state.users = deps.state.users.map(function (item) {
        if (Number(item.id) === Number(updatedUser.id) && deps.normalize(item.role) === deps.normalize(updatedUser.role)) {
          replaced = true;
          return updatedUser;
        }
        return item;
      });

      if (!replaced) {
        deps.state.users.push(updatedUser);
      }

      deps.writeJson("users", deps.state.users);
      deps.persistLoggedInUser(updatedUser);
      updateUserInfoUI();
      closeAccountSettingsModal();
      alert("Đã cập nhật cài đặt tài khoản.");
    }

    function getDefaultCvStorageKey() {
      var userId = deps.state.user && deps.state.user.id ? String(deps.state.user.id) : "guest";
      return "candidateDefaultCv_" + userId;
    }

    function getDefaultCvId() {
      return Number(localStorage.getItem(getDefaultCvStorageKey()) || 0);
    }

    function setDefaultCvId(cvId) {
      localStorage.setItem(getDefaultCvStorageKey(), String(cvId || 0));
    }

    function updateCvStats() {
      if (deps.el.cvTotalStatEl) {
        deps.el.cvTotalStatEl.textContent = String(deps.state.cvs.length);
      }

      var defaultCvId = getDefaultCvId();
      var defaultCv = deps.state.cvs.find(function (cv) {
        return Number(cv.id) === Number(defaultCvId);
      });

      if (deps.el.cvDefaultStatEl) {
        deps.el.cvDefaultStatEl.textContent = defaultCv ? defaultCv.name : "Chua dat";
      }

      if (deps.el.cvLatestStatEl) {
        var latest = deps.state.cvs.slice().sort(function (a, b) {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })[0];
        deps.el.cvLatestStatEl.textContent = latest ? deps.formatDateTime(latest.createdAt) : "--";
      }
    }

    function renderCvList() {
      if (!deps.el.cvListEl) {
        return;
      }

      var defaultCvId = getDefaultCvId();

      if (deps.state.cvs.length && !deps.state.cvs.some(function (cv) { return Number(cv.id) === Number(defaultCvId); })) {
        defaultCvId = Number(deps.state.cvs[0].id);
        setDefaultCvId(defaultCvId);
      }

      if (!deps.state.cvs.length) {
        deps.el.cvListEl.innerHTML = '<li class="empty-note">Bạn chưa có CV nào. Hãy tạo mới hoặc tải CV để bắt đầu ứng tuyển.</li>';
        updateCvStats();
        return;
      }

      deps.el.cvListEl.innerHTML = deps.state.cvs
        .map(function (cv) {
          var isDefault = Number(cv.id) === Number(defaultCvId);
          var sourceText = cv.source === "upload" ? "Tải lên" : "Tạo nhanh";
          var timeValue = cv.updatedAt || cv.createdAt;
          var defaultChip = isDefault ? '<span class="cv-chip default">Mặc định</span>' : '<span class="cv-chip">Sẵn sàng</span>';
          var defaultAction = isDefault
            ? '<button class="btn-cv default" type="button" disabled>Đang mặc định</button>'
            : '<button class="btn-cv default" type="button" data-cv-action="set-default" data-id="' + cv.id + '">Đặt mặc định</button>';

          return (
            '<li class="cv-card">' +
              '<div class="cv-card-main">' +
                '<div class="cv-card-title"><span aria-hidden="true">📄</span>' + deps.escapeHtml(cv.name) + '</div>' +
                defaultChip +
                '<div class="cv-card-meta">Nguon: ' + deps.escapeHtml(sourceText) + ' | Cap nhat: ' + deps.escapeHtml(deps.formatDateTime(timeValue)) + '</div>' +
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
        .join("");

      updateCvStats();
    }

    function openCvPreviewModal(cv) {
      if (!deps.el.cvPreviewBackdropEl || !cv) {
        return;
      }

      activePreviewCvId = Number(cv.id);

      var candidateName = (deps.state.user && (deps.state.user.name || deps.state.user.email)) || "Ung vien";
      var sourceText = cv.source === "upload" ? "Upload file" : "Tao nhanh";
      var targetPosition = cv.targetPosition || "Frontend Developer / Fullstack Developer";
      var skills = cv.skills || "HTML/CSS/JavaScript\nReact co ban\nResponsive UI\nGit va teamwork";
      var summary = cv.summary || ("Nguon CV: " + sourceText + ".\nUng vien co muc tieu phat trien trong linh vuc CNTT va san sang tham gia cac du an thuc te.");
      var timeValue = cv.updatedAt || cv.createdAt;

      if (deps.el.cvPreviewNameEl) {
        deps.el.cvPreviewNameEl.value = cv.name || "CV Candidate";
      }
      if (deps.el.cvPreviewCandidateEl) {
        deps.el.cvPreviewCandidateEl.value = candidateName;
      }
      if (deps.el.cvPreviewPositionEl) {
        deps.el.cvPreviewPositionEl.value = targetPosition;
      }
      if (deps.el.cvPreviewSkillsEl) {
        deps.el.cvPreviewSkillsEl.value = skills;
      }
      if (deps.el.cvPreviewSummaryEl) {
        deps.el.cvPreviewSummaryEl.value = summary;
      }
      if (deps.el.cvPreviewUpdatedEl) {
        deps.el.cvPreviewUpdatedEl.value = deps.formatDateTime(timeValue);
      }

      deps.el.cvPreviewBackdropEl.style.display = "flex";
    }

    function closeCvPreviewModal() {
      if (!deps.el.cvPreviewBackdropEl) {
        return;
      }
      deps.el.cvPreviewBackdropEl.style.display = "none";
      activePreviewCvId = null;
    }

    function openCvEditModal(cv) {
      if (!deps.el.cvEditBackdropEl || !cv) {
        return;
      }

      activeEditCvId = Number(cv.id);
      if (deps.el.cvEditNameEl) {
        deps.el.cvEditNameEl.value = cv.name || "";
      }
      if (deps.el.cvEditPositionEl) {
        deps.el.cvEditPositionEl.value = cv.targetPosition || "";
      }
      if (deps.el.cvEditSkillsEl) {
        deps.el.cvEditSkillsEl.value = cv.skills || "";
      }
      if (deps.el.cvEditSummaryEl) {
        deps.el.cvEditSummaryEl.value = cv.summary || "";
      }

      deps.el.cvEditBackdropEl.style.display = "flex";
    }

    function closeCvEditModal() {
      if (!deps.el.cvEditBackdropEl) {
        return;
      }
      deps.el.cvEditBackdropEl.style.display = "none";
      activeEditCvId = null;
    }

    function submitCvEdit() {
      if (!activeEditCvId) {
        return;
      }

      var nextName = deps.el.cvEditNameEl ? String(deps.el.cvEditNameEl.value || "").trim() : "";
      var nextPosition = deps.el.cvEditPositionEl ? String(deps.el.cvEditPositionEl.value || "").trim() : "";
      var nextSkills = deps.el.cvEditSkillsEl ? String(deps.el.cvEditSkillsEl.value || "").trim() : "";
      var nextSummary = deps.el.cvEditSummaryEl ? String(deps.el.cvEditSummaryEl.value || "").trim() : "";

      if (!nextName) {
        alert("Vui long nhap ten CV.");
        return;
      }

      deps.state.cvs = deps.state.cvs.map(function (cv) {
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

      deps.writeJson("candidateCVs", deps.state.cvs);
      renderCvList();
      closeCvEditModal();
    }

    function handleCvAction(action, cvId) {
      var cv = deps.state.cvs.find(function (item) {
        return Number(item.id) === Number(cvId);
      });

      if (!cv) {
        return;
      }

      if (action === "preview") {
        openCvPreviewModal(cv);
        return;
      }

      if (action === "edit") {
        openCvEditModal(cv);
        return;
      }

      if (action === "download") {
        var blob = new Blob([
          "Candidate CV\n",
          "Name: " + cv.name + "\n",
          "Source: " + (cv.source || "unknown") + "\n",
          "Updated At: " + deps.formatDateTime(cv.createdAt) + "\n"
        ], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = (cv.name || "cv").replace(/\s+/g, "_") + ".txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      if (action === "set-default") {
        setDefaultCvId(cv.id);
        renderCvList();
        return;
      }

      if (action === "delete") {
        var ok = window.confirm('Ban chac chan muon xoa CV "' + cv.name + '"?');
        if (!ok) {
          return;
        }

        deps.state.cvs = deps.state.cvs.filter(function (item) {
          return Number(item.id) !== Number(cv.id);
        });
        deps.writeJson("candidateCVs", deps.state.cvs);

        var defaultCvId = getDefaultCvId();
        if (Number(defaultCvId) === Number(cv.id)) {
          setDefaultCvId(deps.state.cvs.length ? deps.state.cvs[0].id : 0);
        }

        renderCvList();
      }
    }

    function getActivePreviewCvId() {
      return activePreviewCvId;
    }

    return {
      updateUserInfoUI: updateUserInfoUI,
      openAccountSettingsModal: openAccountSettingsModal,
      closeAccountSettingsModal: closeAccountSettingsModal,
      submitAccountSettings: submitAccountSettings,
      getDefaultCvStorageKey: getDefaultCvStorageKey,
      getDefaultCvId: getDefaultCvId,
      setDefaultCvId: setDefaultCvId,
      updateCvStats: updateCvStats,
      renderCvList: renderCvList,
      openCvPreviewModal: openCvPreviewModal,
      closeCvPreviewModal: closeCvPreviewModal,
      openCvEditModal: openCvEditModal,
      closeCvEditModal: closeCvEditModal,
      submitCvEdit: submitCvEdit,
      handleCvAction: handleCvAction,
      getActivePreviewCvId: getActivePreviewCvId
    };
  }

  window.CandidateModules.CvProfile = {
    createCvProfileApi: createCvProfileApi
  };
})();
