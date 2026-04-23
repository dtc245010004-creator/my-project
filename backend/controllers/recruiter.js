(function () { // khởi tạo module recruiter bằng cách kết hợp các API từ các module con, đảm bảo tất cả module con đã được tải trước khi khởi tạo
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

  function initRecruiterModule() { // khởi tạo module recruiter khi DOM sẵn sàng
    eventsApi.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecruiterModule);
  } else {
    initRecruiterModule();
  }
})();

(function setupSupportWidget() { // thiết lập widget hỗ trợ trên tất cả các trang, nếu có phần tử tương ứng trong DOM
  var widget = document.getElementById('supportWidget');
  var toggle = document.getElementById('supportToggle');
  if (!widget || !toggle) return;

  toggle.addEventListener('click', function () {
    var nextOpen = !widget.classList.contains('open');
    widget.classList.toggle('open', nextOpen);
    toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
  });

  document.addEventListener('click', function (event) {
    if (!widget.classList.contains('open')) return;
    if (widget.contains(event.target)) return;
    widget.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
