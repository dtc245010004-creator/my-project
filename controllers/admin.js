// Mã nguồn quản trị viên cho hệ thống tuyển dụng trực tuyến
(function () {
  if (!window.Auth || !Auth.checkRole("admin")) {
    window.location.href = "login.html";
    return;
  }

  var AdminModules = window.AdminModules || {};
  var AdminState = AdminModules.state || {};
  var AdminStorage = AdminModules.storage || {};
  var AdminView = AdminModules.view || {};
  var AdminJobs = AdminModules.jobs || {};
  var AdminUsers = AdminModules.users || {};
  var AdminContacts = AdminModules.contacts || {};
  var AdminSystem = AdminModules.system || {};
  var AdminPayments = AdminModules.payments || {};
  var AdminEvents = AdminModules.events || {};

  var readJson = typeof AdminStorage.readJson === "function"
    ? AdminStorage.readJson
    : function (key, fallback) {
        try {
          var raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
          return fallback;
        }
      };

  var writeJson = typeof AdminStorage.writeJson === "function"
    ? AdminStorage.writeJson
    : function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      };

  var normalize = typeof AdminStorage.normalize === "function"
    ? AdminStorage.normalize
    : function (text) {
        return String(text || "").trim().toLowerCase();
      };

  var STORAGE = typeof AdminState.createStorageConfig === "function"
    ? AdminState.createStorageConfig()
    : {
        PENDING_JOBS: "ADMIN_PENDING_JOBS",
        USERS: "ADMIN_USERS",
        INDUSTRIES: "ADMIN_INDUSTRIES",
        CONTACTS: "ADMIN_CONTACTS",
        SYSTEM_SETTINGS: "ADMIN_SYSTEM_SETTINGS",
        ACTIVITY_LOGS: "ADMIN_ACTIVITY_LOGS"
      };

  var defaults = {
    pendingJobs: typeof AdminState.createDefaultPendingJobs === "function" ? AdminState.createDefaultPendingJobs() : [],
    users: typeof AdminState.createDefaultUsers === "function" ? AdminState.createDefaultUsers() : [],
    industries: typeof AdminState.createDefaultIndustries === "function" ? AdminState.createDefaultIndustries() : [],
    contacts: typeof AdminState.createDefaultContacts === "function" ? AdminState.createDefaultContacts() : [],
    policies: typeof AdminState.createPolicies === "function" ? AdminState.createPolicies() : [],
    rangeConfig: typeof AdminState.createRangeConfig === "function" ? AdminState.createRangeConfig() : { "7d": { labels: ["T2"], values: [1] } },
    permissions: typeof AdminState.createPermissions === "function" ? AdminState.createPermissions() : [],
    systemSettings: typeof AdminState.createDefaultSystemSettings === "function"
      ? AdminState.createDefaultSystemSettings()
      : { emailNotifications: true, autoLog: true, fastModeration: false }
  };

  var state = typeof AdminState.createRuntimeState === "function"
    ? AdminState.createRuntimeState({
        defaults: defaults,
        readJson: readJson,
        STORAGE: STORAGE
      })
    : {
        pendingJobs: defaults.pendingJobs.slice(),
        users: defaults.users.slice(),
        industries: defaults.industries.slice(),
        contacts: defaults.contacts.slice(),
        systemSettings: Object.assign({}, defaults.systemSettings),
        activityLogs: [],
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
    btnMarkContactDone: document.getElementById("btnMarkContactDone"),
    userDetailModalBackdrop: document.getElementById("userDetailModalBackdrop"),
    userDetailBody: document.getElementById("userDetailBody"),
    btnCloseUserDetailModal: document.getElementById("btnCloseUserDetailModal"),
    btnCloseUserDetail: document.getElementById("btnCloseUserDetail"),
    btnToggleFromDetail: document.getElementById("btnToggleFromDetail"),
    companyDetailModalBackdrop: document.getElementById("companyDetailModalBackdrop"),
    companyDetailBody: document.getElementById("companyDetailBody"),
    btnCloseCompanyDetailModal: document.getElementById("btnCloseCompanyDetailModal"),
    btnCloseCompanyDetail: document.getElementById("btnCloseCompanyDetail"),
    btnToggleCompanyStatus: document.getElementById("btnToggleCompanyStatus")
  };

  var persistAll = typeof AdminStorage.createPersistAll === "function"
    ? AdminStorage.createPersistAll({
        state: state,
        STORAGE: STORAGE,
        writeJson: writeJson
      })
    : function () {};

  var syncUsersToAuthStore = typeof AdminStorage.createSyncUsersToAuthStore === "function"
    ? AdminStorage.createSyncUsersToAuthStore({
        state: state,
        writeJson: writeJson
      })
    : function () {};

  var syncSharedJobs = typeof AdminStorage.createSyncSharedJobs === "function"
    ? AdminStorage.createSyncSharedJobs({ readJson: readJson })
    : function () {};

  var patchSharedJob = typeof AdminStorage.createPatchSharedJob === "function"
    ? AdminStorage.createPatchSharedJob({ readJson: readJson })
    : function () {};

  var toast = typeof AdminSystem.toast === "function" ? AdminSystem.toast : function () {};
  var getModuleLabel = typeof AdminSystem.getModuleLabel === "function"
    ? function (module) { return AdminSystem.getModuleLabel(module, normalize); }
    : function () { return "Hệ thống"; };
  var formatDate = typeof AdminSystem.formatDate === "function" ? AdminSystem.formatDate : function (value) { return value || "N/A"; };
  var formatDateTime = typeof AdminSystem.formatDateTime === "function" ? AdminSystem.formatDateTime : function () { return "Không rõ"; };
  var formatCurrency = typeof AdminSystem.formatCurrency === "function" ? AdminSystem.formatCurrency : function (amount) { return String(amount || 0); };

  var renderActivityLogs = typeof AdminSystem.createRenderActivityLogs === "function"
    ? AdminSystem.createRenderActivityLogs({
        state: state,
        el: el,
        normalize: normalize,
        getModuleLabel: function (module) { return getModuleLabel(module); },
        formatDateTime: formatDateTime
      })
    : function () {};

  var addLog = typeof AdminSystem.createAddLog === "function"
    ? AdminSystem.createAddLog({
        state: state,
        persistAll: persistAll,
        renderActivityLogs: renderActivityLogs
      })
    : function () {};

  var renderSystemSettings = typeof AdminSystem.createRenderSystemSettings === "function"
    ? AdminSystem.createRenderSystemSettings({
        state: state,
        el: el
      })
    : function () {};

  var saveSystemSettings = typeof AdminSystem.createSaveSystemSettings === "function"
    ? AdminSystem.createSaveSystemSettings({
        state: state,
        el: el,
        persistAll: persistAll,
        addLog: addLog,
        toast: toast
      })
    : function () {};

  var logoutAdmin = typeof AdminSystem.createLogoutAdmin === "function"
    ? AdminSystem.createLogoutAdmin({
        clearCookies: AdminSystem.clearCookies || function () {},
        normalize: normalize
      })
    : function () {
        window.location.href = "login.html";
      };

  var loadAllData = typeof AdminState.createLoadAllData === "function"
    ? AdminState.createLoadAllData({
        defaults: defaults,
        state: state,
        persistAll: persistAll,
        Auth: Auth,
        readJson: readJson,
        STORAGE: STORAGE
      })
    : function () {};

  var statusBadge = typeof AdminJobs.createStatusBadge === "function" ? AdminJobs.createStatusBadge() : function () { return ""; };
  var getFilteredPendingJobs = typeof AdminJobs.createGetFilteredPendingJobs === "function"
    ? AdminJobs.createGetFilteredPendingJobs({
        state: state,
        normalize: normalize
      })
    : function () { return []; };
  var paginate = typeof AdminJobs.createPaginate === "function"
    ? AdminJobs.createPaginate({ state: state })
    : function (items) { return { pageItems: items, totalPages: 1, total: items.length }; };
  var renderPendingTable = typeof AdminJobs.createRenderPendingTable === "function"
    ? AdminJobs.createRenderPendingTable({
        state: state,
        el: el,
        getFilteredPendingJobs: getFilteredPendingJobs,
        paginate: paginate,
        statusBadge: statusBadge,
        formatDateTime: formatDateTime
      })
    : function () {};

  var closeJobDetailModal = typeof AdminJobs.createCloseJobDetailModal === "function"
    ? AdminJobs.createCloseJobDetailModal({
        state: state,
        el: el
      })
    : function () {};

  var approveJob = typeof AdminJobs.createApproveJob === "function"
    ? AdminJobs.createApproveJob({
        state: state,
        persistAll: persistAll,
        patchSharedJob: patchSharedJob,
        renderPendingTable: renderPendingTable,
        renderKpis: function () {},
        addLog: addLog,
        closeJobDetailModal: closeJobDetailModal,
        toast: toast
      })
    : function () {};

  var openJobDetailModal = typeof AdminJobs.createOpenJobDetailModal === "function"
    ? AdminJobs.createOpenJobDetailModal({
        state: state,
        el: el
      })
    : function () {};
  var openRejectModal = typeof AdminJobs.createOpenRejectModal === "function"
    ? AdminJobs.createOpenRejectModal({
        state: state,
        el: el
      })
    : function () {};
  var closeRejectModal = typeof AdminJobs.createCloseRejectModal === "function"
    ? AdminJobs.createCloseRejectModal({
        state: state,
        el: el
      })
    : function () {};
  var rejectJob = typeof AdminJobs.createRejectJob === "function"
    ? AdminJobs.createRejectJob({
        state: state,
        el: el,
        persistAll: persistAll,
        renderPendingTable: renderPendingTable,
        renderKpis: function () {},
        addLog: addLog,
        closeRejectModal: closeRejectModal,
        toast: toast
      })
    : function () {};
  var deletePendingJob = typeof AdminJobs.createDeletePendingJob === "function"
    ? AdminJobs.createDeletePendingJob({
        state: state,
        persistAll: persistAll,
        syncSharedJobs: syncSharedJobs,
        getFilteredPendingJobs: getFilteredPendingJobs,
        renderPendingTable: renderPendingTable,
        renderKpis: function () {},
        addLog: addLog,
        toast: toast
      })
    : function () {};
  var togglePinnedJob = typeof AdminJobs.createTogglePinnedJob === "function"
    ? AdminJobs.createTogglePinnedJob({
        state: state,
        persistAll: persistAll,
        patchSharedJob: patchSharedJob,
        renderPendingTable: renderPendingTable,
        addLog: addLog,
        toast: toast
      })
    : function () {};

  var getFilteredUsers = typeof AdminUsers.createGetFilteredUsers === "function"
    ? AdminUsers.createGetFilteredUsers({
        state: state,
        normalize: normalize
      })
    : function () { return []; };
  var getCompanyRecords = typeof AdminUsers.createGetCompanyRecords === "function"
    ? AdminUsers.createGetCompanyRecords({
        state: state,
        normalize: normalize
      })
    : function () { return []; };

  var renderCompanyTable = typeof AdminUsers.createRenderCompanyTable === "function"
    ? AdminUsers.createRenderCompanyTable({
        state: state,
        el: el,
        getCompanyRecords: getCompanyRecords,
        normalize: normalize
      })
    : function () {};

  var openCompanyDetailModal = typeof AdminUsers.createOpenCompanyDetailModal === "function"
    ? AdminUsers.createOpenCompanyDetailModal({
        state: state,
        el: el,
        getCompanyRecords: getCompanyRecords,
        normalize: normalize
      })
    : function () {};

  var closeCompanyDetailModal = typeof AdminUsers.createCloseCompanyDetailModal === "function"
    ? AdminUsers.createCloseCompanyDetailModal({
        state: state,
        el: el
      })
    : function () {};

  var renderUsers = typeof AdminUsers.createRenderUsers === "function"
    ? AdminUsers.createRenderUsers({
        state: state,
        el: el,
        getFilteredUsers: getFilteredUsers,
        formatDate: formatDate
      })
    : function () {};

  var closePermissionModal = typeof AdminUsers.createClosePermissionModal === "function"
    ? AdminUsers.createClosePermissionModal({
        state: state,
        el: el
      })
    : function () {};

  var closeUserDetailModal = typeof AdminUsers.createCloseUserDetailModal === "function"
    ? AdminUsers.createCloseUserDetailModal({
        state: state,
        el: el
      })
    : function () {};

  var closeContactModal = function () {};

  var toggleCompanyStatus = typeof AdminUsers.createToggleCompanyStatus === "function"
    ? AdminUsers.createToggleCompanyStatus({
        state: state,
        persistAll: persistAll,
        syncUsersToAuthStore: syncUsersToAuthStore,
        renderUsers: renderUsers,
        renderCompanyTable: renderCompanyTable,
        renderKpis: function () {},
        addLog: addLog,
        openCompanyDetailModal: openCompanyDetailModal,
        getCompanyRecords: getCompanyRecords,
        normalize: normalize,
        toast: toast
      })
    : function () {};

  var toggleUserStatus = typeof AdminUsers.createToggleUserStatus === "function"
    ? AdminUsers.createToggleUserStatus({
        state: state,
        persistAll: persistAll,
        syncUsersToAuthStore: syncUsersToAuthStore,
        renderUsers: renderUsers,
        renderCompanyTable: renderCompanyTable,
        renderKpis: function () {},
        addLog: addLog,
        closePermissionModal: closePermissionModal,
        closeContactModal: function () { return closeContactModal(); },
        toast: toast
      })
    : function () {};

  var openUserDetailModal = typeof AdminUsers.createOpenUserDetailModal === "function"
    ? AdminUsers.createOpenUserDetailModal({
        state: state,
        el: el,
        formatDate: formatDate
      })
    : function () {};

  var openPermissionModal = typeof AdminUsers.createOpenPermissionModal === "function"
    ? AdminUsers.createOpenPermissionModal({
        state: state,
        el: el,
        permissions: defaults.permissions
      })
    : function () {};

  var savePermissions = typeof AdminUsers.createSavePermissions === "function"
    ? AdminUsers.createSavePermissions({
        state: state,
        el: el,
        persistAll: persistAll,
        syncUsersToAuthStore: syncUsersToAuthStore,
        renderUsers: renderUsers,
        renderCompanyTable: renderCompanyTable,
        addLog: addLog,
        closePermissionModal: closePermissionModal,
        toast: toast
      })
    : function () {};

  var renderIndustries = typeof AdminUsers.createRenderIndustries === "function"
    ? AdminUsers.createRenderIndustries({
        state: state,
        el: el
      })
    : function () {};

  var addIndustry = typeof AdminUsers.createAddIndustry === "function"
    ? AdminUsers.createAddIndustry({
        state: state,
        el: el,
        persistAll: persistAll,
        renderIndustries: renderIndustries,
        addLog: addLog,
        normalize: normalize,
        toast: toast
      })
    : function () {};

  var editIndustry = typeof AdminUsers.createEditIndustry === "function"
    ? AdminUsers.createEditIndustry({
        state: state,
        persistAll: persistAll,
        renderIndustries: renderIndustries,
        addLog: addLog,
        normalize: normalize,
        toast: toast
      })
    : function () {};

  var deleteIndustry = typeof AdminUsers.createDeleteIndustry === "function"
    ? AdminUsers.createDeleteIndustry({
        state: state,
        persistAll: persistAll,
        renderIndustries: renderIndustries,
        addLog: addLog,
        toast: toast
      })
    : function () {};

  var renderPolicies = typeof AdminUsers.createRenderPolicies === "function"
    ? AdminUsers.createRenderPolicies({
        el: el,
        policies: defaults.policies
      })
    : function () {};

  var setActiveView = typeof AdminView.createSetActiveView === "function"
    ? AdminView.createSetActiveView({ el: el })
    : function () {};

  var renderApprovalStatusChart = typeof AdminView.createRenderApprovalStatusChart === "function"
    ? AdminView.createRenderApprovalStatusChart({
        state: state,
        el: el,
        normalize: normalize
      })
    : function () {};

  var renderKpis = typeof AdminView.createRenderKpis === "function"
    ? AdminView.createRenderKpis({
        state: state,
        el: el,
        renderApprovalStatusChart: renderApprovalStatusChart,
        formatCurrency: formatCurrency,
        normalize: normalize
      })
    : function () {};

  approveJob = typeof AdminJobs.createApproveJob === "function"
    ? AdminJobs.createApproveJob({
        state: state,
        persistAll: persistAll,
        patchSharedJob: patchSharedJob,
        renderPendingTable: renderPendingTable,
        renderKpis: renderKpis,
        addLog: addLog,
        closeJobDetailModal: closeJobDetailModal,
        toast: toast
      })
    : approveJob;

  rejectJob = typeof AdminJobs.createRejectJob === "function"
    ? AdminJobs.createRejectJob({
        state: state,
        el: el,
        persistAll: persistAll,
        renderPendingTable: renderPendingTable,
        renderKpis: renderKpis,
        addLog: addLog,
        closeRejectModal: closeRejectModal,
        toast: toast
      })
    : rejectJob;

  deletePendingJob = typeof AdminJobs.createDeletePendingJob === "function"
    ? AdminJobs.createDeletePendingJob({
        state: state,
        persistAll: persistAll,
        syncSharedJobs: syncSharedJobs,
        getFilteredPendingJobs: getFilteredPendingJobs,
        renderPendingTable: renderPendingTable,
        renderKpis: renderKpis,
        addLog: addLog,
        toast: toast
      })
    : deletePendingJob;

  toggleCompanyStatus = typeof AdminUsers.createToggleCompanyStatus === "function"
    ? AdminUsers.createToggleCompanyStatus({
        state: state,
        persistAll: persistAll,
        syncUsersToAuthStore: syncUsersToAuthStore,
        renderUsers: renderUsers,
        renderCompanyTable: renderCompanyTable,
        renderKpis: renderKpis,
        addLog: addLog,
        openCompanyDetailModal: openCompanyDetailModal,
        getCompanyRecords: getCompanyRecords,
        normalize: normalize,
        toast: toast
      })
    : toggleCompanyStatus;

  var renderGrowthChart = typeof AdminView.createRenderGrowthChart === "function"
    ? AdminView.createRenderGrowthChart({
        state: state,
        el: el,
        rangeConfig: defaults.rangeConfig,
        renderApprovalStatusChart: renderApprovalStatusChart
      })
    : function () {};

  var downloadFile = typeof AdminView.createDownloadFile === "function"
    ? AdminView.createDownloadFile()
    : function () {};

  var exportReport = typeof AdminView.createExportReport === "function"
    ? AdminView.createExportReport({
        state: state,
        el: el,
        downloadFile: downloadFile,
        addLog: addLog,
        formatDateTime: formatDateTime,
        toast: toast
      })
    : function () {};

  var formatContactStatusLabel = typeof AdminContacts.createFormatContactStatusLabel === "function"
    ? AdminContacts.createFormatContactStatusLabel()
    : function () { return "Mới"; };

  var renderContacts = typeof AdminContacts.createRenderContacts === "function"
    ? AdminContacts.createRenderContacts({
        state: state,
        el: el,
        formatDateTime: formatDateTime
      })
    : function () {};

  var renderContactHistory = typeof AdminContacts.createRenderContactHistory === "function"
    ? AdminContacts.createRenderContactHistory({
        el: el,
        formatDateTime: formatDateTime
      })
    : function () {};

  closeContactModal = typeof AdminContacts.createCloseContactModal === "function"
    ? AdminContacts.createCloseContactModal({
        state: state,
        el: el
      })
    : closeContactModal;

  var openContactModal = typeof AdminContacts.createOpenContactModal === "function"
    ? AdminContacts.createOpenContactModal({
        state: state,
        el: el,
        renderContactHistory: renderContactHistory,
        formatContactStatusLabel: formatContactStatusLabel
      })
    : function () {};

  var updateContactStatus = typeof AdminContacts.createUpdateContactStatus === "function"
    ? AdminContacts.createUpdateContactStatus({
        state: state,
        el: el,
        persistAll: persistAll,
        renderContacts: renderContacts,
        addLog: addLog,
        closeContactModal: closeContactModal,
        toast: toast
      })
    : function () {};

  var markContactDone = typeof AdminContacts.createMarkContactDone === "function"
    ? AdminContacts.createMarkContactDone({ updateContactStatus: updateContactStatus })
    : function () {};

  var forwardContact = typeof AdminContacts.createForwardContact === "function"
    ? AdminContacts.createForwardContact({ updateContactStatus: updateContactStatus })
    : function () {};

  var replyContact = typeof AdminContacts.createReplyContact === "function"
    ? AdminContacts.createReplyContact({ updateContactStatus: updateContactStatus })
    : function () {};

  var saveAllTransactions = typeof AdminPayments.createSaveAllTransactions === "function"
    ? AdminPayments.createSaveAllTransactions({
        writeJson: writeJson
      })
    : function () {};

  var renderDepositRequests = typeof AdminPayments.createRenderDepositRequests === "function"
    ? AdminPayments.createRenderDepositRequests({
        state: state,
        el: el,
        formatCurrency: formatCurrency,
        formatDateTime: formatDateTime,
        normalize: normalize
      })
    : function () {};

  var approveDeposit = typeof AdminPayments.createApproveDeposit === "function"
    ? AdminPayments.createApproveDeposit({
        state: state,
        persistAll: persistAll,
        readJson: readJson,
        writeJson: writeJson,
        saveAllTransactions: saveAllTransactions,
        renderUsers: renderUsers,
        renderDepositRequests: renderDepositRequests,
        renderKpis: renderKpis,
        addLog: addLog,
        normalize: normalize,
        toast: toast
      })
    : function () {};

  var bindEvents = typeof AdminEvents.createBindEvents === "function"
    ? AdminEvents.createBindEvents({
        state: state,
        el: el,
        renderDepositRequests: renderDepositRequests,
        renderPendingTable: renderPendingTable,
        renderUsers: renderUsers,
        renderCompanyTable: renderCompanyTable,
        renderGrowthChart: renderGrowthChart,
        getFilteredPendingJobs: getFilteredPendingJobs,
        addIndustry: addIndustry,
        addLog: addLog,
        closeRejectModal: closeRejectModal,
        closeJobDetailModal: closeJobDetailModal,
        closePermissionModal: closePermissionModal,
        closeContactModal: closeContactModal,
        closeUserDetailModal: closeUserDetailModal,
        closeCompanyDetailModal: closeCompanyDetailModal,
        deletePendingJob: deletePendingJob,
        deleteIndustry: deleteIndustry,
        editIndustry: editIndustry,
        exportReport: exportReport,
        forwardContact: forwardContact,
        logoutAdmin: logoutAdmin,
        markContactDone: markContactDone,
        openJobDetailModal: openJobDetailModal,
        openRejectModal: openRejectModal,
        openUserDetailModal: openUserDetailModal,
        openPermissionModal: openPermissionModal,
        openCompanyDetailModal: openCompanyDetailModal,
        openContactModal: openContactModal,
        approveJob: approveJob,
        approveDeposit: approveDeposit,
        rejectJob: rejectJob,
        replyContact: replyContact,
        savePermissions: savePermissions,
        saveSystemSettings: saveSystemSettings,
        setActiveView: setActiveView,
        togglePinnedJob: togglePinnedJob,
        toggleUserStatus: toggleUserStatus,
        toggleCompanyStatus: toggleCompanyStatus,
        normalize: normalize,
        toast: toast
      })
    : function () {};

  function init() {
    if (typeof initializeData === "function") {
      initializeData(false);
    }

    loadAllData();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
