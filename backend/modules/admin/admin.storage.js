(function () {
  window.AdminModules = window.AdminModules || {};

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function createPersistAll(deps) {
    return function persistAll() {
      deps.writeJson(deps.STORAGE.PENDING_JOBS, deps.state.pendingJobs);
      deps.writeJson(deps.STORAGE.USERS, deps.state.users);
      deps.writeJson(deps.STORAGE.INDUSTRIES, deps.state.industries);
      deps.writeJson(deps.STORAGE.CONTACTS, deps.state.contacts);
      deps.writeJson(deps.STORAGE.SYSTEM_SETTINGS, deps.state.systemSettings);
      deps.writeJson(deps.STORAGE.ACTIVITY_LOGS, deps.state.activityLogs);
    };
  }

  function createSyncUsersToAuthStore(deps) {
    return function syncUsersToAuthStore() {
      deps.writeJson("users", deps.state.users);
    };
  }

  function createSyncSharedJobs(deps) {
    return function syncSharedJobs(removedJobId) {
      var jobKeys = ["JOBS_DATA", "jobs", "jobPosts"];
      var applicationKeys = ["APPLICATIONS_DATA", "applications"];

      jobKeys.forEach(function (key) {
        var jobs = deps.readJson(key, []);
        if (!Array.isArray(jobs) || !jobs.length) return;

        var nextJobs = jobs.filter(function (job) {
          return Number(job.id) !== Number(removedJobId);
        });

        localStorage.setItem(key, JSON.stringify(nextJobs));
      });

      applicationKeys.forEach(function (key) {
        var applications = deps.readJson(key, []);
        if (!Array.isArray(applications) || !applications.length) return;

        var nextApplications = applications.filter(function (item) {
          return Number(item.jobId) !== Number(removedJobId);
        });

        localStorage.setItem(key, JSON.stringify(nextApplications));
      });
    };
  }

  function createPatchSharedJob(deps) {
    return function patchSharedJob(jobId, fields) {
      var jobKeys = ["JOBS_DATA", "jobs", "jobPosts"];
      jobKeys.forEach(function (key) {
        var jobs = deps.readJson(key, []);
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
    };
  }

  window.AdminModules.storage = {
    readJson: readJson,
    writeJson: writeJson,
    normalize: normalize,
    createPersistAll: createPersistAll,
    createSyncUsersToAuthStore: createSyncUsersToAuthStore,
    createSyncSharedJobs: createSyncSharedJobs,
    createPatchSharedJob: createPatchSharedJob
  };
})();
