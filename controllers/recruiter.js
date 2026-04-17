(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  var coreModule = window.RecruiterModules.Core;
  var dashboardModule = window.RecruiterModules.Dashboard;
  var profileModule = window.RecruiterModules.Profile;
  var walletModule = window.RecruiterModules.Wallet;
  var eventsModule = window.RecruiterModules.Events;

  if (!coreModule || !dashboardModule || !profileModule || !walletModule || !eventsModule) {
    console.error('Recruiter modules are missing. Ensure recruiter module scripts are loaded before controllers/recruiter.js.');
    return;
  }

  var coreApi = coreModule.createRecruiterCoreApi();
  var deps = Object.assign({}, coreApi);

  var dashboardApi = dashboardModule.createRecruiterDashboardApi(deps);
  Object.assign(deps, dashboardApi);

  var profileApi = profileModule.createRecruiterProfileApi(deps);
  Object.assign(deps, profileApi);

  var walletApi = walletModule.createRecruiterWalletApi(deps);
  Object.assign(deps, walletApi);

  var eventsApi = eventsModule.createRecruiterEventsApi(deps);
  Object.assign(deps, eventsApi);

  window.RecruiterModule = deps;

  function initRecruiterModule() {
    eventsApi.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecruiterModule);
  } else {
    initRecruiterModule();
  }
})();