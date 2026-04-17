(function () {
  window.CandidateModules = window.CandidateModules || {};

  function createCoreApi(deps) {
    function formatDateTime(value) {
      if (!value) {
        return "Khong ro thoi gian";
      }
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "Khong ro thoi gian";
      }
      return date.toLocaleString("vi-VN");
    }

    function getStoredUserRecord() {
      if (!deps.state.user) {
        return null;
      }

      return deps.state.users.find(function (item) {
        return Number(item.id) === Number(deps.state.user.id) && deps.normalize(item.role) === deps.normalize(deps.state.user.role);
      }) || null;
    }

    function persistLoggedInUser(updatedUser) {
      deps.state.user = updatedUser;
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }

    function getUserApplications() {
      if (!deps.state.user) {
        return [];
      }
      return deps.state.applications.filter(function (a) {
        return Number(a.candidateId) === Number(deps.state.user.id);
      });
    }

    function getSavedForUser() {
      if (!deps.state.user) {
        return [];
      }
      return deps.state.savedJobs.filter(function (item) {
        return Number(item.userId) === Number(deps.state.user.id);
      });
    }

    function updateStats() {
      var userApplications = getUserApplications();
      var userSaved = getSavedForUser();
      var interviewByStatus = userApplications.filter(function (app) {
        var st = deps.normalize(app.status);
        return st.indexOf("phong van") >= 0 || st.indexOf("interview") >= 0;
      }).length;

      var appIds = userApplications.map(function (app) { return Number(app.id); });
      var interviewBySchedule = deps.state.interviews.filter(function (itv) {
        return appIds.indexOf(Number(itv.applicationId)) >= 0;
      }).length;

      var interviewCount = Math.max(interviewByStatus, interviewBySchedule);

      if (deps.el.appliedCountEl) {
        deps.el.appliedCountEl.textContent = String(userApplications.length);
      }
      if (deps.el.savedCountEl) {
        deps.el.savedCountEl.textContent = String(userSaved.length);
      }
      if (deps.el.interviewCountEl) {
        deps.el.interviewCountEl.textContent = String(interviewCount);
      }
    }

    function loadState() {
      deps.state.users = deps.getStoredUsers();
      deps.state.jobs = deps.getJobCollection();
      deps.state.applications = deps.getApplicationCollection();
      deps.state.interviews = deps.readJson("interviews", []);
      deps.state.savedJobs = deps.readJson("savedJobs", []);
      deps.state.cvs = deps.readJson("candidateCVs", []);
      deps.state.user = deps.getCurrentUser();

      if (!deps.state.user || deps.state.user.role !== "candidate") {
        deps.state.user = deps.readJson("currentUser", null);
      }
    }

    return {
      loadState: loadState,
      updateStats: updateStats,
      getUserApplications: getUserApplications,
      getSavedForUser: getSavedForUser,
      getStoredUserRecord: getStoredUserRecord,
      persistLoggedInUser: persistLoggedInUser,
      formatDateTime: formatDateTime
    };
  }

  window.CandidateModules.Core = {
    createCoreApi: createCoreApi
  };
})();
