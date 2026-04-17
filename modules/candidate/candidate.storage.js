(function () {
  window.CandidateModules = window.CandidateModules || {};

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readCollection(sharedKey, legacyKey) {
    var shared = readJson(sharedKey, []);
    var legacy = readJson(legacyKey, []);

    if (Array.isArray(shared) && shared.length) {
      if (Array.isArray(legacy) && legacy.length !== shared.length) {
        writeJson(legacyKey, shared);
      }
      return shared;
    }

    if (Array.isArray(legacy) && legacy.length) {
      writeJson(sharedKey, legacy);
      return legacy;
    }

    return [];
  }

  function writeCollection(sharedKey, legacyKey, value) {
    writeJson(sharedKey, value);
    writeJson(legacyKey, value);
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCurrentUser() {
    try {
      var sessionUser = sessionStorage.getItem("currentUser");
      if (sessionUser) {
        return JSON.parse(sessionUser);
      }
      var localUser = localStorage.getItem("currentUser");
      return localUser ? JSON.parse(localUser) : null;
    } catch (e) {
      return null;
    }
  }

  function getStoredUsers() {
    var users = readJson("users", []);
    return Array.isArray(users) ? users : [];
  }

  function getJobCollection() {
    return readCollection("JOBS_DATA", "jobs");
  }

  function getApplicationCollection() {
    return readCollection("APPLICATIONS_DATA", "applications");
  }

  function buildAvatarFromName(name) {
    var value = String(name || "").trim();
    return value ? value.slice(0, 2).toUpperCase() : "NA";
  }

  window.CandidateModules.Storage = {
    readJson: readJson,
    writeJson: writeJson,
    readCollection: readCollection,
    writeCollection: writeCollection,
    normalize: normalize,
    escapeHtml: escapeHtml,
    getCurrentUser: getCurrentUser,
    getStoredUsers: getStoredUsers,
    getJobCollection: getJobCollection,
    getApplicationCollection: getApplicationCollection,
    buildAvatarFromName: buildAvatarFromName
  };
})();
