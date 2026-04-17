(function () {
  var modules = window.CandidateModules || {};
  var storage = modules.Storage || {};
  var coreModule = modules.Core || {};
  var notificationsModule = modules.Notifications || {};
  var cvProfileModule = modules.CvProfile || {};
  var jobsModule = modules.Jobs || {};
  var eventsModule = modules.Events || {};

  var readJson = typeof storage.readJson === "function" ? storage.readJson : function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };
  var writeJson = typeof storage.writeJson === "function" ? storage.writeJson : function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };
  var writeCollection = typeof storage.writeCollection === "function" ? storage.writeCollection : function (sharedKey, legacyKey, value) {
    writeJson(sharedKey, value);
    writeJson(legacyKey, value);
  };
  var normalize = typeof storage.normalize === "function" ? storage.normalize : function (text) {
    return String(text || "").trim().toLowerCase();
  };
  var escapeHtml = typeof storage.escapeHtml === "function" ? storage.escapeHtml : function (text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  var getCurrentUser = typeof storage.getCurrentUser === "function" ? storage.getCurrentUser : function () { return null; };
  var getStoredUsers = typeof storage.getStoredUsers === "function" ? storage.getStoredUsers : function () { return []; };
  var getJobCollection = typeof storage.getJobCollection === "function" ? storage.getJobCollection : function () { return []; };
  var getApplicationCollection = typeof storage.getApplicationCollection === "function" ? storage.getApplicationCollection : function () { return []; };
  var buildAvatarFromName = typeof storage.buildAvatarFromName === "function" ? storage.buildAvatarFromName : function (name) {
    var value = String(name || "").trim();
    return value ? value.slice(0, 2).toUpperCase() : "NA";
  };

  var state = {
    jobs: [],
    applications: [],
    interviews: [],
    savedJobs: [],
    cvs: [],
    users: [],
    selectedJob: null,
    user: null
  };

  var el = {
    jobListEl: document.getElementById("jobList"),
    searchInputEl: document.getElementById("searchInput"),
    filterEl: document.getElementById("jobFilter"),
    appliedCountEl: document.getElementById("appliedCount"),
    savedCountEl: document.getElementById("savedCount"),
    interviewCountEl: document.getElementById("interviewCount"),
    timelineEl: document.getElementById("timeline"),
    historyListEl: document.getElementById("historyList"),
    historySearchInputEl: document.getElementById("historySearchInput"),
    historyDateFilterEl: document.getElementById("historyDateFilter"),
    favoriteListEl: document.getElementById("favoriteList"),
    cvListEl: document.getElementById("cvList"),
    candidateContactSendEl: document.getElementById("candidateContactSend"),
    sidebarNameEl: document.getElementById("sidebarUserName"),
    sidebarAvatarEl: document.getElementById("sidebarAvatar"),
    headerNameEl: document.getElementById("headerUserName"),
    modalBackdropEl: document.getElementById("applyModalBackdrop"),
    modalCloseEl: document.getElementById("applyModalClose"),
    modalCancelEl: document.getElementById("applyCancelBtn"),
    modalConfirmEl: document.getElementById("applyConfirmBtn"),
    modalJobTitleEl: document.getElementById("applyJobTitle"),
    modalCvSelectEl: document.getElementById("applyCvSelect"),
    modalMessageEl: document.getElementById("applyMessage"),
    jobDetailBackdropEl: document.getElementById("jobDetailBackdrop"),
    jobDetailCloseEl: document.getElementById("jobDetailClose"),
    jobDetailCloseBtnEl: document.getElementById("jobDetailCloseBtn"),
    jobDetailApplyBtnEl: document.getElementById("jobDetailApplyBtn"),
    jobDetailNameEl: document.getElementById("jobDetailName"),
    jobDetailCompanyEl: document.getElementById("jobDetailCompany"),
    jobDetailSalaryEl: document.getElementById("jobDetailSalary"),
    jobDetailLocationEl: document.getElementById("jobDetailLocation"),
    jobDetailRequirementsEl: document.getElementById("jobDetailRequirements"),
    jobDetailMaxApplicantsEl: document.getElementById("jobDetailMaxApplicants"),
    jobDetailTypeEl: document.getElementById("jobDetailType"),
    jobDetailStatusEl: document.getElementById("jobDetailStatus"),
    jobDetailPostedDateEl: document.getElementById("jobDetailPostedDate"),
    jobDetailDescriptionEl: document.getElementById("jobDetailDescription"),
    recruiterFeedbackBackdropEl: document.getElementById("recruiterFeedbackBackdrop"),
    recruiterFeedbackCloseEl: document.getElementById("recruiterFeedbackClose"),
    recruiterFeedbackCloseBtnEl: document.getElementById("recruiterFeedbackCloseBtn"),
    recruiterFeedbackApplyBtnEl: document.getElementById("recruiterFeedbackApplyBtn"),
    feedbackJobNameEl: document.getElementById("feedbackJobName"),
    feedbackCompanyEl: document.getElementById("feedbackCompany"),
    feedbackStatusEl: document.getElementById("feedbackStatus"),
    feedbackMessageEl: document.getElementById("feedbackMessage"),
    feedbackInterviewEl: document.getElementById("feedbackInterview"),
    feedbackUpdatedAtEl: document.getElementById("feedbackUpdatedAt"),
    cvPreviewBackdropEl: document.getElementById("cvPreviewBackdrop"),
    cvPreviewCloseEl: document.getElementById("cvPreviewClose"),
    cvPreviewCloseBtnEl: document.getElementById("cvPreviewCloseBtn"),
    cvPreviewDownloadBtnEl: document.getElementById("cvPreviewDownloadBtn"),
    cvPreviewNameEl: document.getElementById("cvPreviewName"),
    cvPreviewCandidateEl: document.getElementById("cvPreviewCandidate"),
    cvPreviewPositionEl: document.getElementById("cvPreviewPosition"),
    cvPreviewSkillsEl: document.getElementById("cvPreviewSkills"),
    cvPreviewSummaryEl: document.getElementById("cvPreviewSummary"),
    cvPreviewUpdatedEl: document.getElementById("cvPreviewUpdated"),
    cvEditBackdropEl: document.getElementById("cvEditBackdrop"),
    cvEditCloseEl: document.getElementById("cvEditClose"),
    cvEditCancelEl: document.getElementById("cvEditCancel"),
    cvEditSaveEl: document.getElementById("cvEditSave"),
    cvEditNameEl: document.getElementById("cvEditName"),
    cvEditPositionEl: document.getElementById("cvEditPosition"),
    cvEditSkillsEl: document.getElementById("cvEditSkills"),
    cvEditSummaryEl: document.getElementById("cvEditSummary"),
    accountSettingsCancelEl: document.getElementById("accountSettingsCancel"),
    accountSettingsSaveEl: document.getElementById("accountSettingsSave"),
    openAccountEditBtn: document.getElementById("openAccountEditBtn"),
    accountEditPanelEl: document.getElementById("accountEditPanel"),
    accountNameDisplayEl: document.getElementById("accountNameDisplay"),
    accountCompanyDisplayEl: document.getElementById("accountCompanyDisplay"),
    accountEmailDisplayEl: document.getElementById("accountEmailDisplay"),
    accountPhoneDisplayEl: document.getElementById("accountPhoneDisplay"),
    accountNameEl: document.getElementById("accountName"),
    accountEmailEl: document.getElementById("accountEmail"),
    accountPhoneEl: document.getElementById("accountPhone"),
    accountCurrentPasswordEl: document.getElementById("accountCurrentPassword"),
    accountNewPasswordEl: document.getElementById("accountNewPassword"),
    accountConfirmPasswordEl: document.getElementById("accountConfirmPassword"),
    cvTotalStatEl: document.getElementById("cvTotalStat"),
    cvDefaultStatEl: document.getElementById("cvDefaultStat"),
    cvLatestStatEl: document.getElementById("cvLatestStat")
  };

  var menuLinks = document.querySelectorAll(".menu a[data-view]");
  var viewSections = document.querySelectorAll(".view-section");

  var coreApi = typeof coreModule.createCoreApi === "function" ? coreModule.createCoreApi({
    state: state,
    el: el,
    readJson: readJson,
    getCurrentUser: getCurrentUser,
    getStoredUsers: getStoredUsers,
    getJobCollection: getJobCollection,
    getApplicationCollection: getApplicationCollection,
    normalize: normalize
  }) : {};

  var formatDateTime = typeof coreApi.formatDateTime === "function" ? coreApi.formatDateTime : function () { return "Khong ro thoi gian"; };

  var notificationApi = typeof notificationsModule.createNotificationApi === "function" ? notificationsModule.createNotificationApi({
    state: state,
    readJson: readJson,
    writeJson: writeJson,
    formatDateTime: formatDateTime,
    escapeHtml: escapeHtml,
    normalize: normalize
  }) : {};

  var cvProfileApi = typeof cvProfileModule.createCvProfileApi === "function" ? cvProfileModule.createCvProfileApi({
    state: state,
    el: el,
    writeJson: writeJson,
    persistLoggedInUser: function (user) { if (typeof coreApi.persistLoggedInUser === "function") coreApi.persistLoggedInUser(user); },
    getStoredUserRecord: function () { return typeof coreApi.getStoredUserRecord === "function" ? coreApi.getStoredUserRecord() : null; },
    buildAvatarFromName: buildAvatarFromName,
    formatDateTime: formatDateTime,
    escapeHtml: escapeHtml,
    normalize: normalize
  }) : {};

  var jobsApi = typeof jobsModule.createJobsApi === "function" ? jobsModule.createJobsApi({
    state: state,
    el: el,
    writeJson: writeJson,
    writeCollection: writeCollection,
    formatDateTime: formatDateTime,
    escapeHtml: escapeHtml,
    normalize: normalize,
    getSavedForUser: function () { return typeof coreApi.getSavedForUser === "function" ? coreApi.getSavedForUser() : []; },
    getUserApplications: function () { return typeof coreApi.getUserApplications === "function" ? coreApi.getUserApplications() : []; },
    getJobCollection: getJobCollection,
    getApplicationCollection: getApplicationCollection,
    getDefaultCvId: function () { return typeof cvProfileApi.getDefaultCvId === "function" ? cvProfileApi.getDefaultCvId() : 0; },
    updateStats: function () { if (typeof coreApi.updateStats === "function") coreApi.updateStats(); }
  }) : {};

  var eventsApi = typeof eventsModule.createEventsApi === "function" ? eventsModule.createEventsApi({
    state: state,
    el: el,
    viewSections: viewSections,
    menuLinks: menuLinks,
    readJson: readJson,
    getCurrentUser: getCurrentUser,
    renderJobs: function () { if (typeof jobsApi.renderJobs === "function") jobsApi.renderJobs(); },
    renderApplicationHistory: function () { if (typeof jobsApi.renderApplicationHistory === "function") jobsApi.renderApplicationHistory(); },
    renderFavoritesSection: function () { if (typeof jobsApi.renderFavoritesSection === "function") jobsApi.renderFavoritesSection(); },
    renderCvList: function () { if (typeof cvProfileApi.renderCvList === "function") cvProfileApi.renderCvList(); },
    openJobDetailModal: function (job) { if (typeof jobsApi.openJobDetailModal === "function") jobsApi.openJobDetailModal(job); },
    openApplyModal: function (job) { if (typeof jobsApi.openApplyModal === "function") jobsApi.openApplyModal(job); },
    toggleFavorite: function (jobId) { if (typeof jobsApi.toggleFavorite === "function") jobsApi.toggleFavorite(jobId); },
    handleCvAction: function (action, cvId) { if (typeof cvProfileApi.handleCvAction === "function") cvProfileApi.handleCvAction(action, cvId); },
    removeFavoriteByJobId: function (jobId) { if (typeof jobsApi.removeFavoriteByJobId === "function") jobsApi.removeFavoriteByJobId(jobId); },
    openRecruiterFeedbackModal: function (app) { if (typeof jobsApi.openRecruiterFeedbackModal === "function") jobsApi.openRecruiterFeedbackModal(app); },
    deleteApplicationHistory: function (appId) { if (typeof jobsApi.deleteApplicationHistory === "function") jobsApi.deleteApplicationHistory(appId); },
    closeApplyModal: function () { if (typeof jobsApi.closeApplyModal === "function") jobsApi.closeApplyModal(); },
    submitApplication: function () { if (typeof jobsApi.submitApplication === "function") jobsApi.submitApplication(); },
    closeJobDetailModal: function () { if (typeof jobsApi.closeJobDetailModal === "function") jobsApi.closeJobDetailModal(); },
    closeRecruiterFeedbackModal: function () { if (typeof jobsApi.closeRecruiterFeedbackModal === "function") jobsApi.closeRecruiterFeedbackModal(); },
    submitAdminContact: function () { if (typeof notificationApi.submitAdminContact === "function") notificationApi.submitAdminContact("candidate", "Candidate"); },
    openNotificationsModal: function () { if (typeof notificationApi.openNotificationsModal === "function") notificationApi.openNotificationsModal(); },
    closeNotificationsModal: function () { if (typeof notificationApi.closeNotificationsModal === "function") notificationApi.closeNotificationsModal(); },
    markCandidateNotificationsRead: function () { if (typeof notificationApi.markCandidateNotificationsRead === "function") notificationApi.markCandidateNotificationsRead(); },
    closeCvPreviewModal: function () { if (typeof cvProfileApi.closeCvPreviewModal === "function") cvProfileApi.closeCvPreviewModal(); },
    closeCvEditModal: function () { if (typeof cvProfileApi.closeCvEditModal === "function") cvProfileApi.closeCvEditModal(); },
    submitCvEdit: function () { if (typeof cvProfileApi.submitCvEdit === "function") cvProfileApi.submitCvEdit(); },
    openAccountSettingsModal: function () { if (typeof cvProfileApi.openAccountSettingsModal === "function") cvProfileApi.openAccountSettingsModal(); },
    closeAccountSettingsModal: function () { if (typeof cvProfileApi.closeAccountSettingsModal === "function") cvProfileApi.closeAccountSettingsModal(); },
    submitAccountSettings: function () { if (typeof cvProfileApi.submitAccountSettings === "function") cvProfileApi.submitAccountSettings(); },
    getActivePreviewCvId: function () { return typeof cvProfileApi.getActivePreviewCvId === "function" ? cvProfileApi.getActivePreviewCvId() : null; },
    updateStats: function () { if (typeof coreApi.updateStats === "function") coreApi.updateStats(); },
    updateNotificationBadge: function () { if (typeof notificationApi.updateNotificationBadge === "function") notificationApi.updateNotificationBadge(); },
    renderNotifications: function () { if (typeof notificationApi.renderNotifications === "function") notificationApi.renderNotifications(); }
  }) : {};

  function initCandidateModule() {
    if (typeof initializeData === "function") {
      initializeData(false);
    }

    if (typeof coreApi.loadState === "function") coreApi.loadState();
    if (typeof jobsApi.syncMissingJobViews === "function") jobsApi.syncMissingJobViews();
    if (typeof cvProfileApi.updateUserInfoUI === "function") cvProfileApi.updateUserInfoUI();
    if (typeof coreApi.updateStats === "function") coreApi.updateStats();
    if (typeof jobsApi.renderJobs === "function") jobsApi.renderJobs();
    if (typeof jobsApi.renderApplicationHistory === "function") jobsApi.renderApplicationHistory();
    if (typeof jobsApi.renderFavoritesSection === "function") jobsApi.renderFavoritesSection();
    if (typeof cvProfileApi.renderCvList === "function") cvProfileApi.renderCvList();
    if (typeof notificationApi.updateNotificationBadge === "function") notificationApi.updateNotificationBadge();
    if (typeof notificationApi.renderNotifications === "function") notificationApi.renderNotifications();
    if (typeof eventsApi.bindEvents === "function") eventsApi.bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCandidateModule);
  } else {
    initCandidateModule();
  }
})();
