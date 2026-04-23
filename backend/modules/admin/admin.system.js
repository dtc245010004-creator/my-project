(function () {
  window.AdminModules = window.AdminModules || {};

  function toast(message, type) {
    var wrap = document.getElementById("toastWrap");
    if (!wrap) return;

    var node = document.createElement("div");
    node.className = "toast " + (type || "success");
    node.textContent = message;
    wrap.appendChild(node);

    setTimeout(function () {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 2600);
  }

  function getModuleLabel(module, normalizeFn) {
    var key = (normalizeFn || function (v) { return String(v || "").trim().toLowerCase(); })(module);
    var labels = {
      overview: "Báo cáo",
      approval: "Kiểm duyệt tin",
      users: "Quản lý người dùng",
      industries: "Danh mục hệ thống",
      payments: "Thanh toán",
      policies: "Chính sách",
      contacts: "Danh sách liên hệ",
      settings: "Cài đặt hệ thống",
      logs: "Nhật ký hoạt động",
      system: "Hệ thống"
    };
    return labels[key] || "Hệ thống";
  }

  function formatDate(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value || "N/A";
    }

    return [String(d.getDate()).padStart(2, "0"), String(d.getMonth() + 1).padStart(2, "0"), d.getFullYear()].join("/");
  }

  function formatDateTime(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return "Không rõ";
    }

    return d.toLocaleString("vi-VN");
  }

  function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + "đ";
  }

  function createRenderSystemSettings(deps) {
    return function renderSystemSettings() {
      if (deps.el.settingEmailNotifications) {
        deps.el.settingEmailNotifications.checked = !!deps.state.systemSettings.emailNotifications;
      }
      if (deps.el.settingAutoLog) {
        deps.el.settingAutoLog.checked = !!deps.state.systemSettings.autoLog;
      }
      if (deps.el.settingFastModeration) {
        deps.el.settingFastModeration.checked = !!deps.state.systemSettings.fastModeration;
      }
    };
  }

  function createSaveSystemSettings(deps) {
    return function saveSystemSettings() {
      deps.state.systemSettings = {
        emailNotifications: !!(deps.el.settingEmailNotifications && deps.el.settingEmailNotifications.checked),
        autoLog: !!(deps.el.settingAutoLog && deps.el.settingAutoLog.checked),
        fastModeration: !!(deps.el.settingFastModeration && deps.el.settingFastModeration.checked)
      };

      deps.persistAll();
      deps.toast("Đã lưu cài đặt hệ thống.", "success");
      deps.addLog("Cập nhật cài đặt hệ thống.", { module: "settings", force: true });
    };
  }

  function createRenderActivityLogs(deps) {
    return function renderActivityLogs() {
      if (!deps.el.systemLog) return;

      var logs = Array.isArray(deps.state.activityLogs) ? deps.state.activityLogs : [];
      if (!logs.length) {
        deps.el.systemLog.innerHTML = "<li>Chưa có nhật ký hoạt động.</li>";
        return;
      }

      deps.el.systemLog.innerHTML = logs.slice(0, 200).map(function (entry) {
        var time = deps.formatDateTime(entry.createdAt || new Date().toISOString());
        var moduleLabel = deps.getModuleLabel(entry.module, deps.normalize);
        return "<li>[" + time + "] [" + moduleLabel + "] " + entry.message + "</li>";
      }).join("");
    };
  }

  function createAddLog(deps) {
    return function addLog(text, options) {
      options = options || {};
      if (!deps.state.systemSettings || (deps.state.systemSettings.autoLog === false && !options.force)) return;

      var entry = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        module: options.module || "system",
        message: String(text || ""),
        createdAt: new Date().toISOString()
      };

      if (!Array.isArray(deps.state.activityLogs)) {
        deps.state.activityLogs = [];
      }

      deps.state.activityLogs.unshift(entry);
      if (deps.state.activityLogs.length > 500) {
        deps.state.activityLogs = deps.state.activityLogs.slice(0, 500);
      }

      deps.persistAll();
      deps.renderActivityLogs();
    };
  }

  function clearCookies() { // Xóa tất cả cookie liên quan đến admin hoặc token/session
    var cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach(function (cookie) {
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }

  function createLogoutAdmin(deps) { // Đăng xuất admin, xóa session/local storage và cookies liên quan
    return function logoutAdmin() {
      var ok = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (!ok) return;

      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("adminSession");

      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");

      Object.keys(localStorage).forEach(function (key) {
        if (deps.normalize(key).indexOf("admin") >= 0 || deps.normalize(key).indexOf("token") >= 0 || deps.normalize(key).indexOf("session") >= 0) {
          localStorage.removeItem(key);
        }
      });

      deps.clearCookies();

      if (window.caches && typeof window.caches.keys === "function") {
        window.caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (k) { return window.caches.delete(k); }));
        }).finally(function () {
          window.location.href = "login.html";
        });
        return;
      }

      window.location.href = "login.html";
    };
  }

  window.AdminModules.system = {
    toast: toast,
    getModuleLabel: getModuleLabel,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatCurrency: formatCurrency,
    createRenderSystemSettings: createRenderSystemSettings,
    createSaveSystemSettings: createSaveSystemSettings,
    clearCookies: clearCookies,
    createRenderActivityLogs: createRenderActivityLogs,
    createAddLog: createAddLog,
    createLogoutAdmin: createLogoutAdmin
  };
})();
