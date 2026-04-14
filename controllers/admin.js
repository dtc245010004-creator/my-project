// Mã nguồn quản trị viên cho hệ thống tuyển dụng trực tuyến
(function () {
  // Kiểm tra quyền Admin trước tiên
  if (!window.Auth || !Auth.checkRole('admin')) {
    window.location.href = 'login.html';
    return;
  }

  var STORAGE = {
    PENDING_JOBS: "ADMIN_PENDING_JOBS",
    USERS: "ADMIN_USERS",
    INDUSTRIES: "ADMIN_INDUSTRIES",
    CONTACTS: "ADMIN_CONTACTS",
    SYSTEM_SETTINGS: "ADMIN_SYSTEM_SETTINGS",
    ACTIVITY_LOGS: "ADMIN_ACTIVITY_LOGS"
  };
// Dữ liệu mẫu cho các tin tuyển dụng đang chờ duyệt, người dùng, ngành nghề và liên hệ hỗ trợ
  var DEFAULT_PENDING_JOBS = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      owner: "hr@techcorp.com",
      submittedAt: "2026-04-03",
      status: "pending",
      salary: "$1800 - $2500",
      location: "Hồ Chí Minh",
      description: "Phát triển giao diện web với React,tối ưu hóa trải nghiệm người dùng.",
      requirements: "React, JavaScript, REST API, 3+ nam kinh nghiem"
    },
    {
      id: 2,
      title: "UI Designer Intern",
      company: "Blue Pixel",
      owner: "recruit@bluepixel.vn",
      submittedAt: "2026-04-02",
      status: "pending",
      salary: "$300 - $500",
      location: "Đà Nẵng",
      description: "Hỗ trợ thiết kế wireframe, mockup và thử nghiệm giao diện di động.",
      requirements: "Figma, tư duy UX cơ bản"
    },
    {
      id: 3,
      title: "Crypto Specialist",
      company: "Fast Coin",
      owner: "owner@fastcoin.xyz",
      submittedAt: "2026-04-01",
      status: "violation",
      salary: "$2500+",
      location: "Remote",
      description: "Nội dung có dấu hiệu gây hiểu nhầm và vi phạm chính sách nên bị đánh dấu.",
      requirements: "Blockchain, tuân thủ pháp lý"
    },
    {
      id: 4,
      title: "Backend Engineer",
      company: "Nexa",
      owner: "jobs@nexa.io",
      submittedAt: "2026-04-02",
      status: "pending",
      salary: "$1600 - $2200",
      location: "Hà Nội",
      description: "ây dựng API và tối ưu CSDL cho nền tảng tuyển dụng.",
      requirements: "Node.js, SQL/NoSQL, Docker"
    },
    {
      id: 5,
      title: "Part-time Data Entry",
      company: "Quick Money",
      owner: "admin@quick-money.biz",
      submittedAt: "2026-03-31",
      status: "violation",
      salary: "$1000+",
      location: "Remote",
      description: "Tin có dấu hiệu lừa đảo và thông tin không minh bạch.",
      requirements: "Không rõ "
    },
    {
      id: 6,
      title: "Mobile Lead",
      company: "Smart Labs",
      owner: "hire@smartlabs.vn",
      submittedAt: "2026-03-30",
      status: "locked",
      salary: "$2200 - $3000",
      location: "Hồ Chí Minh",
      description: "ẫn dắt team mobile và xây dựng lộ trình sản phẩm.",
      requirements: "Flutter/React Native, kinh nghiệm lead"
    },
    {
      id: 7,
      title: "QA Engineer",
      company: "Quality First",
      owner: "qa@qualityfirst.vn",
      submittedAt: "2026-03-29",
      status: "pending",
      salary: "$1000 - $1500",
      location: "Cần Thơ",
      description: "Thiết lập test plan, test case và báo cáo chất lượng release.",
      requirements: "Manual test, API testing"
    }
  ];

  var DEFAULT_USERS = [
    {
      id: 101,
      name: "Tran Minh",
      email: "tranminh@techcorp.vn",
      company: "Tech Corp",
      joinedAt: "2025-12-12",
      role: "recruiter",
      status: "active",
      permissions: ["view", "post_job"]
    },
    {
      id: 102,
      name: "Nguyen Anh",
      email: "nguyenanh@gmail.com",
      company: "-",
      joinedAt: "2026-01-05",
      role: "candidate",
      status: "active",
      permissions: ["view", "apply"]
    },
    {
      id: 103,
      name: "Le Phuong",
      email: "lephuong@biz.vn",
      company: "Talent Hub",
      joinedAt: "2025-08-21",
      role: "recruiter",
      status: "locked",
      lockReason: "Vi phạm chính sách nội dung",
      permissions: ["view"]
    },
    {
      id: 104,
      name: "Pham Huy",
      email: "huypham@gmail.com",
      company: "-",
      joinedAt: "2026-02-01",
      role: "candidate",
      status: "active",
      permissions: ["view", "apply"]
    },
    {
      id: 105,
      name: "Blue Pixel",
      email: "contact@bluepixel.vn",
      company: "Blue Pixel",
      joinedAt: "2025-10-18",
      role: "company",
      status: "active",
      permissions: ["view", "post_job"]
    }
  ];
  var DEFAULT_INDUSTRIES = [  // Dữ liệu mẫu cho các ngành nghề phổ biến trong hệ thống tuyển dụng
    "ông nghệ thông tin",
    "Tài chính - Ngân hàng",
    "Marketing - Truyền thông",
    "Thiết kế - sáng tạo",
    "Logistics"
  ];
// Dữ liệu mẫu cho các liên hệ hỗ trợ từ người dùng
  var DEFAULT_CONTACTS = [
    {
      id: 1,
      fullName: "Bui Quang",
      email: "quang.bui@gmail.com",
      title: "Bao cao loi ung tuyen",
      content: "Tôi gặp lỗi khi nộp CV cho tin Frontend. Mong admin hỗ trơ kiểm tra.",
      status: "new",
      createdAt: "2026-04-03T09:20:00"
    },
    {
      id: 2,
      fullName: "Le Nhi",
      email: "hr@sunjobs.vn",
      title: "Cập nhật thông tin công ty",
      content: "Nhờ bộ phận admin cấp quyền cập nhật logo công ty cho tài khoản doanh nghiệp.",
      status: "new",
      createdAt: "2026-04-02T13:10:00"
    }
  ];
// Hàm tiện ích để đọc và ghi dữ liệu JSON từ localStorage
  var POLICIES = [
    {
      title: "Chính sách đăng tin tuyển dụng",
      content: "Nội dung tin đăng phải rõ ràng, trung thực, không chứa nội dung lừa đảo hoặc phân biệt đối xử."
    },
    {
      title: "Chính sách bảo mật dữ liệu",
      content: "Hệ thống mã hóa thông tin nhạy cảm và giới hạn truy cập theo vai trò người dùng."
    },
    {
      title: "Chính sách xử lý vi phạm",
      content: "Tài khoản vi phạm sẽ bị cảnh báo, khóa tạm thời hoặc khóa vĩnh viễn tùy theo mức độ."
    }
  ];

  var DEFAULT_SYSTEM_SETTINGS = {
    emailNotifications: true,
    autoLog: true,
    fastModeration: false
  };

  var RANGE_CONFIG = {
    "7d": { labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], values: [20, 28, 24, 33, 41, 37, 46] },
    "30d": { labels: ["W1", "W2", "W3", "W4"], values: [122, 138, 149, 171] },
    "90d": { labels: ["Th1", "Th2", "Th3"], values: [420, 468, 503] },
    "1y": { labels: ["Q1", "Q2", "Q3", "Q4"], values: [1240, 1360, 1498, 1622] }
  };

  var PERMISSIONS = [
    { key: "view", label: "Xem" },
    { key: "edit", label: "Sửa" },
    { key: "delete", label: "Xóa" },
    { key: "approve_job", label: "Duyệt tin" },
    { key: "finance", label: "Quản lý tài chính" },
    { key: "post_job", label: "Đăng tin" },
    { key: "apply", label: "Ứng tuyển" }
  ];

  function readJson(key, fallback) { // Hàm tiện ích để đọc dữ liệu JSON từ localStorage, trả về giá trị mặc định nếu có lỗi hoặc không tồn tại
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJson(key, value) {// Hàm tiện ích để ghi dữ liệu JSON vào localStorage
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalize(text) {  // Hàm tiện ích để chuẩn hóa chuỗi văn bản, loại bỏ khoảng trắng và chuyển về chữ thường để so sánh hoặc lưu trữ nhất quán
    return String(text || "").trim().toLowerCase();
  }

  var state = { 
    pendingJobs: readJson(STORAGE.PENDING_JOBS, DEFAULT_PENDING_JOBS.slice()),
    users: readJson(STORAGE.USERS, DEFAULT_USERS.slice()),
    industries: readJson(STORAGE.INDUSTRIES, DEFAULT_INDUSTRIES.slice()),
    contacts: readJson(STORAGE.CONTACTS, DEFAULT_CONTACTS.slice()),
    systemSettings: Object.assign({}, DEFAULT_SYSTEM_SETTINGS, readJson(STORAGE.SYSTEM_SETTINGS, {})),
    activityLogs: readJson(STORAGE.ACTIVITY_LOGS, []),
    allTransactions: readJson("ALL_TRANSACTIONS_DATA", []),
    currentFilter: "all",
    currentPage: 1,
    pageSize: 4,
    searchKeyword: "",
    userStatusFilter: "all",
    userRoleFilter: "all",
    userScope: "all",
    rejectTargetId: null,
    detailTargetId: null,
    userDetailTargetId: null,
    companyTargetName: null,
    permissionTargetId: null,
    contactTargetId: null,
    statsRange: "7d",
    paymentSearchKeyword: ""
  };

  var el = {
    pendingTableBody: document.getElementById("pendingTableBody"),
    userTableBody: document.getElementById("userTableBody"),
    companyTableBody: document.getElementById("companyTableBody"),
    industryList: document.getElementById("industryList"),
    growthBars: document.getElementById("growthBars"),
    pageInfo: document.getElementById("pageInfo"),
    btnPrevPage: document.getElementById("btnPrevPage"),
    btnNextPage: document.getElementById("btnNextPage"),
    rejectModalBackdrop: document.getElementById("rejectModalBackdrop"),
    rejectReason: document.getElementById("rejectReason"),
    kpiUsers: document.getElementById("kpiUsers"),
    kpiRevenuePosts: document.getElementById("kpiRevenuePosts"),
    kpiPending: document.getElementById("kpiPending"),
    kpiViolation: document.getElementById("kpiViolation"),
    systemLog: document.getElementById("systemLog"),
    approvalTitle: document.getElementById("approvalTitle"),
    approvalPanel: document.getElementById("approvalPanel"),
    approvalSection: document.getElementById("approvalSection"),
    overviewGrid: document.getElementById("overviewGrid"),
    systemGrid: document.getElementById("systemGrid"),
    growthPanel: document.getElementById("growthPanel"),
    usersPanel: document.getElementById("usersPanel"),
    industryPanel: document.getElementById("industryPanel"),
    logPanel: document.getElementById("logPanel"),
    paymentsPanel: document.getElementById("paymentsPanel"),
    settingsPanel: document.getElementById("settingsPanel"),
    policiesPanel: document.getElementById("policiesPanel"),
    contactsPanel: document.getElementById("contactsPanel"),
    depositRequestsList: document.getElementById("depositRequestsList"),
    paymentHistoryList: document.getElementById("paymentHistoryList"),
    paymentPendingCount: document.getElementById("paymentPendingCount"),
    paymentPendingTotal: document.getElementById("paymentPendingTotal"),
    paymentSearch: document.getElementById("paymentSearch"),
    settingEmailNotifications: document.getElementById("settingEmailNotifications"),
    settingAutoLog: document.getElementById("settingAutoLog"),
    settingFastModeration: document.getElementById("settingFastModeration"),
    btnSaveSystemSettings: document.getElementById("btnSaveSystemSettings"),
    policiesList: document.getElementById("policiesList"),
    contactsList: document.getElementById("contactsList"),
    menuLinks: Array.prototype.slice.call(document.querySelectorAll(".menu a[data-view]")),
    filterGroup: document.getElementById("filterGroup"),
    globalSearch: document.getElementById("globalSearch"),
    btnAddIndustry: document.getElementById("btnAddIndustry"),
    industryInput: document.getElementById("industryInput"),
    btnExport: document.getElementById("btnExport"),
    exportFormat: document.getElementById("exportFormat"),
    btnBell: document.getElementById("btnBell"),
    btnLogout: document.getElementById("btnLogout"),
    btnCloseRejectModal: document.getElementById("btnCloseRejectModal"),
    btnCancelReject: document.getElementById("btnCancelReject"),
    btnConfirmReject: document.getElementById("btnConfirmReject"),
    statsRange: document.getElementById("statsRange"),
    statsSummary: document.getElementById("statsSummary"),
    approvalStatusChart: document.getElementById("approvalStatusChart"),
    userStatusFilter: document.getElementById("userStatusFilter"),
    userRoleFilter: document.getElementById("userRoleFilter"),
    userScopeButtons: Array.prototype.slice.call(document.querySelectorAll(".scope-btn[data-scope]")),
    kpiSection: document.querySelector(".kpis"),
    headerSection: document.querySelector(".header"),
    jobDetailModalBackdrop: document.getElementById("jobDetailModalBackdrop"),
    jobDetailBody: document.getElementById("jobDetailBody"),
    btnCloseJobDetailModal: document.getElementById("btnCloseJobDetailModal"),
    btnCloseJobDetail: document.getElementById("btnCloseJobDetail"),
    btnApproveFromDetail: document.getElementById("btnApproveFromDetail"),
    permissionModalBackdrop: document.getElementById("permissionModalBackdrop"),
    permissionModalBody: document.getElementById("permissionModalBody"),
    btnClosePermissionModal: document.getElementById("btnClosePermissionModal"),
    btnCancelPermission: document.getElementById("btnCancelPermission"),
    btnSavePermission: document.getElementById("btnSavePermission"),
    contactModalBackdrop: document.getElementById("contactModalBackdrop"),
    contactModalBody: document.getElementById("contactModalBody"),
    contactDepartment: document.getElementById("contactDepartment"),
    contactReplyNote: document.getElementById("contactReplyNote"),
    contactHistoryList: document.getElementById("contactHistoryList"),
    btnCloseContactModal: document.getElementById("btnCloseContactModal"),
    btnCloseContact: document.getElementById("btnCloseContact"),
    btnForwardContact: document.getElementById("btnForwardContact"),
    btnReplyContact: document.getElementById("btnReplyContact"),
    btnMarkContactDone: document.getElementById("btnMarkContactDone")
    ,userDetailModalBackdrop: document.getElementById("userDetailModalBackdrop")
    ,userDetailBody: document.getElementById("userDetailBody")
    ,btnCloseUserDetailModal: document.getElementById("btnCloseUserDetailModal")
    ,btnCloseUserDetail: document.getElementById("btnCloseUserDetail")
    ,btnToggleFromDetail: document.getElementById("btnToggleFromDetail")
    ,companyDetailModalBackdrop: document.getElementById("companyDetailModalBackdrop")
    ,companyDetailBody: document.getElementById("companyDetailBody")
    ,btnCloseCompanyDetailModal: document.getElementById("btnCloseCompanyDetailModal")
    ,btnCloseCompanyDetail: document.getElementById("btnCloseCompanyDetail")
    ,btnToggleCompanyStatus: document.getElementById("btnToggleCompanyStatus")
  };

  function persistAll() { // Hàm tiện ích để lưu tất cả dữ liệu hiện tại của state vào localStorage
    writeJson(STORAGE.PENDING_JOBS, state.pendingJobs);
    writeJson(STORAGE.USERS, state.users);
    writeJson(STORAGE.INDUSTRIES, state.industries);
    writeJson(STORAGE.CONTACTS, state.contacts);
    writeJson(STORAGE.SYSTEM_SETTINGS, state.systemSettings);
    writeJson(STORAGE.ACTIVITY_LOGS, state.activityLogs);
  }

  function syncUsersToAuthStore() {// Hàm tiện ích để đồng bộ dữ liệu người dùng từ localStorage của admin sang hệ thống Auth nếu có sự khác biệt, đảm bảo dữ liệu người dùng luôn nhất quán giữa hai nơi
    writeJson("users", state.users);
  }

  function syncSharedJobs(removedJobId) { // Hàm tiện ích để đồng bộ dữ liệu tin tuyển dụng giữa localStorage của admin và các kho lưu trữ khác (như JOBS_DATA, jobPosts) khi có sự thay đổi như xóa tin, đảm bảo tất cả kho lưu trữ đều được cập nhật nhất quán
    var jobKeys = ["JOBS_DATA", "jobs", "jobPosts"];
    var applicationKeys = ["APPLICATIONS_DATA", "applications"];

    jobKeys.forEach(function (key) {
      var jobs = readJson(key, []);
      if (!Array.isArray(jobs) || !jobs.length) return;

      var nextJobs = jobs.filter(function (job) {
        return Number(job.id) !== Number(removedJobId);
      });

      localStorage.setItem(key, JSON.stringify(nextJobs));
    });

    applicationKeys.forEach(function (key) {
      var applications = readJson(key, []);
      if (!Array.isArray(applications) || !applications.length) return;

      var nextApplications = applications.filter(function (item) {
        return Number(item.jobId) !== Number(removedJobId);
      });

      localStorage.setItem(key, JSON.stringify(nextApplications));
    });
  }

  function patchSharedJob(jobId, fields) { // Hàm tiện ích để cập nhật một tin tuyển dụng cụ thể trong tất cả kho lưu trữ liên quan (như JOBS_DATA, jobPosts) khi có sự thay đổi như duyệt tin, đảm bảo tất cả kho lưu trữ đều được cập nhật nhất quán với các trường đã thay đổi
    var jobKeys = ["JOBS_DATA", "jobs", "jobPosts"];
    jobKeys.forEach(function (key) {
      var jobs = readJson(key, []);
      if (!Array.isArray(jobs) || !jobs.length) return;

      var changed = false;
      var nextJobs = jobs.map(function (job) {
        if (Number(job.id) !== Number(jobId)) return job;
        changed = true;
        return Object.assign({}, job, fields);
      });

      if (changed) {
        localStorage.setItem(key, JSON.stringify(nextJobs));
      }
    });
  }

  // Load data from Auth system and sync with localStorage
  function loadAllData() { // Hàm tiện ích để tải dữ liệu từ hệ thống Auth (nếu có) và đồng bộ với localStorage của admin, đảm bảo dữ liệu hiển thị trong trang quản trị luôn cập nhật và nhất quán với hệ thống chính
    try {
      // Get data from Auth system
      var authUsers = Auth.getUsers ? Auth.getUsers() : [];
      var authJobs = Auth.getJobs ? Auth.getJobs() : [];
      var authApplications = Auth.getApplications ? Auth.getApplications() : [];

      // Map jobs to pending jobs format for admin review
      var pendingJobsList = authJobs.map(function (job) {
        // Find recruiter/owner info
        var recruiterInfo = authUsers.find(function(user) {
          return user.role === 'recruiter' && user.company === job.company;
        }) || {};

        return {
          id: job.id || Math.random().toString(36).substr(2, 9),
          title: job.title || '',
          company: job.company || '',
          owner: recruiterInfo.email || job.recruiterEmail || job.postedBy || 'unknown',
          submittedAt: job.createdAt || new Date().toISOString().split('T')[0],
          status: job.status === 'closed' ? 'approved' : (job.status || 'pending'),
          featured: !!job.featured,
          pinnedByAdmin: !!job.pinnedByAdmin,
          pinnedAt: job.pinnedAt || null,
          salary: job.salary || 'Đang cập nhật',
          location: job.location || '',
          description: job.description || '',
          requirements: job.requirements || ''
        };
      });

      // Update state with Auth data
      state.pendingJobs = pendingJobsList.length > 0 ? pendingJobsList : readJson(STORAGE.PENDING_JOBS, []);
      state.users = authUsers.length > 0 ? authUsers : readJson(STORAGE.USERS, []);
      state.contacts = readJson(STORAGE.CONTACTS, []);
      state.systemSettings = Object.assign({}, DEFAULT_SYSTEM_SETTINGS, readJson(STORAGE.SYSTEM_SETTINGS, {}));
      state.allTransactions = readJson("ALL_TRANSACTIONS_DATA", readJson("allTransactions", []));

      // Persist the loaded data
      persistAll();
    } catch (err) {
      console.error('Error loading data from Auth:', err);
    }
  }

  function toast(message, type) { // Hàm tiện ích để hiển thị thông báo dạng toast với nội dung và kiểu (thành công, lỗi, cảnh báo), tự động ẩn sau một khoảng thời gian ngắn
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

  function getModuleLabel(module) { // Hàm tiện ích để lấy nhãn hiển thị cho một module hoặc phần của hệ thống dựa trên tên module đã chuẩn hóa, giúp hiển thị thông tin rõ ràng hơn trong các log hoạt động hoặc báo cáo
    var key = normalize(module);
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

  function renderActivityLogs() { // Hàm tiện ích để hiển thị danh sách các log hoạt động của hệ thống trong phần quản trị, giúp admin theo dõi các sự kiện quan trọng như duyệt tin, khóa tài khoản, cập nhật hệ thống, v.v. Log được hiển thị theo định dạng có thời gian, module liên quan và nội dung thông điệp
    if (!el.systemLog) return;

    var logs = Array.isArray(state.activityLogs) ? state.activityLogs : [];
    if (!logs.length) {
      el.systemLog.innerHTML = "<li>Chưa có nhật ký hoạt động.</li>";
      return;
    }

    el.systemLog.innerHTML = logs.slice(0, 200).map(function (entry) {
      var time = formatDateTime(entry.createdAt || new Date().toISOString());
      var moduleLabel = getModuleLabel(entry.module);
      return "<li>[" + time + "] [" + moduleLabel + "] " + entry.message + "</li>";
    }).join("");
  }

  function addLog(text, options) { // Hàm tiện ích để thêm một log hoạt động mới vào hệ thống, với nội dung thông điệp và các tùy chọn như module liên quan, có thể bỏ qua việc ghi log nếu cài đặt autoLog tắt trừ khi có tùy chọn force. Log mới sẽ được thêm vào đầu danh sách và giới hạn tối đa 500 mục để tránh quá tải dữ liệu
    options = options || {};
    if (!state.systemSettings || (state.systemSettings.autoLog === false && !options.force)) return;

    var entry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      module: options.module || "system",
      message: String(text || ""),
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(state.activityLogs)) {
      state.activityLogs = [];
    }

    state.activityLogs.unshift(entry);
    if (state.activityLogs.length > 500) {
      state.activityLogs = state.activityLogs.slice(0, 500);
    }

    persistAll();
    renderActivityLogs();
  }

  function setActiveView(view) { // Hàm tiện ích để chuyển đổi giữa các view hoặc module khác nhau trong trang quản trị dựa trên tham số view, cập nhật trạng thái active của menu, hiển thị hoặc ẩn các phần tử liên quan đến từng view như header, KPI, bảng dữ liệu, v.v. Giúp admin dễ dàng điều hướng và quản lý các chức năng khác nhau của hệ thống
    el.menuLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-view") === view);
    });

    if (el.headerSection) el.headerSection.style.display = "grid";
    if (el.kpiSection) el.kpiSection.style.display = view === "overview" ? "grid" : "none";

    if (el.approvalSection) el.approvalSection.style.display = (view === "approval" || view === "overview" || view === "users" || view === "industries") ? "block" : "none";
    if (el.approvalTitle) el.approvalTitle.style.display = view === "approval" ? "block" : "none";
    if (el.approvalPanel) el.approvalPanel.style.display = view === "approval" ? "block" : "none";

    if (el.overviewGrid) {
      el.overviewGrid.style.display = (view === "overview" || view === "users") ? "grid" : "none";
      el.overviewGrid.style.gridTemplateColumns = view === "users" ? "1fr" : "1.2fr 1fr";
    }
    if (el.growthPanel) el.growthPanel.style.display = view === "overview" ? "block" : "none";
    if (el.usersPanel) el.usersPanel.style.display = view === "users" ? "block" : "none";

    var isSystemView = view === "industries" || view === "logs";
    if (el.systemGrid) {
      el.systemGrid.style.display = isSystemView ? "grid" : "none";
      el.systemGrid.style.gridTemplateColumns = view === "logs" ? "1fr" : "1.2fr 1fr";
    }
    if (el.industryPanel) el.industryPanel.style.display = view === "industries" ? "block" : "none";
    if (el.logPanel) el.logPanel.style.display = isSystemView ? "block" : "none";

    if (el.paymentsPanel) el.paymentsPanel.style.display = view === "payments" ? "block" : "none";
    if (el.settingsPanel) el.settingsPanel.style.display = view === "settings" ? "block" : "none";
    if (el.policiesPanel) el.policiesPanel.style.display = view === "policies" ? "block" : "none";
    if (el.contactsPanel) el.contactsPanel.style.display = view === "contacts" ? "block" : "none";
  }

  function statusBadge(status) { // Hàm tiện ích để trả về một đoạn HTML chứa badge với màu sắc và nhãn tương ứng dựa trên trạng thái của tin tuyển dụng (pending, violation, approved, locked), giúp hiển thị trực quan tình trạng của từng tin trong bảng quản trị
    if (status === "pending") {
      return "<span class='badge pending'>Chờ duyệt</span>";
    }
    if (status === "violation") {
      return "<span class='badge violation'>Vi phạm</span>";
    }
    if (status === "approved") {
      return "<span class='badge active'>Đã duyệt</span>";
    }
    return "<span class='badge locked'>Đã khóa</span>";
  }

  function formatDate(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value || "N/A";
    }

    return [String(d.getDate()).padStart(2, "0"), String(d.getMonth() + 1).padStart(2, "0"), d.getFullYear()].join("/");
  }

  function formatDateTime(value) { // Hàm tiện ích để định dạng một giá trị ngày giờ thành chuỗi hiển thị theo định dạng ngày/tháng/năm và giờ:phút, giúp hiển thị thông tin thời gian một cách rõ ràng và dễ đọc trong các log hoạt động hoặc chi tiết tin tuyển dụng
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return "Không rõ";
    }

    return d.toLocaleString("vi-VN");
  }

  function renderKpis() { // Hàm tiện ích để tính toán và hiển thị các chỉ số KPI chính trong phần tổng quan của trang quản trị, bao gồm tổng số người dùng, doanh thu từ các tin tuyển dụng đã duyệt, số lượng tin đang chờ duyệt và số lượng tin vi phạm. Các chỉ số này được tính toán dựa trên dữ liệu hiện tại trong state và hiển thị trực tiếp trên giao diện để admin có cái nhìn tổng quan về tình hình hoạt động của hệ thống
    var totalUsers = state.users.length;
    var pendingCount = state.pendingJobs.filter(function (j) { return j.status === "pending"; }).length;
    var violationCount = state.pendingJobs.filter(function (j) { return j.status === "violation"; }).length;
    var newPosts = state.pendingJobs.length;
    var revenue = (Array.isArray(state.allTransactions) ? state.allTransactions : []).reduce(function (sum, item) {
      var status = normalize(item.status || "success");
      var type = normalize(item.type);
      var direction = normalize(item.direction);
      var isFeeType = type === "post_fee" || type === "apply_commission";
      var isChargeOut = direction === "out";
      if (status !== "success") return sum;
      if (!isFeeType && !isChargeOut) return sum;
      return sum + Number(item.amount || 0);
    }, 0);

    if (el.kpiUsers) el.kpiUsers.textContent = String(totalUsers);
    if (el.kpiRevenuePosts) el.kpiRevenuePosts.textContent = formatCurrency(revenue) + " / " + String(newPosts);
    if (el.kpiPending) el.kpiPending.textContent = String(pendingCount);
    if (el.kpiViolation) el.kpiViolation.textContent = String(violationCount);

    renderApprovalStatusChart();
  }

  function getFilteredPendingJobs() { // Hàm tiện ích để lọc danh sách tin tuyển dụng đang chờ duyệt dựa trên bộ lọc hiện tại và từ khóa tìm kiếm, giúp admin dễ dàng tìm kiếm và quản lý các tin tuyển dụng theo nhu cầu
    return state.pendingJobs.filter(function (job) {
      var byFilter = state.currentFilter === "all" ? true : job.status === state.currentFilter;
      var key = state.searchKeyword;
      var bySearch = !key ||
        normalize(job.title).includes(key) ||
        normalize(job.company).includes(key) ||
        normalize(job.owner).includes(key) ||
        normalize(job.location).includes(key);
      return byFilter && bySearch;
    }).sort(function (a, b) {
      var pinA = a.pinnedByAdmin ? 1 : 0;
      var pinB = b.pinnedByAdmin ? 1 : 0;
      if (pinB !== pinA) return pinB - pinA;

      var featA = a.featured ? 1 : 0;
      var featB = b.featured ? 1 : 0;
      if (featB !== featA) return featB - featA;

      var dateA = new Date(a.pinnedAt || a.submittedAt || 0).getTime();
      var dateB = new Date(b.pinnedAt || b.submittedAt || 0).getTime();
      return dateB - dateA;
    });
  }

  function paginate(items) { // Hàm tiện ích để phân trang một mảng các mục dựa trên trạng thái hiện tại của trang và kích thước trang, giúp hiển thị một phần dữ liệu trên giao diện và điều hướng giữa các trang một cách dễ dàng. Hàm này tính toán tổng số trang dựa trên độ dài của mảng và kích thước trang, sau đó trả về một đối tượng chứa các mục của trang hiện tại, tổng số trang và tổng số mục
    var totalPages = Math.max(1, Math.ceil(items.length / state.pageSize));
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    var start = (state.currentPage - 1) * state.pageSize;
    var end = start + state.pageSize;
    return {
      pageItems: items.slice(start, end),
      totalPages: totalPages,
      total: items.length
    };
  }

  function renderPendingTable() { //  Hàm tiện ích để hiển thị bảng danh sách các tin tuyển dụng đang chờ duyệt dựa trên dữ liệu đã được lọc và phân trang, giúp admin dễ dàng quản lý và thực hiện các hành động như duyệt, từ chối, ghim tin, v.v. Hàm này xây dựng nội dung HTML cho bảng dựa trên các thuộc tính của từng tin tuyển dụng và cập nhật trạng thái của các nút điều hướng trang cũng như thông tin về trang hiện tại
    if (!el.pendingTableBody) return;

    var filtered = getFilteredPendingJobs();
    var result = paginate(filtered);

    if (!result.pageItems.length) {
      el.pendingTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không có dữ liệu phù hợp.</td></tr>";
    } else {
      el.pendingTableBody.innerHTML = result.pageItems.map(function (job) {
        var pinText = job.pinnedByAdmin ? "Bỏ ghim" : "Ghim đầu";
        var pinClass = job.pinnedByAdmin ? "btn-xs" : "btn-xs btn-approve";
        var featuredBadge = job.featured ? " <span class='badge pending'>Noi bat</span>" : "";
        var pinAt = job.pinnedAt ? formatDateTime(job.pinnedAt) : "";
        var isNewPinned = false;
        if (job.pinnedByAdmin && job.pinnedAt) {
          var pinnedTime = new Date(job.pinnedAt).getTime();
          isNewPinned = !Number.isNaN(pinnedTime) && (Date.now() - pinnedTime) <= 24 * 60 * 60 * 1000;
        }
        var pinBadge = job.pinnedByAdmin
          ? (isNewPinned
              ? "<span class='badge active'>Moi ghim</span>"
              : "<span class='badge locked'>Da ghim</span>")
          : "";
        var pinInfo = job.pinnedByAdmin
          ? "<div style='font-size:12px;color:#64748b;margin-top:4px;'>Ghim luc: " + pinAt + "</div>"
          : "";
        return (
          "<tr>" +
            "<td><strong>" + job.title + "</strong>" + featuredBadge + "</td>" +
            "<td>" + job.company + "</td>" +
            "<td>" + job.owner + "</td>" +
            "<td>" + job.submittedAt + "</td>" +
            "<td>" + statusBadge(job.status) + " " + pinBadge + pinInfo + "</td>" +
            "<td>" +
              "<div class='row-actions'>" +
                "<button class='btn-xs' data-action='detail' data-id='" + job.id + "'>Chi tiet</button>" +
                "<button class='btn-xs btn-approve' data-action='approve' data-id='" + job.id + "'>Phê duyệt</button>" +
                "<button class='btn-xs btn-reject' data-action='reject' data-id='" + job.id + "'>Từ chối</button>" +
                "<button class='" + pinClass + "' data-action='pin' data-id='" + job.id + "'>" + pinText + "</button>" +
                "<button class='btn-xs btn-reject' data-action='delete' data-id='" + job.id + "'>Xóa tin</button>" +
              "</div>" +
            "</td>" +
          "</tr>"
        );
      }).join("");
    }

    if (el.pageInfo) {
      el.pageInfo.textContent = "Trang " + state.currentPage + " / " + result.totalPages + " (" + result.total + " ban ghi)";
    }

    if (el.btnPrevPage) el.btnPrevPage.disabled = state.currentPage <= 1;
    if (el.btnNextPage) el.btnNextPage.disabled = state.currentPage >= result.totalPages;
  }

  function approveJob(jobId, bypassConfirm) { //  Hàm tiện ích để phê duyệt một tin tuyển dụng cụ thể dựa trên jobId, cập nhật trạng thái của tin trong state và đồng bộ với các kho lưu trữ liên quan, giúp admin dễ dàng duyệt các tin tuyển dụng đang chờ xét duyệt. Hàm này cũng hiển thị thông báo sau khi phê duyệt và ghi log hoạt động tương ứng. Nếu bypassConfirm là true, sẽ bỏ qua bước xác nhận phê duyệt từ admin
    var target = state.pendingJobs.find(function (j) { return Number(j.id) === Number(jobId); });
    if (!target) return;

    if (!bypassConfirm) {
      var ok = window.confirm("Xác nhận phê duyệt job: " + target.title + "?");
      if (!ok) return;
    }

    state.pendingJobs = state.pendingJobs.map(function (job) {
      if (Number(job.id) !== Number(jobId)) return job;
      return Object.assign({}, job, { status: "approved" });
    });

    patchSharedJob(jobId, { status: "approved" });

    persistAll();
    renderPendingTable();
    renderKpis();

    closeJobDetailModal();
    toast("Đã phê duyệt tin: " + target.title, "success");
    addLog("Phê duyệt tin " + target.title + " và gửi thông báo cho nhà tuyển dụng.", { module: "approval" });
  }

  function openJobDetailModal(jobId) { // Hàm tiện ích để mở modal hiển thị chi tiết của một tin tuyển dụng cụ thể dựa trên jobId, lấy thông tin chi tiết từ state và hiển thị trong modal, giúp admin có thể xem đầy đủ thông tin của tin tuyển dụng trước khi quyết định phê duyệt hoặc từ chối. Nếu không tìm thấy tin hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    var target = state.pendingJobs.find(function (j) { return Number(j.id) === Number(jobId); });
    if (!target || !el.jobDetailModalBackdrop || !el.jobDetailBody) return;

    state.detailTargetId = target.id;

    el.jobDetailBody.innerHTML =
      "<div><label>Tiêu đề</label><input type='text' readonly value='" + target.title + "'></div>" +
      "<div><label>Công ty</label><input type='text' readonly value='" + target.company + "'></div>" +
      "<div><label>Người đăng</label><input type='text' readonly value='" + target.owner + "'></div>" +
      "<div><label>Lương</label><input type='text' readonly value='" + (target.salary || "Đang cập nhật") + "'></div>" +
      "<div><label>Địa điểm</label><input type='text' readonly value='" + (target.location || "Đang cập nhật") + "'></div>" +
      "<div><label>Mô tả</label><textarea readonly>" + (target.description || "") + "</textarea></div>" +
      "<div><label>Yêu cầu</label><textarea readonly>" + (target.requirements || "") + "</textarea></div>";

    el.jobDetailModalBackdrop.style.display = "flex";
  }

  function closeJobDetailModal() { // Hàm tiện ích để đóng modal chi tiết tin tuyển dụng, đặt lại trạng thái liên quan và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ xem chi tiết sau khi đã xem thông tin hoặc thực hiện hành động phê duyệt/từ chối
    state.detailTargetId = null;
    if (el.jobDetailModalBackdrop) {
      el.jobDetailModalBackdrop.style.display = "none";
    }
  }

  function openRejectModal(jobId) { // Hàm tiện ích để mở modal từ chối một tin tuyển dụng cụ thể dựa trên jobId, đặt trạng thái rejectTargetId và hiển thị modal để admin có thể nhập lý do từ chối. Nếu không tìm thấy tin hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    state.rejectTargetId = jobId;
    if (el.rejectReason) el.rejectReason.value = "";
    if (el.rejectModalBackdrop) {
      el.rejectModalBackdrop.style.display = "flex";
    }
  }

  function closeRejectModal() { //  Hàm tiện ích để đóng modal từ chối tin tuyển dụng, đặt lại trạng thái rejectTargetId và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ từ chối sau khi đã nhập lý do hoặc quyết định không từ chối
    if (el.rejectModalBackdrop) {
      el.rejectModalBackdrop.style.display = "none";
    }
    state.rejectTargetId = null;
  }

  function rejectJob() { // Hàm tiện ích để từ chối một tin tuyển dụng dựa trên rejectTargetId, cập nhật trạng thái của tin thành "violation" và lưu lý do từ chối, đồng thời cập nhật giao diện và ghi log hoạt động tương ứng. Nếu không có rejectTargetId hoặc lý do từ chối trống, hàm sẽ hiển thị thông báo lỗi và không thực hiện gì
    if (!state.rejectTargetId) return;

    var reason = el.rejectReason ? String(el.rejectReason.value || "").trim() : "";
    if (!reason) {
      toast("Vui lòng nhập lý do vi phạm.", "warn");
      return;
    }

    var target = state.pendingJobs.find(function (job) {
      return Number(job.id) === Number(state.rejectTargetId);
    });

    state.pendingJobs = state.pendingJobs.map(function (job) {
      if (Number(job.id) !== Number(state.rejectTargetId)) return job;
      return Object.assign({}, job, { status: "violation", reason: reason });
    });

    persistAll();
    closeRejectModal();
    renderPendingTable();
    renderKpis();

    toast("Đã từ chối tin vi phạm.", "error");
    addLog("Từ chối tin " + (target ? target.title : state.rejectTargetId) + " với lý do: " + reason, { module: "approval" });
  }

  function deletePendingJob(jobId) { // Hàm tiện ích để xóa một tin tuyển dụng đang chờ duyệt dựa trên jobId, hiển thị xác nhận từ admin trước khi xóa, cập nhật state và đồng bộ với các kho lưu trữ liên quan, giúp admin có thể loại bỏ hoàn toàn một tin tuyển dụng khỏi hệ thống nếu nó không phù hợp hoặc vi phạm. Sau khi xóa, hàm cũng cập nhật giao diện và ghi log hoạt động tương ứng
    var target = state.pendingJobs.find(function (job) {
      return Number(job.id) === Number(jobId);
    });

    if (!target) return;

    var ok = window.confirm("Xác nhận xóa tin: " + target.title + "?");
    if (!ok) return;

    state.pendingJobs = state.pendingJobs.filter(function (job) {
      return Number(job.id) !== Number(jobId);
    });

    syncSharedJobs(jobId);
    persistAll();

    var totalPages = Math.max(1, Math.ceil(getFilteredPendingJobs().length / state.pageSize));
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    renderPendingTable();
    renderKpis();
    toast("Đã xóa tin: " + target.title, "success");
    addLog("Xóa tin " + target.title + " khỏi danh sách kiểm duyệt.", { module: "approval" });
  }

  function togglePinnedJob(jobId) { // Hàm tiện ích để bật hoặc tắt tính năng ghim một tin tuyển dụng lên đầu danh sách dựa trên jobId, kiểm tra điều kiện tin đã được bật tính năng nổi bật từ phía recruiter hay chưa, cập nhật trạng thái pinnedByAdmin và pinnedAt của tin trong state và đồng bộ với các kho lưu trữ liên quan, giúp admin có thể ưu tiên hiển thị một tin tuyển dụng quan trọng hoặc mới nhất lên đầu danh sách kiểm duyệt. Sau khi thay đổi trạng thái ghim, hàm cũng cập nhật giao diện và ghi log hoạt động tương ứng
    var target = state.pendingJobs.find(function (job) {
      return Number(job.id) === Number(jobId);
    });
    if (!target) return;

    if (!target.featured) {
      toast("Tin chưa bật tính năng nổi bật từ phía recruiter.", "warn");
      return;
    }

    var nextPinned = !target.pinnedByAdmin;
    var pinnedAt = nextPinned ? new Date().toISOString() : null;

    state.pendingJobs = state.pendingJobs.map(function (job) {
      if (Number(job.id) !== Number(jobId)) return job;
      return Object.assign({}, job, { pinnedByAdmin: nextPinned, pinnedAt: pinnedAt });
    });

    patchSharedJob(jobId, { pinnedByAdmin: nextPinned, pinnedAt: pinnedAt });
    persistAll();
    renderPendingTable();
    toast(nextPinned ? "Đã ghim tin lên đầu danh sách." : "Đã bỏ ghim tin.", "success");
    addLog((nextPinned ? "Ghim" : "Bỏ ghim") + " tin " + target.title + " trên màn kiểm duyệt.", { module: "approval" });
  }

  function getFilteredUsers() { // Hàm tiện ích để lọc danh sách người dùng dựa trên các bộ lọc hiện tại như trạng thái, vai trò, phạm vi và từ khóa tìm kiếm, giúp admin dễ dàng tìm kiếm và quản lý người dùng theo nhu cầu. Hàm này trả về một mảng các người dùng đã được lọc dựa trên các điều kiện đã chọn
    return state.users.filter(function (user) {
      var key = state.searchKeyword;
      var bySearch = !key ||
        normalize(user.name).includes(key) ||
        normalize(user.email).includes(key) ||
        normalize(user.company).includes(key) ||
        normalize(user.role).includes(key);

      var byStatus = state.userStatusFilter === "all" || normalize(user.status) === state.userStatusFilter;
      var byRole = state.userRoleFilter === "all" || normalize(user.role) === state.userRoleFilter;
      var byScope = state.userScope === "all" || normalize(user.role) === state.userScope;

      return bySearch && byStatus && byRole && byScope;
    });
  }

  function getCompanyRecords() { // Hàm tiện ích để tổng hợp và tính toán thông tin về các công ty dựa trên dữ liệu người dùng và tin tuyển dụng đang chờ duyệt, giúp admin có cái nhìn tổng quan về tình hình hoạt động của từng công ty như số lượng nhà tuyển dụng, số lượng tin đăng, số tin đang chờ duyệt, số tin vi phạm và trạng thái hoạt động. Hàm này trả về một mảng các đối tượng đại diện cho từng công ty với các thông tin đã được tính toán
    var map = {};

    state.users.forEach(function (user) {
      var companyName = String(user.company || "").trim();
      if (!companyName || companyName === "-") return;
      if (normalize(user.role) !== "company" && normalize(user.role) !== "recruiter") return;

      if (!map[companyName]) {
        map[companyName] = {
          name: companyName,
          email: "",
          recruiterCount: 0,
          jobCount: 0,
          pendingCount: 0,
          violationCount: 0,
          status: "active"
        };
      }

      if (normalize(user.role) === "company" && user.email) {
        map[companyName].email = user.email;
      }

      if (normalize(user.role) === "recruiter") {
        map[companyName].recruiterCount += 1;
      }

      if (normalize(user.status) === "locked") {
        map[companyName].status = "locked";
      }
    });

    state.pendingJobs.forEach(function (job) {
      var companyName = String(job.company || "").trim();
      if (!companyName || !map[companyName]) return;

      map[companyName].jobCount += 1;
      if (normalize(job.status) === "pending") map[companyName].pendingCount += 1;
      if (normalize(job.status) === "violation") map[companyName].violationCount += 1;
    });

    return Object.keys(map).map(function (key) {
      return map[key];
    }).sort(function (a, b) {
      return b.jobCount - a.jobCount;
    });
  }

  function renderCompanyTable() { // Hàm tiện ích để hiển thị bảng danh sách các công ty dựa trên dữ liệu đã được tổng hợp và lọc, giúp admin dễ dàng quản lý các công ty theo tên, email liên hệ, số lượng nhà tuyển dụng, số lượng tin đăng, tình trạng hoạt động và thực hiện các hành động như xem chi tiết hoặc khóa/mở khóa công ty. Hàm này xây dựng nội dung HTML cho bảng dựa trên các thuộc tính của từng công ty và cập nhật giao diện tương ứng
    if (!el.companyTableBody) return;

    var key = state.searchKeyword;
    var companies = getCompanyRecords().filter(function (company) {
      if (!key) return true;
      return normalize(company.name).includes(key) || normalize(company.email).includes(key);
    });

    if (!companies.length) {
      el.companyTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không tìm thấy công ty.</td></tr>";
      return;
    }

    el.companyTableBody.innerHTML = companies.map(function (company) {
      var isActive = normalize(company.status) === "active";
      var toggleText = isActive ? "Khóa" : "Mở khóa";
      return (
        "<tr>" +
          "<td><strong>" + company.name + "</strong><div class='contact-sub'>Vi pham: " + company.violationCount + "</div></td>" +
          "<td>" + (company.email || "Đang cập nhật") + "</td>" +
          "<td>" + company.recruiterCount + "</td>" +
          "<td>" + company.jobCount + " (" + company.pendingCount + " chờ duyệt)</td>" +
          "<td><span class='badge " + (isActive ? "active" : "locked") + "'>" + (isActive ? "Hoạt động" : "Bị khóa") + "</span></td>" +
          "<td><div class='row-actions'>" +
            "<button class='btn-xs' data-company-action='detail' data-company='" + company.name + "'>Chi tiết</button>" +
            "<button class='btn-xs' data-company-action='toggle' data-company='" + company.name + "'>" + toggleText + "</button>" +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
  }

  function openCompanyDetailModal(companyName) { // Hàm tiện ích để mở modal hiển thị chi tiết của một công ty cụ thể dựa trên companyName, lấy thông tin chi tiết từ dữ liệu đã tổng hợp và hiển thị trong modal, giúp admin có thể xem đầy đủ thông tin của công ty trước khi quyết định khóa hoặc mở khóa. Nếu không tìm thấy công ty hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    var name = String(companyName || "").trim();
    if (!name || !el.companyDetailModalBackdrop || !el.companyDetailBody) return;

    var company = getCompanyRecords().find(function (item) {
      return item.name === name;
    });
    if (!company) return;

    state.companyTargetName = name;
    el.companyDetailBody.innerHTML =
      "<div><label>Tên công ty</label><input type='text' readonly value='" + company.name + "'></div>" +
      "<div><label>Email liên hệ</label><input type='text' readonly value='" + (company.email || "Đang cập nhật") + "'></div>" +
      "<div><label>Số nhà tuyển dụng</label><input type='text' readonly value='" + company.recruiterCount + "'></div>" +
      "<div><label>Tổng tin đăng</label><input type='text' readonly value='" + company.jobCount + "'></div>" +
      "<div><label>Tin chờ duyệt</label><input type='text' readonly value='" + company.pendingCount + "'></div>" +
      "<div><label>Tin vi phạm</label><input type='text' readonly value='" + company.violationCount + "'></div>";

    if (el.btnToggleCompanyStatus) {
      el.btnToggleCompanyStatus.textContent = normalize(company.status) === "active" ? "Khóa công ty" : "Mở công ty";
    }

    el.companyDetailModalBackdrop.style.display = "flex";
  }

  function closeCompanyDetailModal() { // Hàm tiện ích để đóng modal chi tiết công ty, đặt lại trạng thái liên quan và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ xem chi tiết sau khi đã xem thông tin hoặc thực hiện hành động khóa/mở khóa
    state.companyTargetName = null;
    if (el.companyDetailModalBackdrop) {
      el.companyDetailModalBackdrop.style.display = "none";
    }
  }

  function toggleCompanyStatus(companyName) { // Hàm tiện ích để bật hoặc tắt trạng thái hoạt động của một công ty dựa trên companyName, kiểm tra trạng thái hiện tại của công ty và cập nhật trạng thái của tất cả người dùng liên quan đến công ty đó trong state, đồng thời cập nhật giao diện và ghi log hoạt động tương ứng. Nếu công ty đang hoạt động, hàm sẽ yêu cầu admin nhập lý do khóa công ty trước khi thực hiện, ngược lại nếu công ty đang bị khóa, hàm sẽ yêu cầu xác nhận mở khóa từ admin
    var name = String(companyName || "").trim();
    if (!name) return;

    var company = getCompanyRecords().find(function (item) {
      return item.name === name;
    });
    if (!company) return;

    if (normalize(company.status) === "active") {
      var reason = window.prompt("Nhập lý do khóa công ty:", "Vi phạm chính sách tuyển dụng") || "";
      reason = String(reason).trim();
      if (!reason) {
        toast("Cần nhập lý do khóa công ty.", "warn");
        return;
      }

      state.users = state.users.map(function (user) {
        if (String(user.company || "").trim() !== name) return user;
        if (normalize(user.role) !== "company" && normalize(user.role) !== "recruiter") return user;
        return Object.assign({}, user, { status: "locked", lockReason: reason });
      });

      addLog("Khóa công ty " + name + " - Lý do: " + reason, { module: "users" });
      toast("Đã khóa công ty " + name + ".", "warn");
    } else {
      var ok = window.confirm("Xác nhận mở khóa công ty " + name + "?");
      if (!ok) return;

      state.users = state.users.map(function (user) {
        if (String(user.company || "").trim() !== name) return user;
        if (normalize(user.role) !== "company" && normalize(user.role) !== "recruiter") return user;
        return Object.assign({}, user, { status: "active", lockReason: "" });
      });

      addLog("Mở khóa công ty " + name + " và gửi thông báo.", { module: "users" });
      toast("Đã mở khóa công ty " + name + ".", "success");
    }

    persistAll();
    syncUsersToAuthStore();
    renderUsers();
    renderCompanyTable();
    renderKpis();
    if (state.companyTargetName === name) {
      openCompanyDetailModal(name);
    }
  }

  function renderUsers() { // Hàm tiện ích để hiển thị bảng danh sách người dùng dựa trên dữ liệu đã được lọc, giúp admin dễ dàng quản lý các người dùng theo tên, email, vai trò, ngày tham gia, trạng thái và thực hiện các hành động như xem chi tiết, phân quyền hoặc khóa/mở khóa tài khoản. Hàm này xây dựng nội dung HTML cho bảng dựa trên các thuộc tính của từng người dùng và cập nhật giao diện tương ứng
    if (!el.userTableBody) return;

    var filteredUsers = getFilteredUsers();

    if (!filteredUsers.length) {
      el.userTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không tìm thấy người dùng.</td></tr>";
      return;
    }

    el.userTableBody.innerHTML = filteredUsers.map(function (user) {
      var isActive = user.status === "active";
      var toggleText = isActive ? "Khóa" : "Mở khóa";

      return (
        "<tr>" +
          "<td>" + user.name + "<div class='contact-sub'>" + (user.company || "-") + "</div></td>" +
          "<td>" + (user.email || "-") + "</td>" +
          "<td>" + user.role + "</td>" +
          "<td>" + formatDate(user.joinedAt) + "</td>" +
          "<td><span class='badge " + (isActive ? "active" : "locked") + "'>" + (isActive ? "Hoạt động" : "Bị khóa") + "</span></td>" +
          "<td>" +
            "<div class='row-actions'>" +
              "<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='detail'>Xem hồ sơ</button>" +
              "<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='permission'>Phân quyền</button>" +
              "<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='toggle'>" + toggleText + "</button>" +
            "</div>" +
          "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function toggleUserStatus(userId) { // Hàm tiện ích để bật hoặc tắt trạng thái hoạt động của một người dùng dựa trên userId, kiểm tra trạng thái hiện tại của người dùng và cập nhật trạng thái trong state, đồng thời cập nhật giao diện và ghi log hoạt động tương ứng. Nếu người dùng đang hoạt động, hàm sẽ yêu cầu admin nhập lý do khóa tài khoản trước khi thực hiện, ngược lại nếu người dùng đang bị khóa, hàm sẽ yêu cầu xác nhận mở khóa từ admin
    var target = state.users.find(function (u) { return Number(u.id) === Number(userId); });
    if (!target) return;

    if (target.status === "active") {
      var reason = window.prompt("Nhập lý do khóa tài khoản:", "Vi phạm chính sách") || "";
      reason = String(reason).trim();
      if (!reason) {
        toast("Cần nhập lý do khóa tài khoản.", "warn");
        return;
      }

      state.users = state.users.map(function (u) {
        if (Number(u.id) !== Number(userId)) return u;
        return Object.assign({}, u, { status: "locked", lockReason: reason });
      });

      toast("Đã khóa tài khoản " + target.name + ".", "warn");
      addLog("Khóa tài khoản " + target.name + " - Lý do: " + reason, { module: "users" });
    } else {
      var ok = window.confirm("Xác nhận mở khóa tài khoản " + target.name + "?");
      if (!ok) return;

      state.users = state.users.map(function (u) {
        if (Number(u.id) !== Number(userId)) return u;
        return Object.assign({}, u, { status: "active", lockReason: "" });
      });

      toast("Đã mở khóa tài khoản " + target.name + ".", "success");
      addLog("Mở khóa tài khoản " + target.name + " và gửi email thông báo.", { module: "users" });
    }

    persistAll();
    syncUsersToAuthStore();
    renderUsers();
    renderCompanyTable();
    renderKpis();
    if (state.permissionTargetId && Number(state.permissionTargetId) === Number(userId)) {
      closePermissionModal();
    }
    if (state.contactTargetId && Number(state.contactTargetId) === Number(userId)) {
      closeContactModal();
    }
  }

  function openUserDetailModal(userId) { // Hàm tiện ích để mở modal hiển thị chi tiết của một người dùng cụ thể dựa trên userId, lấy thông tin chi tiết từ state và hiển thị trong modal, giúp admin có thể xem đầy đủ thông tin của người dùng trước khi quyết định khóa/mở khóa hoặc phân quyền. Nếu không tìm thấy người dùng hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    var target = state.users.find(function (item) {
      return Number(item.id) === Number(userId);
    });
    if (!target || !el.userDetailModalBackdrop || !el.userDetailBody) return;

    state.userDetailTargetId = target.id;

    el.userDetailBody.innerHTML =
      "<div><label>Họ tên</label><input type='text' readonly value='" + target.name + "'></div>" +
      "<div><label>Email</label><input type='text' readonly value='" + (target.email || "-") + "'></div>" +
      "<div><label>Vai trò</label><input type='text' readonly value='" + target.role + "'></div>" +
      "<div><label>Công ty</label><input type='text' readonly value='" + (target.company || "-") + "'></div>" +
      "<div><label>Ngày tham gia</label><input type='text' readonly value='" + formatDate(target.joinedAt) + "'></div>" +
      "<div><label>Trạng thái</label><input type='text' readonly value='" + (target.status === "active" ? "Hoạt động" : "Bị khóa") + "'></div>" +
      "<div><label>Quyền hiện tại</label><textarea readonly>" + (Array.isArray(target.permissions) ? target.permissions.join(", ") : "-") + "</textarea></div>";

    if (el.btnToggleFromDetail) {
      el.btnToggleFromDetail.textContent = target.status === "active" ? "Khóa tài khoản" : "Mở tài khoản";
    }

    el.userDetailModalBackdrop.style.display = "flex";
  }

  function closeUserDetailModal() { // Hàm tiện ích để đóng modal chi tiết người dùng, đặt lại trạng thái liên quan và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ xem chi tiết sau khi đã xem thông tin hoặc thực hiện hành động khóa/mở khóa hoặc phân quyền
    state.userDetailTargetId = null;
    if (el.userDetailModalBackdrop) {
      el.userDetailModalBackdrop.style.display = "none";
    }
  }

  function openPermissionModal(userId) { // Hàm tiện ích để mở modal phân quyền cho một người dùng cụ thể dựa trên userId, lấy thông tin chi tiết của người dùng từ state và hiển thị các quyền hiện tại trong modal, giúp admin có thể dễ dàng thêm hoặc bớt quyền cho người dùng đó. Nếu không tìm thấy người dùng hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    var target = state.users.find(function (u) { return Number(u.id) === Number(userId); });
    if (!target || !el.permissionModalBackdrop || !el.permissionModalBody) return;

    state.permissionTargetId = target.id;

    var userPermissions = Array.isArray(target.permissions) ? target.permissions : [];

    el.permissionModalBody.innerHTML =
      "<div><label>Tài khoản</label><input type='text' readonly value='" + target.name + " - " + target.role + "'></div>" +
      "<div style='display:grid;gap:8px;'>" + PERMISSIONS.map(function (item) {
        var checked = userPermissions.indexOf(item.key) >= 0 ? "checked" : "";
        return (
          "<label style='display:flex;align-items:center;gap:8px;'>" +
            "<input type='checkbox' data-permission-key='" + item.key + "' " + checked + ">" +
            "<span>" + item.label + "</span>" +
          "</label>"
        );
      }).join("") +
      "</div>";

    el.permissionModalBackdrop.style.display = "flex";
  }

  function closePermissionModal() { // Hàm tiện ích để đóng modal phân quyền, đặt lại trạng thái liên quan và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ phân quyền sau khi đã thực hiện xong việc thêm hoặc bớt quyền cho người dùng
    state.permissionTargetId = null;
    if (el.permissionModalBackdrop) {
      el.permissionModalBackdrop.style.display = "none";
    }
  }

  function savePermissions() { // Hàm tiện ích để lưu các quyền đã được chọn trong modal phân quyền cho người dùng hiện tại, cập nhật thông tin quyền trong state và đồng bộ với các kho lưu trữ liên quan, giúp admin có thể dễ dàng quản lý quyền của người dùng. Nếu không có người dùng mục tiêu hoặc phần tử modal body, hàm sẽ không thực hiện gì
    if (!state.permissionTargetId || !el.permissionModalBody) return;

    var checkedNodes = Array.prototype.slice.call(el.permissionModalBody.querySelectorAll("input[data-permission-key]:checked"));
    var permissions = checkedNodes.map(function (node) {
      return node.getAttribute("data-permission-key");
    });

    state.users = state.users.map(function (u) {
      if (Number(u.id) !== Number(state.permissionTargetId)) return u;
      return Object.assign({}, u, { permissions: permissions });
    });

    persistAll();
    syncUsersToAuthStore();
    closePermissionModal();
    renderUsers();
    renderCompanyTable();
    toast("Đã lưu phân quyền người dùng.", "success");
    addLog("Cập nhật phân quyền tài khoản ID " + state.permissionTargetId, { module: "users" });
  }

  function renderIndustries() { // Hàm tiện ích để hiển thị danh sách các ngành nghề trong phần quản lý ngành nghề, xây dựng nội dung HTML cho danh sách dựa trên dữ liệu trong state và cập nhật giao diện tương ứng, giúp admin dễ dàng quản lý các ngành nghề bằng cách thêm, sửa hoặc xóa. Nếu không có phần tử để hiển thị danh sách, hàm sẽ không thực hiện gì
    if (!el.industryList) return;

    el.industryList.innerHTML = state.industries.map(function (name, idx) {
      return (
        "<li>" +
          "<div style='display:flex;justify-content:space-between;gap:8px;align-items:center;'>" +
            "<span>" + (idx + 1) + ". " + name + "</span>" +
            "<span class='row-actions'>" +
              "<button class='btn-xs' data-industry-action='edit' data-index='" + idx + "'>Sửa</button>" +
              "<button class='btn-xs btn-reject' data-industry-action='delete' data-index='" + idx + "'>Xóa</button>" +
            "</span>" +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  function addIndustry() { // Hàm tiện ích để thêm một ngành nghề mới vào danh sách, lấy giá trị từ input, kiểm tra tính hợp lệ và trùng lặp, cập nhật state và giao diện tương ứng, giúp admin có thể dễ dàng mở rộng danh sách ngành nghề. Nếu không có phần tử input hoặc giá trị nhập vào không hợp lệ, hàm sẽ hiển thị thông báo lỗi và không thực hiện gì
    if (!el.industryInput) return;

    var value = String(el.industryInput.value || "").trim();
    if (!value) {
      toast("Vui lòng nhập tên ngành nghề.", "warn");
      return;
    }

    var normalizedValue = normalize(value);
    var existed = state.industries.some(function (item) {
      return normalize(item) === normalizedValue;
    });

    if (existed) {
      toast("Tên ngành nghề đã tồn tại.", "warn");
      return;
    }

    state.industries.unshift(value);
    el.industryInput.value = "";

    persistAll();
    renderIndustries();
    toast("Đã thêm ngành nghề mới.", "success");
    addLog("Thêm ngành nghề: " + value, { module: "industries" });
  }

  function editIndustry(index) { // Hàm tiện ích để chỉnh sửa tên một ngành nghề trong danh sách dựa trên index, lấy giá trị mới từ prompt, kiểm tra tính hợp lệ và trùng lặp, cập nhật state và giao diện tương ứng, giúp admin có thể dễ dàng sửa đổi tên ngành nghề khi cần thiết. Nếu index không hợp lệ hoặc giá trị mới không hợp lệ, hàm sẽ hiển thị thông báo lỗi và không thực hiện gì
    var i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= state.industries.length) return;

    var oldValue = state.industries[i];
    var nextValue = window.prompt("Sửa tên ngành nghề:", oldValue) || "";
    nextValue = String(nextValue).trim();

    if (!nextValue) {
      toast("Tên ngành nghề không được để trống.", "warn");
      return;
    }

    var normalizedValue = normalize(nextValue);
    var duplicated = state.industries.some(function (item, idx) {
      return idx !== i && normalize(item) === normalizedValue;
    });

    if (duplicated) {
      toast("Tên ngành nghề bị trùng lặp.", "warn");
      return;
    }

    state.industries[i] = nextValue;
    persistAll();
    renderIndustries();
    toast("Đã cập nhật ngành nghề.", "success");
    addLog("Sửa ngành nghề: " + oldValue + " -> " + nextValue, { module: "industries" });
  }

  function deleteIndustry(index) { // Hàm tiện ích để xóa một ngành nghề khỏi danh sách dựa trên index, hiển thị xác nhận từ admin trước khi xóa, cập nhật state và giao diện tương ứng, giúp admin có thể loại bỏ một ngành nghề không còn phù hợp hoặc cần thiết. Nếu index không hợp lệ hoặc admin hủy xác nhận, hàm sẽ không thực hiện gì
    var i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= state.industries.length) return;

    var target = state.industries[i];
    var ok = window.confirm("Xác nhận xóa ngành nghề: " + target + "?");
    if (!ok) return;

    state.industries.splice(i, 1);
    persistAll();
    renderIndustries();
    toast("Đã xóa ngành nghề.", "success");
    addLog("Xóa ngành nghề: " + target, { module: "industries" });
  }

  function renderPolicies() { // Hàm tiện ích để hiển thị danh sách các chính sách trong phần quản lý chính sách, xây dựng nội dung HTML cho danh sách dựa trên dữ liệu tĩnh POLICIES và cập nhật giao diện tương ứng, giúp admin dễ dàng xem và quản lý các chính sách hiện có. Nếu không có phần tử để hiển thị danh sách, hàm sẽ không thực hiện gì
    if (!el.policiesList) return;

    el.policiesList.innerHTML = POLICIES.map(function (item) {
      return (
        "<div class='policy-card'>" +
          "<h3>" + item.title + "</h3>" +
          "<p>" + item.content + "</p>" +
        "</div>"
      );
    }).join("");
  }

  function renderContacts() { // Hàm tiện ích để hiển thị danh sách các liên hệ từ người dùng, xây dựng nội dung HTML cho danh sách dựa trên dữ liệu trong state và cập nhật giao diện tương ứng, giúp admin dễ dàng quản lý các liên hệ theo tiêu đề, người gửi, nguồn gửi, bộ phận được chuyển, trạng thái và thời gian gửi. Nếu không có phần tử để hiển thị danh sách hoặc không có liên hệ nào, hàm sẽ hiển thị thông báo phù hợp
    if (!el.contactsList) return;

    if (!state.contacts.length) {
      el.contactsList.innerHTML = "<div class='policy-card'><p>Chưa có liên hệ nào.</p></div>";
      return;
    }

    el.contactsList.innerHTML = state.contacts.map(function (contact) {
      var st = contact.status === "done" ? "Đã xử lý" : (contact.status === "processing" ? "Đang xử lý" : (contact.status === "replied" ? "Đã phản hồi" : "Mới"));
      var sourceLabel = contact.source === "recruiter" ? "Recruiter" : (contact.source === "candidate" ? "Candidate" : "Khác");
      var deptLabel = contact.department === "finance" ? "Tài chính" : contact.department === "recruitment" ? "Tuyển dụng" : contact.department === "account" ? "Tài khoản" : contact.department === "support" ? "Hỗ trợ kỹ thuật" : contact.department === "other" ? "Khác" : "Chưa phân loại";
      return (
        "<div class='contact-item'>" +
          "<div>" +
            "<div class='contact-title'>" + contact.title + "</div>" +
            "<div class='contact-sub'>" + contact.fullName + " - " + contact.email + "</div>" +
            "<div class='contact-sub'>Nguồn: " + sourceLabel + " | Bộ phận: " + deptLabel + " | Trạng thái: " + st + " | " + formatDateTime(contact.createdAt) + "</div>" +
          "</div>" +
          "<button class='btn-xs' data-contact-action='view' data-contact-id='" + contact.id + "'>Xem chi tiết</button>" +
        "</div>"
      );
    }).join("");
  }

  function openContactModal(contactId) {  //  Hàm tiện ích để mở modal hiển thị chi tiết của một liên hệ cụ thể dựa trên contactId, lấy thông tin chi tiết từ state và hiển thị trong modal, giúp admin có thể xem đầy đủ thông tin của liên hệ trước khi quyết định xử lý, phản hồi hoặc chuyển cho bộ phận phụ trách. Nếu không tìm thấy liên hệ hoặc các phần tử cần thiết để hiển thị modal, hàm sẽ không thực hiện gì
    var target = state.contacts.find(function (item) { return Number(item.id) === Number(contactId); });
    if (!target || !el.contactModalBackdrop || !el.contactModalBody) return;

    state.contactTargetId = target.id;

    if (el.contactDepartment) {
      el.contactDepartment.value = target.department || "support";
    }
    if (el.contactReplyNote) {
      el.contactReplyNote.value = target.adminNote || target.replyNote || "";
    }

    renderContactHistory(target);

    el.contactModalBody.innerHTML =
      "<div><label>Họ tên</label><input type='text' readonly value='" + target.fullName + "'></div>" +
      "<div><label>Email</label><input type='text' readonly value='" + target.email + "'></div>" +
      "<div><label>Nguồn gửi</label><input type='text' readonly value='" + ((target.source === "recruiter" ? "Recruiter" : target.source === "candidate" ? "Candidate" : "Khác")) + "'></div>" +
      "<div><label>Bộ phận được chuyển</label><input type='text' readonly value='" + (target.department || "Chưa phân loại") + "'></div>" +
      "<div><label>Tiêu đề</label><input type='text' readonly value='" + target.title + "'></div>" +
      "<div><label>Nội dung</label><textarea readonly>" + target.content + "</textarea></div>" +
      "<div><label>Trạng thái</label><input type='text' readonly value='" + formatContactStatusLabel(target.status) + "'></div>";

    el.contactModalBackdrop.style.display = "flex";
  }

  function closeContactModal() { // Hàm tiện ích để đóng modal chi tiết liên hệ, đặt lại trạng thái liên quan và ẩn modal khỏi giao diện, giúp admin có thể thoát khỏi chế độ xem chi tiết sau khi đã xem thông tin hoặc thực hiện hành động xử lý, phản hồi hoặc chuyển cho bộ phận phụ trách
    state.contactTargetId = null;
    if (el.contactModalBackdrop) {
      el.contactModalBackdrop.style.display = "none";
    }
  }

  function formatContactStatusLabel(status) { // Hàm tiện ích để định dạng nhãn trạng thái của một liên hệ dựa trên giá trị status, trả về nhãn phù hợp để hiển thị trong giao diện, giúp admin dễ dàng nhận biết trạng thái hiện tại của liên hệ. Nếu status không khớp với các giá trị đã định nghĩa, hàm sẽ trả về "Mới" như mặc định
    if (status === "done") return "Đã xử lý";
    if (status === "processing") return "Đang xử lý";
    if (status === "replied") return "Đã phản hồi";
    return "Mới";
  }

  function renderContactHistory(contact) {// Hàm tiện ích để hiển thị lịch sử xử lý của một liên hệ trong modal chi tiết, xây dựng nội dung HTML cho lịch sử dựa trên thuộc tính history của liên hệ và cập nhật giao diện tương ứng, giúp admin có thể xem lại các bước đã được thực hiện đối với liên hệ đó. Nếu không có phần tử để hiển thị lịch sử hoặc liên hệ không có lịch sử nào, hàm sẽ hiển thị thông báo phù hợp
    if (!el.contactHistoryList) return;

    var history = Array.isArray(contact && contact.history) ? contact.history.slice() : [];
    if (!history.length) {
      el.contactHistoryList.innerHTML = "<div class='policy-card'><p>Chưa có lịch sử xử lý.</p></div>";
      return;
    }

    el.contactHistoryList.innerHTML = history.map(function (item) {
      return (
        "<div style='border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;'>" +
          "<div style='font-weight:700;color:#334155;'>" + (item.label || item.action || 'Mốc xử lý') + "</div>" +
          "<div style='font-size:12px;color:#64748b;'>" + formatDateTime(item.at) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  function updateContactStatus(nextStatus, persistNote) { // Hàm tiện ích để cập nhật trạng thái của một liên hệ dựa trên nextStatus, kiểm tra trạng thái mục tiêu và ghi chú phản hồi nếu cần thiết, cập nhật thông tin liên hệ trong state và giao diện tương ứng, giúp admin có thể dễ dàng xử lý các liên hệ theo các bước như đánh dấu đã xử lý, phản hồi hoặc chuyển cho bộ phận phụ trách. Nếu không có liên hệ mục tiêu nào được chọn, hàm sẽ không thực hiện gì
    if (!state.contactTargetId) return;

    var note = el.contactReplyNote ? String(el.contactReplyNote.value || '').trim() : '';
    var department = el.contactDepartment ? String(el.contactDepartment.value || '').trim() : 'support';
    var finalNote = persistNote === false ? '' : note;
    var nextLabel = nextStatus === 'done' ? 'Đã xử lý' : (nextStatus === 'replied' ? 'Đã phản hồi' : 'Đã chuyển cho bộ phận phụ trách');

    state.contacts = state.contacts.map(function (item) {
      if (Number(item.id) !== Number(state.contactTargetId)) return item;
      var history = Array.isArray(item.history) ? item.history.slice() : [];
      history.push({
        action: nextStatus,
        label: nextLabel + (department ? ' • ' + department : '') + (finalNote ? ' • ' + finalNote : ''),
        at: new Date().toISOString()
      });
      return Object.assign({}, item, {
        status: nextStatus,
        department: department,
        adminNote: finalNote,
        replyNote: finalNote,
        history: history,
        updatedAt: new Date().toISOString(),
        handledAt: nextStatus === 'done' ? new Date().toISOString() : (item.handledAt || '')
      });
    });

    persistAll();
    renderContacts();
    closeContactModal();

    var message = nextStatus === 'done'
      ? "Đã đánh dấu yêu cầu liên hệ là đã xử lý."
      : (nextStatus === 'replied' ? "Đã ghi phản hồi cho liên hệ." : "Đã chuyển liên hệ cho bộ phận phụ trách.");

    toast(message, "success");
    addLog("Cập nhật liên hệ ID " + state.contactTargetId + " -> " + nextStatus, { module: "contacts" });
  }

  function markContactDone() { // Hàm tiện ích để đánh dấu một liên hệ là đã xử lý, gọi hàm updateContactStatus với trạng thái "done" và giữ lại ghi chú phản hồi nếu có, giúp admin có thể nhanh chóng hoàn tất việc xử lý một liên hệ sau khi đã xem xét và phản hồi nếu cần thiết. Nếu không có liên hệ mục tiêu nào được chọn, hàm sẽ không thực hiện gì
    updateContactStatus("done");
  }

  function forwardContact() { // Hàm tiện ích để chuyển một liên hệ cho bộ phận phụ trách, gọi hàm updateContactStatus với trạng thái "processing" và giữ lại ghi chú phản hồi nếu có, giúp admin có thể dễ dàng chuyển tiếp một liên hệ đến bộ phận liên quan để xử lý tiếp sau khi đã xem xét và phản hồi nếu cần thiết. Nếu không có liên hệ mục tiêu nào được chọn, hàm sẽ không thực hiện gì
    updateContactStatus("processing", false);
  }

  function replyContact() { // Hàm tiện ích để ghi phản hồi cho một liên hệ, gọi hàm updateContactStatus với trạng thái "replied" và giữ lại ghi chú phản hồi, giúp admin có thể dễ dàng phản hồi một liên hệ sau khi đã xem xét và xử lý nếu cần thiết. Nếu không có liên hệ mục tiêu nào được chọn, hàm sẽ không thực hiện gì
    updateContactStatus("replied");
  }

  function formatCurrency(amount) { // Hàm tiện ích để định dạng một số tiền thành định dạng tiền tệ Việt Nam, sử dụng phương thức toLocaleString với locale "vi-VN" để hiển thị dấu phân cách hàng nghìn và thêm ký hiệu "đ" vào cuối, giúp admin dễ dàng đọc và hiểu các số tiền liên quan đến giao dịch nạp tiền hoặc các khoản tài chính khác. Nếu giá trị amount không phải là số hợp lệ, hàm sẽ trả về "0đ" như mặc định
    return Number(amount || 0).toLocaleString("vi-VN") + "đ";
  }

  function renderSystemSettings() { // Hàm tiện ích để hiển thị các cài đặt hệ thống trong phần quản lý cài đặt, cập nhật trạng thái của các checkbox dựa trên giá trị trong state.systemSettings, giúp admin dễ dàng xem và điều chỉnh các cài đặt như thông báo email, tự động đăng nhập và chế độ kiểm duyệt nhanh. Nếu không có phần tử checkbox nào để cập nhật, hàm sẽ không thực hiện gì
    if (el.settingEmailNotifications) {
      el.settingEmailNotifications.checked = !!state.systemSettings.emailNotifications;
    }
    if (el.settingAutoLog) {
      el.settingAutoLog.checked = !!state.systemSettings.autoLog;
    }
    if (el.settingFastModeration) {
      el.settingFastModeration.checked = !!state.systemSettings.fastModeration;
    }
  }

  function saveSystemSettings() { // Hàm tiện ích để lưu các cài đặt hệ thống đã được điều chỉnh trong phần quản lý cài đặt, cập nhật giá trị trong state.systemSettings dựa trên trạng thái của các checkbox, giúp admin có thể dễ dàng lưu lại các cài đặt như thông báo email, tự động đăng nhập và chế độ kiểm duyệt nhanh. Sau khi lưu, hàm sẽ đồng bộ dữ liệu và hiển thị thông báo thành công, cũng như ghi log hoạt động tương ứng. Nếu không có phần tử checkbox nào để đọc giá trị, hàm sẽ không thực hiện gì
    state.systemSettings = {
      emailNotifications: !!(el.settingEmailNotifications && el.settingEmailNotifications.checked),
      autoLog: !!(el.settingAutoLog && el.settingAutoLog.checked),
      fastModeration: !!(el.settingFastModeration && el.settingFastModeration.checked)
    };

    persistAll();
    toast("Đã lưu cài đặt hệ thống.", "success");
    addLog("Cập nhật cài đặt hệ thống.", { module: "settings", force: true });
  }

  function saveAllTransactions(items) { // Hàm tiện ích để lưu tất cả các giao dịch nạp tiền vào state và đồng bộ với kho lưu trữ, giúp admin có thể cập nhật danh sách giao dịch nạp tiền một cách dễ dàng. Hàm này nhận vào một mảng các giao dịch, cập nhật state.allTransactions và ghi dữ liệu vào kho lưu trữ với hai key khác nhau là "ALL_TRANSACTIONS_DATA" và "allTransactions" để đảm bảo tính nhất quán và khả năng truy xuất dữ liệu sau này. Nếu items không phải là một mảng hợp lệ, hàm sẽ không thực hiện gì
    writeJson("ALL_TRANSACTIONS_DATA", items);
    writeJson("allTransactions", items);
  }

  function renderDepositRequests() { // Hàm tiện ích để hiển thị danh sách các yêu cầu nạp tiền trong phần quản lý thanh toán, lọc và phân loại các giao dịch nạp tiền dựa trên trạng thái, xây dựng nội dung HTML cho bảng yêu cầu nạp tiền và lịch sử thanh toán, giúp admin dễ dàng quản lý các yêu cầu nạp tiền đang chờ duyệt và xem lại lịch sử các giao dịch đã được xử lý. Nếu không có phần tử nào để hiển thị hoặc không có giao dịch nào phù hợp, hàm sẽ hiển thị thông báo phù hợp

    var rows = (Array.isArray(state.allTransactions) ? state.allTransactions : []).filter(function (item) {
      return normalize(item.type) === "deposit";
    }).sort(function (a, b) {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    var searchKeyword = normalize(state.paymentSearchKeyword);
    var filteredRows = !searchKeyword ? rows : rows.filter(function (item) {
      return normalize(item.note).indexOf(searchKeyword) >= 0;
    });

    var pendingRows = filteredRows.filter(function (item) {
      return normalize(item.status) === "pending";
    });

    var historyRows = filteredRows.filter(function (item) {
      return normalize(item.status) !== "pending";
    });

    var pendingRowsAll = rows.filter(function (item) {
      return normalize(item.status) === "pending";
    });

    if (el.paymentPendingCount) {
      el.paymentPendingCount.textContent = String(pendingRowsAll.length);
    }

    if (el.paymentPendingTotal) {
      var pendingTotal = pendingRowsAll.reduce(function (sum, item) {
        return sum + Number(item.amount || 0);
      }, 0);
      el.paymentPendingTotal.textContent = formatCurrency(pendingTotal);
    }

    if (!pendingRows.length) {
      el.depositRequestsList.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>" + (searchKeyword ? "Không có yêu cầu phù hợp với nội dung tìm kiếm." : "Chưa có giao dịch nạp tiền.") + "</td></tr>";
    } else {
      el.depositRequestsList.innerHTML = pendingRows.map(function (item) {
        var canApprove = normalize(item.status) === "pending";
        return (
          "<tr>" +
            "<td>#" + item.id + "</td>" +
            "<td>" + (item.recruiterEmail || "-") + "</td>" +
            "<td>" + formatCurrency(item.amount) + "</td>" +
            "<td>" + (item.note || "-") + "</td>" +
            "<td><span class='badge " + (canApprove ? "pending" : "active") + "'>" + (item.status || "Success") + "</span></td>" +
            "<td>" +
              (canApprove
                ? "<button class='btn-xs btn-approve' data-deposit-action='approve' data-id='" + item.id + "'>Duyệt</button>"
                : "<span style='color:#64748b;'>Đã duyệt</span>") +
            "</td>" +
          "</tr>"
        );
      }).join("");
    }

    if (el.paymentHistoryList) {
      if (!historyRows.length) {
        el.paymentHistoryList.innerHTML = "<li>" + (searchKeyword ? "Không có lịch sử phù hợp với nội dung tìm kiếm." : "Chưa có lịch sử thanh toán.") + "</li>";
      } else {
        el.paymentHistoryList.innerHTML = historyRows.slice(0, 100).map(function (item) {
          var statusText = item.status || "Success";
          var timeText = formatDateTime(item.approvedAt || item.createdAt);
          return "<li>[" + timeText + "] [" + statusText + "] " + (item.recruiterEmail || "-") + " - " + formatCurrency(item.amount) + " - " + (item.note || "Nạp tiền ví") + "</li>";
        }).join("");
      }
    }
  }

  function approveDeposit(transactionId) { // Hàm tiện ích để duyệt một yêu cầu nạp tiền dựa trên transactionId, kiểm tra tính hợp lệ của giao dịch, cập nhật trạng thái giao dịch và thông tin tài khoản recruiter liên quan, đồng thời cập nhật giao diện và ghi log hoạt động, giúp admin có thể dễ dàng xử lý các yêu cầu nạp tiền đang chờ duyệt. Nếu transactionId không hợp lệ hoặc không tìm thấy giao dịch, hàm sẽ hiển thị thông báo lỗi và không thực hiện gì
    var id = Number(transactionId);
    var transactions = Array.isArray(state.allTransactions) ? state.allTransactions.slice() : [];
    var target = transactions.find(function (item) {
      return Number(item.id) === id;
    });

    if (!target) {
      toast("Không tìm thấy giao dịch.", "warn");
      return;
    }

    if (normalize(target.status) === "success") {
      toast("Giao dịch đã được duyệt trước đó.", "warn");
      return;
    }

    var users = readJson("users", []);
    var index = users.findIndex(function (user) {
      var byId = Number(user.id) === Number(target.recruiterId);
      var byEmail = normalize(user.email) === normalize(target.recruiterEmail);
      return normalize(user.role) === "recruiter" && (byId || byEmail);
    });

    if (index < 0) {
      toast("Không tìm thấy recruiter để cộng tiền.", "error");
      return;
    }

    var recruiter = users[index];
    var balance = Number(recruiter.balance || 0);
    var ownTx = Array.isArray(recruiter.transactions) ? recruiter.transactions.slice() : [];

    ownTx = ownTx.map(function (item) {
      if (Number(item.id) !== id) return item;
      return Object.assign({}, item, { status: "Success", approvedAt: new Date().toISOString() });
    });

    if (!ownTx.some(function (item) { return Number(item.id) === id; })) {
      ownTx.unshift(Object.assign({}, target, { status: "Success", approvedAt: new Date().toISOString() }));
    }

    users[index] = Object.assign({}, recruiter, {
      balance: balance + Number(target.amount || 0),
      transactions: ownTx
    });

    writeJson("users", users);

    try {
      var currentRaw = sessionStorage.getItem("currentUser");
      var currentUser = currentRaw ? JSON.parse(currentRaw) : null;
      if (currentUser && Number(currentUser.id) === Number(users[index].id)) {
        sessionStorage.setItem("currentUser", JSON.stringify(Object.assign({}, currentUser, users[index])));
      }
    } catch (err) {
      // ignore
    }

    transactions = transactions.map(function (item) {
      if (Number(item.id) !== id) return item;
      return Object.assign({}, item, { status: "Success", approvedAt: new Date().toISOString() });
    });

    state.allTransactions = transactions;
    state.users = users;
    saveAllTransactions(transactions);
    persistAll();
    renderUsers();
    renderDepositRequests();
    renderKpis();
    addLog("Duyệt nạp tiền giao dịch #" + id + " cho " + (target.recruiterEmail || "recruiter") + ".", { module: "payments" });
    toast("Đã duyệt nạp tiền thành công.", "success");
  }

  function renderGrowthChart() { // Hàm tiện ích để hiển thị biểu đồ tăng trưởng người dùng hoặc tin đăng dựa trên khoảng thời gian đã chọn, lấy dữ liệu từ state.stats và cấu hình từ RANGE_CONFIG, xây dựng nội dung HTML cho biểu đồ và các thông tin tóm tắt, giúp admin dễ dàng theo dõi xu hướng tăng trưởng của hệ thống. Nếu không có phần tử nào để hiển thị biểu đồ, hàm sẽ không thực hiện gì
    if (!el.growthBars) return;

    var config = RANGE_CONFIG[state.statsRange] || RANGE_CONFIG["7d"];
    var labels = config.labels;
    var values = config.values;
    var max = Math.max.apply(null, values);

    el.growthBars.innerHTML = values.map(function (value, idx) {
      var h = Math.max(20, Math.round((value / max) * 130));
      return (
        "<div class='bar-col'>" +
          "<div class='bar' style='height:" + h + "px'></div>" +
          "<div class='bar-label'>" + labels[idx] + "</div>" +
        "</div>"
      );
    }).join("");

    if (el.statsSummary) {
      var total = values.reduce(function (sum, item) { return sum + item; }, 0);
      var peakValue = Math.max.apply(null, values);
      var peakIndex = values.indexOf(peakValue);
      var avg = values.length ? Math.round(total / values.length) : 0;

      el.statsSummary.innerHTML =
        "<div class='summary-item'><div class='label'>Tổng lượt trong kỳ</div><div class='value'>" + total + "</div></div>" +
        "<div class='summary-item'><div class='label'>Giá trị trung bình</div><div class='value'>" + avg + "</div></div>" +
        "<div class='summary-item'><div class='label'>Đỉnh cao</div><div class='value'>" + peakValue + " (" + labels[peakIndex] + ")</div></div>";
    }

    renderApprovalStatusChart();
  }

  function renderApprovalStatusChart() { // Hàm tiện ích để hiển thị biểu đồ trạng thái duyệt của các tin đăng đang chờ duyệt, lấy dữ liệu từ state.pendingJobs, phân loại theo trạng thái và xây dựng nội dung HTML cho biểu đồ, giúp admin dễ dàng theo dõi tình hình duyệt tin đăng trong hệ thống. Nếu không có phần tử nào để hiển thị biểu đồ, hàm sẽ không thực hiện gì
    if (!el.approvalStatusChart) return;

    var total = Math.max(1, state.pendingJobs.length);
    var pending = state.pendingJobs.filter(function (item) { return normalize(item.status) === "pending"; }).length;
    var approved = state.pendingJobs.filter(function (item) { return normalize(item.status) === "approved"; }).length;
    var violation = state.pendingJobs.filter(function (item) { return normalize(item.status) === "violation"; }).length;

    var rows = [
      { name: "Chờ duyệt", value: pending, color: "#2563eb" },
      { name: "Đã duyệt", value: approved, color: "#16a34a" },
      { name: "Vi phạm", value: violation, color: "#dc2626" }
    ];

    el.approvalStatusChart.innerHTML = rows.map(function (item) {
      var width = Math.round((item.value / total) * 100);
      return (
        "<div class='status-row'>" +
          "<span>" + item.name + "</span>" +
          "<div class='status-track'><div class='status-fill' style='width:" + width + "%; background:" + item.color + ";'></div></div>" +
          "<strong>" + item.value + "</strong>" +
        "</div>"
      );
    }).join("");
  }

  function downloadFile(filename, content, mimeType) { // Hàm tiện ích để tải xuống một file với tên, nội dung và loại MIME được chỉ định, tạo một Blob từ nội dung, tạo URL tạm thời cho Blob đó, tạo một thẻ <a> để kích hoạt tải xuống, và sau khi tải xong sẽ dọn dẹp URL và thẻ khỏi DOM, giúp admin có thể dễ dàng xuất báo cáo hoặc dữ liệu dưới dạng file. Nếu trình duyệt không hỗ trợ Blob hoặc URL.createObjectURL, hàm sẽ hiển thị thông báo lỗi và không thực hiện gì
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportReport() { // Hàm tiện ích để xuất báo cáo hệ thống dưới dạng file Excel hoặc PDF, lấy dữ liệu từ state và xây dựng nội dung báo cáo phù hợp, giúp admin có thể dễ dàng phân tích và lưu trữ thông tin. Nếu không có phần tử nào để xuất báo cáo, hàm sẽ không thực hiện gì
    if (!el.btnExport) return;
    if (el.btnExport.classList.contains("loading")) return;

    var format = el.exportFormat ? el.exportFormat.value : "excel";

    el.btnExport.classList.add("loading");
    el.btnExport.textContent = "Đang tạo báo cáo...";

    setTimeout(function () {
      var now = new Date();
      var dateText = now.toISOString().slice(0, 10);

      if (format === "excel") {
        var header = "ID,Tên tin,Công ty,Người đăng,Ngày gửi,Trạng thái\n";
        var rows = state.pendingJobs.map(function (job) {
          return [job.id, job.title, job.company, job.owner, job.submittedAt, job.status].join(",");
        }).join("\n");

        downloadFile("admin-report-" + dateText + ".csv", header + rows, "text/csv;charset=utf-8;");
      } else {
        var pdfLike = [
          "BÁO CÁO HỆ THỐNG ADMIN",
          "Ngày xuất: " + formatDateTime(now.toISOString()),
          "Tổng người dùng: " + state.users.length,
          "Tổng tin đăng: " + state.pendingJobs.length,
          "Tin chờ duyệt: " + state.pendingJobs.filter(function (j) { return j.status === "pending"; }).length,
          "Tin vi phạm: " + state.pendingJobs.filter(function (j) { return j.status === "violation"; }).length,
          "",
          "Danh sách tin tiêu biểu:",
          state.pendingJobs.slice(0, 8).map(function (job) {
            return "- [" + job.status + "] " + job.title + " | " + job.company + " | " + job.submittedAt;
          }).join("\n")
        ].join("\n");

        downloadFile("admin-report-" + dateText + ".pdf", pdfLike, "application/pdf");
      }

      el.btnExport.classList.remove("loading");
      el.btnExport.textContent = "Xuất file (Excel/PDF)";
      toast("Đã xuất báo cáo thành công.", "success");
      addLog("Xuất báo cáo hệ thống định dạng " + (format === "excel" ? "Excel" : "PDF"), { module: "overview" });
    }, 700);
  }

  function clearCookies() { // Hàm tiện ích để xóa tất cả các cookie trong trình duyệt, giúp admin có thể dễ dàng đăng xuất khỏi hệ thống. Nếu không có cookie nào để xóa, hàm sẽ không thực hiện gì
    var cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach(function (cookie) {
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }

  function logoutAdmin() { // Hàm tiện ích để đăng xuất admin khỏi hệ thống, xác nhận hành động với người dùng, xóa các session và token liên quan, và chuyển hướng người dùng đến trang đăng nhập. Nếu người dùng không xác nhận, hàm sẽ không thực hiện gì
    var ok = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (!ok) return;

    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("adminSession");

    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminToken");

    Object.keys(localStorage).forEach(function (key) {
      if (normalize(key).indexOf("admin") >= 0 || normalize(key).indexOf("token") >= 0 || normalize(key).indexOf("session") >= 0) {
        localStorage.removeItem(key);
      }
    });

    clearCookies();

    if (window.caches && typeof window.caches.keys === "function") {
      window.caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return window.caches.delete(k); }));
      }).finally(function () {
        window.location.href = "login.html";
      });
      return;
    }

    window.location.href = "login.html";
  }

  function bindEvents() { // Hàm tiện ích để gắn các sự kiện cho các phần tử trong giao diện, giúp xử lý các hành động của người dùng như click, change, v.v. Nếu không có phần tử nào để gắn sự kiện, hàm sẽ không thực hiện gì
    if (el.filterGroup) {
      el.filterGroup.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-filter]");
        if (!btn) return;

        state.currentFilter = btn.getAttribute("data-filter");
        state.currentPage = 1;

        Array.prototype.slice.call(document.querySelectorAll(".filter-btn")).forEach(function (item) {
          item.classList.remove("active");
        });
        btn.classList.add("active");

        renderPendingTable();
      });
    }

    if (el.pendingTableBody) {
      el.pendingTableBody.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-action]");
        if (!btn) return;

        var action = btn.getAttribute("data-action");
        var id = Number(btn.getAttribute("data-id"));

        if (action === "detail") {
          openJobDetailModal(id);
        } else if (action === "approve") {
          approveJob(id, false);
        } else if (action === "reject") {
          openRejectModal(id);
        } else if (action === "pin") {
          togglePinnedJob(id);
        } else if (action === "delete") {
          deletePendingJob(id);
        }
      });
    }

    if (el.userTableBody) {
      el.userTableBody.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-user-action]");
        if (!btn) return;

        var action = btn.getAttribute("data-user-action");
        var id = Number(btn.getAttribute("data-user-id"));

        if (action === "toggle") {
          toggleUserStatus(id);
        }

        if (action === "detail") {
          openUserDetailModal(id);
        }

        if (action === "permission") {
          openPermissionModal(id);
        }
      });
    }

    if (el.companyTableBody) {
      el.companyTableBody.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-company-action]");
        if (!btn) return;

        var action = btn.getAttribute("data-company-action");
        var companyName = btn.getAttribute("data-company") || "";

        if (action === "detail") {
          openCompanyDetailModal(companyName);
        }

        if (action === "toggle") {
          toggleCompanyStatus(companyName);
        }
      });
    }

    if (el.industryList) {
      el.industryList.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-industry-action]");
        if (!btn) return;

        var action = btn.getAttribute("data-industry-action");
        var index = Number(btn.getAttribute("data-index"));

        if (action === "edit") {
          editIndustry(index);
        }

        if (action === "delete") {
          deleteIndustry(index);
        }
      });
    }

    if (el.contactsList) {
      el.contactsList.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-contact-action='view']");
        if (!btn) return;

        var contactId = Number(btn.getAttribute("data-contact-id"));
        openContactModal(contactId);
      });
    }

    if (el.depositRequestsList) {
      el.depositRequestsList.addEventListener("click", function (event) {
        var btn = event.target.closest("button[data-deposit-action='approve']");
        if (!btn) return;

        var transactionId = Number(btn.getAttribute("data-id"));
        if (!transactionId) return;
        approveDeposit(transactionId);
      });
    }

    if (el.paymentSearch) {
      el.paymentSearch.addEventListener("input", function (event) {
        state.paymentSearchKeyword = String(event.target.value || "");
        renderDepositRequests();
      });
    }

    if (el.btnPrevPage) {
      el.btnPrevPage.addEventListener("click", function () {
        if (state.currentPage > 1) {
          state.currentPage -= 1;
          renderPendingTable();
        }
      });
    }

    if (el.btnNextPage) {
      el.btnNextPage.addEventListener("click", function () {
        var total = Math.ceil(getFilteredPendingJobs().length / state.pageSize) || 1;
        if (state.currentPage < total) {
          state.currentPage += 1;
          renderPendingTable();
        }
      });
    }

    if (el.globalSearch) {
      el.globalSearch.addEventListener("input", function (event) {
        state.searchKeyword = normalize(event.target.value);
        state.currentPage = 1;
        renderPendingTable();
        renderUsers();
        renderCompanyTable();
      });
    }

    if (el.userStatusFilter) {
      el.userStatusFilter.addEventListener("change", function () {
        state.userStatusFilter = String(el.userStatusFilter.value || "all");
        renderUsers();
        renderCompanyTable();
      });
    }

    if (el.userRoleFilter) {
      el.userRoleFilter.addEventListener("change", function () {
        state.userRoleFilter = String(el.userRoleFilter.value || "all");
        renderUsers();
        renderCompanyTable();
      });
    }

    el.userScopeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.userScope = String(btn.getAttribute("data-scope") || "all");

        el.userScopeButtons.forEach(function (item) {
          item.classList.toggle("active", item === btn);
        });

        renderUsers();
        renderCompanyTable();
      });
    });

    if (el.statsRange) {
      el.statsRange.addEventListener("change", function () {
        state.statsRange = String(el.statsRange.value || "7d");
        renderGrowthChart();
      });
    }

    if (el.btnAddIndustry) {
      el.btnAddIndustry.addEventListener("click", addIndustry);
    }

    if (el.industryInput) {
      el.industryInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addIndustry();
        }
      });
    }

    if (el.btnExport) {
      el.btnExport.addEventListener("click", exportReport);
    }

    if (el.btnBell) {
      el.btnBell.addEventListener("click", function () {
        var unresolved = state.contacts.filter(function (item) { return item.status !== "done"; }).length;
        toast("Ban co " + unresolved + " lien he can xu ly.", "warn");
      });
    }

    if (el.btnLogout) {
      el.btnLogout.addEventListener("click", logoutAdmin);
    }

    if (el.btnCloseRejectModal) el.btnCloseRejectModal.addEventListener("click", closeRejectModal);
    if (el.btnCancelReject) el.btnCancelReject.addEventListener("click", closeRejectModal);
    if (el.btnConfirmReject) el.btnConfirmReject.addEventListener("click", rejectJob);

    if (el.btnCloseJobDetailModal) el.btnCloseJobDetailModal.addEventListener("click", closeJobDetailModal);
    if (el.btnCloseJobDetail) el.btnCloseJobDetail.addEventListener("click", closeJobDetailModal);
    if (el.btnApproveFromDetail) {
      el.btnApproveFromDetail.addEventListener("click", function () {
        if (state.detailTargetId) {
          approveJob(state.detailTargetId, true);
        }
      });
    }

    if (el.btnClosePermissionModal) el.btnClosePermissionModal.addEventListener("click", closePermissionModal);
    if (el.btnCancelPermission) el.btnCancelPermission.addEventListener("click", closePermissionModal);
    if (el.btnSavePermission) el.btnSavePermission.addEventListener("click", savePermissions);

    if (el.btnCloseContactModal) el.btnCloseContactModal.addEventListener("click", closeContactModal);
    if (el.btnCloseContact) el.btnCloseContact.addEventListener("click", closeContactModal);
    if (el.btnForwardContact) el.btnForwardContact.addEventListener("click", forwardContact);
    if (el.btnReplyContact) el.btnReplyContact.addEventListener("click", replyContact);
    if (el.btnMarkContactDone) el.btnMarkContactDone.addEventListener("click", markContactDone);

    if (el.btnSaveSystemSettings) el.btnSaveSystemSettings.addEventListener("click", saveSystemSettings);

    if (el.btnCloseUserDetailModal) el.btnCloseUserDetailModal.addEventListener("click", closeUserDetailModal);
    if (el.btnCloseUserDetail) el.btnCloseUserDetail.addEventListener("click", closeUserDetailModal);
    if (el.btnToggleFromDetail) {
      el.btnToggleFromDetail.addEventListener("click", function () {
        if (!state.userDetailTargetId) return;
        toggleUserStatus(state.userDetailTargetId);
        closeUserDetailModal();
      });
    }

    if (el.btnCloseCompanyDetailModal) el.btnCloseCompanyDetailModal.addEventListener("click", closeCompanyDetailModal);
    if (el.btnCloseCompanyDetail) el.btnCloseCompanyDetail.addEventListener("click", closeCompanyDetailModal);
    if (el.btnToggleCompanyStatus) {
      el.btnToggleCompanyStatus.addEventListener("click", function () {
        if (!state.companyTargetName) return;
        toggleCompanyStatus(state.companyTargetName);
      });
    }

    el.menuLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        setActiveView(link.getAttribute("data-view") || "overview");
      });
    });

    [
      { backdrop: el.rejectModalBackdrop, close: closeRejectModal },
      { backdrop: el.jobDetailModalBackdrop, close: closeJobDetailModal },
      { backdrop: el.permissionModalBackdrop, close: closePermissionModal },
      { backdrop: el.contactModalBackdrop, close: closeContactModal },
      { backdrop: el.userDetailModalBackdrop, close: closeUserDetailModal },
      { backdrop: el.companyDetailModalBackdrop, close: closeCompanyDetailModal }
    ].forEach(function (item) {
      if (!item.backdrop) return;

      item.backdrop.addEventListener("click", function (event) {
        if (event.target === item.backdrop) {
          item.close();
        }
      });
    });
  }

  function init() { // Hàm khởi tạo chính để thiết lập trạng thái ban đầu, tải dữ liệu từ hệ thống xác thực, và render tất cả các thành phần giao diện, giúp admin có thể bắt đầu sử dụng hệ thống quản lý ngay khi trang được tải. Nếu có hàm initializeData được định nghĩa, nó sẽ được gọi trước tiên để thiết lập dữ liệu ban đầu, sau đó sẽ tải dữ liệu từ hệ thống xác thực và render tất cả các phần của giao diện như bảng tin đăng chờ duyệt, danh sách người dùng, công ty, ngành nghề, biểu đồ tăng trưởng, v.v. Cuối cùng, các sự kiện sẽ được gắn và một log sẽ được thêm vào để ghi nhận việc hệ thống đã sẵn sàng. Nếu DOM chưa sẵn sàng khi init được gọi, nó sẽ đợi cho đến khi DOMContentLoaded để thực hiện khởi tạo
    // Initialize data first
    if (typeof initializeData === 'function') {
      initializeData(false);
    }

    // Load data from Auth system
    loadAllData();

    // Render all components
    persistAll();
    renderPendingTable();
    renderUsers();
    renderCompanyTable();
    renderIndustries();
    renderGrowthChart();
    renderKpis();
    renderPolicies();
    renderContacts();
    renderSystemSettings();
    renderActivityLogs();
    renderDepositRequests();
    bindEvents();
    setActiveView("overview");
    renderUsers();
    addLog("Hệ thống sẵn sàng. Dữ liệu được tải từ Auth.", { module: "system", force: true });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
