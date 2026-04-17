(function () {
	window.AdminModules = window.AdminModules || {};

	function createBindEvents(deps) {
		return function bindEvents() {
			if (deps.el.filterGroup) {
				deps.el.filterGroup.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-filter]");
					if (!btn) return;

					deps.state.currentFilter = btn.getAttribute("data-filter");
					deps.state.currentPage = 1;

					Array.prototype.slice.call(document.querySelectorAll(".filter-btn")).forEach(function (item) {
						item.classList.remove("active");
					});
					btn.classList.add("active");

					deps.renderPendingTable();
				});
			}

			if (deps.el.pendingTableBody) {
				deps.el.pendingTableBody.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-action]");
					if (!btn) return;

					var action = btn.getAttribute("data-action");
					var id = Number(btn.getAttribute("data-id"));

					if (action === "detail") deps.openJobDetailModal(id);
					else if (action === "approve") deps.approveJob(id, false);
					else if (action === "reject") deps.openRejectModal(id);
					else if (action === "pin") deps.togglePinnedJob(id);
					else if (action === "delete") deps.deletePendingJob(id);
				});
			}

			if (deps.el.userTableBody) {
				deps.el.userTableBody.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-user-action]");
					if (!btn) return;

					var action = btn.getAttribute("data-user-action");
					var id = Number(btn.getAttribute("data-user-id"));

					if (action === "toggle") deps.toggleUserStatus(id);
					if (action === "detail") deps.openUserDetailModal(id);
					if (action === "permission") deps.openPermissionModal(id);
				});
			}

			if (deps.el.companyTableBody) {
				deps.el.companyTableBody.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-company-action]");
					if (!btn) return;

					var action = btn.getAttribute("data-company-action");
					var companyName = btn.getAttribute("data-company") || "";
					if (action === "detail") deps.openCompanyDetailModal(companyName);
					if (action === "toggle") deps.toggleCompanyStatus(companyName);
				});
			}

			if (deps.el.industryList) {
				deps.el.industryList.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-industry-action]");
					if (!btn) return;

					var action = btn.getAttribute("data-industry-action");
					var index = Number(btn.getAttribute("data-index"));
					if (action === "edit") deps.editIndustry(index);
					if (action === "delete") deps.deleteIndustry(index);
				});
			}

			if (deps.el.contactsList) {
				deps.el.contactsList.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-contact-action='view']");
					if (!btn) return;
					deps.openContactModal(Number(btn.getAttribute("data-contact-id")));
				});
			}

			if (deps.el.depositRequestsList) {
				deps.el.depositRequestsList.addEventListener("click", function (event) {
					var btn = event.target.closest("button[data-deposit-action='approve']");
					if (!btn) return;
					var transactionId = Number(btn.getAttribute("data-id"));
					if (transactionId) deps.approveDeposit(transactionId);
				});
			}

			if (deps.el.paymentSearch) {
				deps.el.paymentSearch.addEventListener("input", function (event) {
					deps.state.paymentSearchKeyword = String(event.target.value || "");
					deps.renderDepositRequests();
				});
			}

			if (deps.el.btnPrevPage) {
				deps.el.btnPrevPage.addEventListener("click", function () {
					if (deps.state.currentPage > 1) {
						deps.state.currentPage -= 1;
						deps.renderPendingTable();
					}
				});
			}

			if (deps.el.btnNextPage) {
				deps.el.btnNextPage.addEventListener("click", function () {
					var total = Math.ceil(deps.getFilteredPendingJobs().length / deps.state.pageSize) || 1;
					if (deps.state.currentPage < total) {
						deps.state.currentPage += 1;
						deps.renderPendingTable();
					}
				});
			}

			if (deps.el.globalSearch) {
				deps.el.globalSearch.addEventListener("input", function (event) {
					deps.state.searchKeyword = deps.normalize(event.target.value);
					deps.state.currentPage = 1;
					deps.renderPendingTable();
					deps.renderUsers();
					deps.renderCompanyTable();
				});
			}

			if (deps.el.userStatusFilter) {
				deps.el.userStatusFilter.addEventListener("change", function () {
					deps.state.userStatusFilter = String(deps.el.userStatusFilter.value || "all");
					deps.renderUsers();
					deps.renderCompanyTable();
				});
			}

			if (deps.el.userRoleFilter) {
				deps.el.userRoleFilter.addEventListener("change", function () {
					deps.state.userRoleFilter = String(deps.el.userRoleFilter.value || "all");
					deps.renderUsers();
					deps.renderCompanyTable();
				});
			}

			deps.el.userScopeButtons.forEach(function (btn) {
				btn.addEventListener("click", function () {
					deps.state.userScope = String(btn.getAttribute("data-scope") || "all");
					deps.el.userScopeButtons.forEach(function (item) { item.classList.toggle("active", item === btn); });
					deps.renderUsers();
					deps.renderCompanyTable();
				});
			});

			if (deps.el.statsRange) {
				deps.el.statsRange.addEventListener("change", function () {
					deps.state.statsRange = String(deps.el.statsRange.value || "7d");
					deps.renderGrowthChart();
				});
			}

			if (deps.el.btnAddIndustry) deps.el.btnAddIndustry.addEventListener("click", deps.addIndustry);

			if (deps.el.industryInput) {
				deps.el.industryInput.addEventListener("keydown", function (event) {
					if (event.key === "Enter") {
						event.preventDefault();
						deps.addIndustry();
					}
				});
			}

			if (deps.el.btnExport) deps.el.btnExport.addEventListener("click", deps.exportReport);
			if (deps.el.btnBell) deps.el.btnBell.addEventListener("click", function () {
				var unresolved = deps.state.contacts.filter(function (item) { return item.status !== "done"; }).length;
				deps.toast("Ban co " + unresolved + " lien he can xu ly.", "warn");
			});

			if (deps.el.btnLogout) deps.el.btnLogout.addEventListener("click", deps.logoutAdmin);

			if (deps.el.btnCloseRejectModal) deps.el.btnCloseRejectModal.addEventListener("click", deps.closeRejectModal);
			if (deps.el.btnCancelReject) deps.el.btnCancelReject.addEventListener("click", deps.closeRejectModal);
			if (deps.el.btnConfirmReject) deps.el.btnConfirmReject.addEventListener("click", deps.rejectJob);

			if (deps.el.btnCloseJobDetailModal) deps.el.btnCloseJobDetailModal.addEventListener("click", deps.closeJobDetailModal);
			if (deps.el.btnCloseJobDetail) deps.el.btnCloseJobDetail.addEventListener("click", deps.closeJobDetailModal);
			if (deps.el.btnApproveFromDetail) {
				deps.el.btnApproveFromDetail.addEventListener("click", function () {
					if (deps.state.detailTargetId) deps.approveJob(deps.state.detailTargetId, true);
				});
			}

			if (deps.el.btnClosePermissionModal) deps.el.btnClosePermissionModal.addEventListener("click", deps.closePermissionModal);
			if (deps.el.btnCancelPermission) deps.el.btnCancelPermission.addEventListener("click", deps.closePermissionModal);
			if (deps.el.btnSavePermission) deps.el.btnSavePermission.addEventListener("click", deps.savePermissions);

			if (deps.el.btnCloseContactModal) deps.el.btnCloseContactModal.addEventListener("click", deps.closeContactModal);
			if (deps.el.btnCloseContact) deps.el.btnCloseContact.addEventListener("click", deps.closeContactModal);
			if (deps.el.btnForwardContact) deps.el.btnForwardContact.addEventListener("click", deps.forwardContact);
			if (deps.el.btnReplyContact) deps.el.btnReplyContact.addEventListener("click", deps.replyContact);
			if (deps.el.btnMarkContactDone) deps.el.btnMarkContactDone.addEventListener("click", deps.markContactDone);

			if (deps.el.btnSaveSystemSettings) deps.el.btnSaveSystemSettings.addEventListener("click", deps.saveSystemSettings);

			if (deps.el.btnCloseUserDetailModal) deps.el.btnCloseUserDetailModal.addEventListener("click", deps.closeUserDetailModal);
			if (deps.el.btnCloseUserDetail) deps.el.btnCloseUserDetail.addEventListener("click", deps.closeUserDetailModal);
			if (deps.el.btnToggleFromDetail) {
				deps.el.btnToggleFromDetail.addEventListener("click", function () {
					if (!deps.state.userDetailTargetId) return;
					deps.toggleUserStatus(deps.state.userDetailTargetId);
					deps.closeUserDetailModal();
				});
			}

			if (deps.el.btnCloseCompanyDetailModal) deps.el.btnCloseCompanyDetailModal.addEventListener("click", deps.closeCompanyDetailModal);
			if (deps.el.btnCloseCompanyDetail) deps.el.btnCloseCompanyDetail.addEventListener("click", deps.closeCompanyDetailModal);
			if (deps.el.btnToggleCompanyStatus) {
				deps.el.btnToggleCompanyStatus.addEventListener("click", function () {
					if (!deps.state.companyTargetName) return;
					deps.toggleCompanyStatus(deps.state.companyTargetName);
				});
			}

			deps.el.menuLinks.forEach(function (link) {
				link.addEventListener("click", function (event) {
					event.preventDefault();
					deps.setActiveView(link.getAttribute("data-view") || "overview");
				});
			});

			[
				{ backdrop: deps.el.rejectModalBackdrop, close: deps.closeRejectModal },
				{ backdrop: deps.el.jobDetailModalBackdrop, close: deps.closeJobDetailModal },
				{ backdrop: deps.el.permissionModalBackdrop, close: deps.closePermissionModal },
				{ backdrop: deps.el.contactModalBackdrop, close: deps.closeContactModal },
				{ backdrop: deps.el.userDetailModalBackdrop, close: deps.closeUserDetailModal },
				{ backdrop: deps.el.companyDetailModalBackdrop, close: deps.closeCompanyDetailModal }
			].forEach(function (item) {
				if (!item.backdrop) return;
				item.backdrop.addEventListener("click", function (event) {
					if (event.target === item.backdrop) item.close();
				});
			});
		};
	}

	window.AdminModules.events = {
		createBindEvents: createBindEvents
	};
})();
