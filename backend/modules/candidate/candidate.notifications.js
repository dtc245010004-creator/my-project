(function () {
  window.CandidateModules = window.CandidateModules || {};

  function createNotificationApi(deps) {
    function getAdminContacts() {
      var items = deps.readJson("ADMIN_CONTACTS", []);
      return Array.isArray(items) ? items : [];
    }

    function saveAdminContacts(items) {
      deps.writeJson("ADMIN_CONTACTS", items);
    }

    function getCandidateContacts() {
      var contacts = getAdminContacts();
      if (!deps.state.user) {
        return [];
      }

      var email = deps.normalize(deps.state.user.email);
      return contacts.filter(function (contact) {
        return deps.normalize(contact.email) === email && deps.normalize(contact.source) === "candidate";
      });
    }

    function isCandidateNotificationItem(contact) {
      var status = deps.normalize(contact && contact.status);
      return status === "processing" || status === "replied" || status === "done";
    }

    function isCandidateNotificationUnread(contact) {
      if (!contact || !isCandidateNotificationItem(contact)) {
        return false;
      }

      var seenAt = new Date(contact.candidateReadAt || 0).getTime();
      var updatedAt = new Date(contact.updatedAt || contact.createdAt || 0).getTime();
      return !seenAt || updatedAt > seenAt;
    }

    function getCandidateNotifications() {
      return getCandidateContacts().filter(isCandidateNotificationItem).slice().sort(function (left, right) {
        return new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime();
      });
    }

    function formatCandidateNotificationLabel(contact) {
      var status = deps.normalize(contact && contact.status);
      if (status === "processing") return "Admin đã chuyển xử lý";
      if (status === "replied") return "Admin đã phản hồi";
      if (status === "done") return "Liên hệ đã xử lý xong";
      return "Thông báo mới";
    }

    function updateNotificationBadge() {
      var countEl = document.getElementById("candidateNotificationCount");
      var buttonEl = document.getElementById("candidateNotificationBtn");

      if (!countEl || !buttonEl) {
        return;
      }

      var unread = getCandidateNotifications().filter(isCandidateNotificationUnread).length;
      countEl.textContent = "(" + String(unread) + ")";
      buttonEl.style.opacity = unread > 0 ? "1" : "0.95";
    }

    function renderNotifications() {
      var listEl = document.getElementById("notificationList");
      if (!listEl) {
        return;
      }

      var notifications = getCandidateNotifications();
      if (!notifications.length) {
        listEl.innerHTML = '<div class="empty-note">Chưa có thông báo mới từ admin.</div>';
        return;
      }

      listEl.innerHTML = notifications.map(function (contact) {
        var unread = isCandidateNotificationUnread(contact);
        var note = String(contact.adminNote || contact.replyNote || contact.content || "").trim();
        return (
          '<div style="border:1px solid #dbe3f2;border-radius:10px;padding:10px;background:' + (unread ? "#eff6ff" : "#fff") + ';">' +
            '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">' +
              '<div>' +
                '<div style="font-weight:700;color:#1f3563;">' + deps.escapeHtml(contact.title || "Thông báo") + '</div>' +
                '<div style="font-size:12px;color:#64748b;margin-top:2px;">' + deps.escapeHtml(formatCandidateNotificationLabel(contact)) + ' • ' + deps.escapeHtml(deps.formatDateTime(contact.updatedAt || contact.createdAt)) + '</div>' +
              '</div>' +
              (unread ? '<span style="font-size:11px;font-weight:700;color:#1d4ed8;background:#dbeafe;border:1px solid #bfdbfe;border-radius:999px;padding:3px 8px;">Mới</span>' : "") +
            '</div>' +
            '<div style="margin-top:8px;font-size:13px;color:#334155;line-height:1.45;">' + deps.escapeHtml(note) + '</div>' +
          '</div>'
        );
      }).join("");
    }

    function markCandidateNotificationsRead() {
      if (!deps.state.user) {
        return;
      }

      var now = new Date().toISOString();
      var email = deps.normalize(deps.state.user.email);
      var contacts = getAdminContacts().map(function (contact) {
        if (deps.normalize(contact.email) !== email || deps.normalize(contact.source) !== "candidate") {
          return contact;
        }

        if (!isCandidateNotificationItem(contact)) {
          return contact;
        }

        return Object.assign({}, contact, {
          candidateReadAt: now
        });
      });

      saveAdminContacts(contacts);
      updateNotificationBadge();
      renderNotifications();
    }

    function openNotificationsModal() {
      var backdrop = document.getElementById("notificationBackdrop");
      if (!backdrop) {
        return;
      }

      renderNotifications();
      backdrop.style.display = "flex";
      markCandidateNotificationsRead();
    }

    function closeNotificationsModal() {
      var backdrop = document.getElementById("notificationBackdrop");
      if (!backdrop) {
        return;
      }

      backdrop.style.display = "none";
    }

    function submitAdminContact(sourceRole, sourceName) {
      if (!deps.state.user) {
        alert("Vui lòng đăng nhập để gửi liên hệ.");
        return;
      }

      var titleEl = document.getElementById("candidateContactTitle");
      var contentEl = document.getElementById("candidateContactContent");
      if (!titleEl || !contentEl) {
        return;
      }

      var title = String(titleEl.value || "").trim();
      var content = String(contentEl.value || "").trim();
      if (!title || !content) {
        alert("Vui lòng nhập đầy đủ tiêu đề và nội dung liên hệ.");
        return;
      }

      var contacts = getAdminContacts();
      var nextId = contacts.reduce(function (max, item) {
        return Math.max(max, Number(item.id) || 0);
      }, 0) + 1;

      contacts.unshift({
        id: nextId,
        fullName: deps.state.user.name || sourceName || "Candidate",
        email: deps.state.user.email || "",
        role: sourceRole,
        source: "candidate",
        title: title,
        content: content,
        status: "new",
        history: [
          {
            action: "created",
            label: "Đã gửi liên hệ tới admin",
            at: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      });

      saveAdminContacts(contacts);
      titleEl.value = "";
      contentEl.value = "";
      alert("Đã gửi liên hệ tới admin.");
    }

    return {
      getCandidateNotifications: getCandidateNotifications,
      markCandidateNotificationsRead: markCandidateNotificationsRead,
      openNotificationsModal: openNotificationsModal,
      closeNotificationsModal: closeNotificationsModal,
      updateNotificationBadge: updateNotificationBadge,
      renderNotifications: renderNotifications,
      submitAdminContact: submitAdminContact
    };
  }

  window.CandidateModules.Notifications = {
    createNotificationApi: createNotificationApi
  };
})();
