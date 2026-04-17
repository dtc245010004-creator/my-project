(function () {
	window.AdminModules = window.AdminModules || {};

	function createGetFilteredUsers(deps) {
		return function getFilteredUsers() {
			return deps.state.users.filter(function (user) {
				var key = deps.state.searchKeyword;
				var bySearch = !key ||
					deps.normalize(user.name).includes(key) ||
					deps.normalize(user.email).includes(key) ||
					deps.normalize(user.company).includes(key) ||
					deps.normalize(user.role).includes(key);

				var byStatus = deps.state.userStatusFilter === "all" || deps.normalize(user.status) === deps.state.userStatusFilter;
				var byRole = deps.state.userRoleFilter === "all" || deps.normalize(user.role) === deps.state.userRoleFilter;
				var byScope = deps.state.userScope === "all" || deps.normalize(user.role) === deps.state.userScope;

				return bySearch && byStatus && byRole && byScope;
			});
		};
	}

	function createGetCompanyRecords(deps) {
		return function getCompanyRecords() {
			var map = {};

			deps.state.users.forEach(function (user) {
				var companyName = String(user.company || "").trim();
				if (!companyName || companyName === "-") return;
				if (deps.normalize(user.role) !== "company" && deps.normalize(user.role) !== "recruiter") return;

				if (!map[companyName]) {
					map[companyName] = { name: companyName, email: "", recruiterCount: 0, jobCount: 0, pendingCount: 0, violationCount: 0, status: "active" };
				}

				if (deps.normalize(user.role) === "company" && user.email) map[companyName].email = user.email;
				if (deps.normalize(user.role) === "recruiter") map[companyName].recruiterCount += 1;
				if (deps.normalize(user.status) === "locked") map[companyName].status = "locked";
			});

			deps.state.pendingJobs.forEach(function (job) {
				var companyName = String(job.company || "").trim();
				if (!companyName || !map[companyName]) return;
				map[companyName].jobCount += 1;
				if (deps.normalize(job.status) === "pending") map[companyName].pendingCount += 1;
				if (deps.normalize(job.status) === "violation") map[companyName].violationCount += 1;
			});

			return Object.keys(map).map(function (key) { return map[key]; }).sort(function (a, b) { return b.jobCount - a.jobCount; });
		};
	}

	function createRenderCompanyTable(deps) {
		return function renderCompanyTable() {
			if (!deps.el.companyTableBody) return;

			var key = deps.state.searchKeyword;
			var companies = deps.getCompanyRecords().filter(function (company) {
				if (!key) return true;
				return deps.normalize(company.name).includes(key) || deps.normalize(company.email).includes(key);
			});

			if (!companies.length) {
				deps.el.companyTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không tìm thấy công ty.</td></tr>";
				return;
			}

			deps.el.companyTableBody.innerHTML = companies.map(function (company) {
				var isActive = deps.normalize(company.status) === "active";
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
		};
	}

	function createOpenCompanyDetailModal(deps) {
		return function openCompanyDetailModal(companyName) {
			var name = String(companyName || "").trim();
			if (!name || !deps.el.companyDetailModalBackdrop || !deps.el.companyDetailBody) return;

			var company = deps.getCompanyRecords().find(function (item) { return item.name === name; });
			if (!company) return;

			deps.state.companyTargetName = name;
			deps.el.companyDetailBody.innerHTML =
				"<div><label>Tên công ty</label><input type='text' readonly value='" + company.name + "'></div>" +
				"<div><label>Email liên hệ</label><input type='text' readonly value='" + (company.email || "Đang cập nhật") + "'></div>" +
				"<div><label>Số nhà tuyển dụng</label><input type='text' readonly value='" + company.recruiterCount + "'></div>" +
				"<div><label>Tổng tin đăng</label><input type='text' readonly value='" + company.jobCount + "'></div>" +
				"<div><label>Tin chờ duyệt</label><input type='text' readonly value='" + company.pendingCount + "'></div>" +
				"<div><label>Tin vi phạm</label><input type='text' readonly value='" + company.violationCount + "'></div>";

			if (deps.el.btnToggleCompanyStatus) {
				deps.el.btnToggleCompanyStatus.textContent = deps.normalize(company.status) === "active" ? "Khóa công ty" : "Mở công ty";
			}

			deps.el.companyDetailModalBackdrop.style.display = "flex";
		};
	}

	function createCloseCompanyDetailModal(deps) {
		return function closeCompanyDetailModal() {
			deps.state.companyTargetName = null;
			if (deps.el.companyDetailModalBackdrop) deps.el.companyDetailModalBackdrop.style.display = "none";
		};
	}

	function createToggleCompanyStatus(deps) {
		return function toggleCompanyStatus(companyName) {
			var name = String(companyName || "").trim();
			if (!name) return;

			var company = deps.getCompanyRecords().find(function (item) { return item.name === name; });
			if (!company) return;

			if (deps.normalize(company.status) === "active") {
				var reason = window.prompt("Nhập lý do khóa công ty:", "Vi phạm chính sách tuyển dụng") || "";
				reason = String(reason).trim();
				if (!reason) {
					deps.toast("Cần nhập lý do khóa công ty.", "warn");
					return;
				}

				deps.state.users = deps.state.users.map(function (user) {
					if (String(user.company || "").trim() !== name) return user;
					if (deps.normalize(user.role) !== "company" && deps.normalize(user.role) !== "recruiter") return user;
					return Object.assign({}, user, { status: "locked", lockReason: reason });
				});

				deps.addLog("Khóa công ty " + name + " - Lý do: " + reason, { module: "users" });
				deps.toast("Đã khóa công ty " + name + ".", "warn");
			} else {
				if (!window.confirm("Xác nhận mở khóa công ty " + name + "?")) return;

				deps.state.users = deps.state.users.map(function (user) {
					if (String(user.company || "").trim() !== name) return user;
					if (deps.normalize(user.role) !== "company" && deps.normalize(user.role) !== "recruiter") return user;
					return Object.assign({}, user, { status: "active", lockReason: "" });
				});

				deps.addLog("Mở khóa công ty " + name + " và gửi thông báo.", { module: "users" });
				deps.toast("Đã mở khóa công ty " + name + ".", "success");
			}

			deps.persistAll();
			deps.syncUsersToAuthStore();
			deps.renderUsers();
			deps.renderCompanyTable();
			deps.renderKpis();
			if (deps.state.companyTargetName === name) deps.openCompanyDetailModal(name);
		};
	}

	function createRenderUsers(deps) {
		return function renderUsers() {
			if (!deps.el.userTableBody) return;
			var filteredUsers = deps.getFilteredUsers();
			if (!filteredUsers.length) {
				deps.el.userTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không tìm thấy người dùng.</td></tr>";
				return;
			}

			deps.el.userTableBody.innerHTML = filteredUsers.map(function (user) {
				var isActive = user.status === "active";
				var toggleText = isActive ? "Khóa" : "Mở khóa";
				return (
					"<tr>" +
						"<td>" + user.name + "<div class='contact-sub'>" + (user.company || "-") + "</div></td>" +
						"<td>" + (user.email || "-") + "</td>" +
						"<td>" + user.role + "</td>" +
						"<td>" + deps.formatDate(user.joinedAt) + "</td>" +
						"<td><span class='badge " + (isActive ? "active" : "locked") + "'>" + (isActive ? "Hoạt động" : "Bị khóa") + "</span></td>" +
						"<td><div class='row-actions'>" +
							"<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='detail'>Xem hồ sơ</button>" +
							"<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='permission'>Phân quyền</button>" +
							"<button class='btn-xs' data-user-id='" + user.id + "' data-user-action='toggle'>" + toggleText + "</button>" +
						"</div></td>" +
					"</tr>"
				);
			}).join("");
		};
	}

	function createToggleUserStatus(deps) {
		return function toggleUserStatus(userId) {
			var target = deps.state.users.find(function (u) { return Number(u.id) === Number(userId); });
			if (!target) return;

			if (target.status === "active") {
				var reason = window.prompt("Nhập lý do khóa tài khoản:", "Vi phạm chính sách") || "";
				reason = String(reason).trim();
				if (!reason) {
					deps.toast("Cần nhập lý do khóa tài khoản.", "warn");
					return;
				}

				deps.state.users = deps.state.users.map(function (u) {
					if (Number(u.id) !== Number(userId)) return u;
					return Object.assign({}, u, { status: "locked", lockReason: reason });
				});

				deps.toast("Đã khóa tài khoản " + target.name + ".", "warn");
				deps.addLog("Khóa tài khoản " + target.name + " - Lý do: " + reason, { module: "users" });
			} else {
				if (!window.confirm("Xác nhận mở khóa tài khoản " + target.name + "?")) return;

				deps.state.users = deps.state.users.map(function (u) {
					if (Number(u.id) !== Number(userId)) return u;
					return Object.assign({}, u, { status: "active", lockReason: "" });
				});

				deps.toast("Đã mở khóa tài khoản " + target.name + ".", "success");
				deps.addLog("Mở khóa tài khoản " + target.name + " và gửi email thông báo.", { module: "users" });
			}

			deps.persistAll();
			deps.syncUsersToAuthStore();
			deps.renderUsers();
			deps.renderCompanyTable();
			deps.renderKpis();
			if (deps.state.permissionTargetId && Number(deps.state.permissionTargetId) === Number(userId)) deps.closePermissionModal();
			if (deps.state.contactTargetId && Number(deps.state.contactTargetId) === Number(userId)) deps.closeContactModal();
		};
	}

	function createOpenUserDetailModal(deps) {
		return function openUserDetailModal(userId) {
			var target = deps.state.users.find(function (item) { return Number(item.id) === Number(userId); });
			if (!target || !deps.el.userDetailModalBackdrop || !deps.el.userDetailBody) return;

			deps.state.userDetailTargetId = target.id;
			deps.el.userDetailBody.innerHTML =
				"<div><label>Họ tên</label><input type='text' readonly value='" + target.name + "'></div>" +
				"<div><label>Email</label><input type='text' readonly value='" + (target.email || "-") + "'></div>" +
				"<div><label>Vai trò</label><input type='text' readonly value='" + target.role + "'></div>" +
				"<div><label>Công ty</label><input type='text' readonly value='" + (target.company || "-") + "'></div>" +
				"<div><label>Ngày tham gia</label><input type='text' readonly value='" + deps.formatDate(target.joinedAt) + "'></div>" +
				"<div><label>Trạng thái</label><input type='text' readonly value='" + (target.status === "active" ? "Hoạt động" : "Bị khóa") + "'></div>" +
				"<div><label>Quyền hiện tại</label><textarea readonly>" + (Array.isArray(target.permissions) ? target.permissions.join(", ") : "-") + "</textarea></div>";

			if (deps.el.btnToggleFromDetail) deps.el.btnToggleFromDetail.textContent = target.status === "active" ? "Khóa tài khoản" : "Mở tài khoản";
			deps.el.userDetailModalBackdrop.style.display = "flex";
		};
	}

	function createCloseUserDetailModal(deps) {
		return function closeUserDetailModal() {
			deps.state.userDetailTargetId = null;
			if (deps.el.userDetailModalBackdrop) deps.el.userDetailModalBackdrop.style.display = "none";
		};
	}

	function createOpenPermissionModal(deps) {
		return function openPermissionModal(userId) {
			var target = deps.state.users.find(function (u) { return Number(u.id) === Number(userId); });
			if (!target || !deps.el.permissionModalBackdrop || !deps.el.permissionModalBody) return;

			deps.state.permissionTargetId = target.id;
			var userPermissions = Array.isArray(target.permissions) ? target.permissions : [];
			deps.el.permissionModalBody.innerHTML =
				"<div><label>Tài khoản</label><input type='text' readonly value='" + target.name + " - " + target.role + "'></div>" +
				"<div style='display:grid;gap:8px;'>" + deps.permissions.map(function (item) {
					var checked = userPermissions.indexOf(item.key) >= 0 ? "checked" : "";
					return "<label style='display:flex;align-items:center;gap:8px;'><input type='checkbox' data-permission-key='" + item.key + "' " + checked + "><span>" + item.label + "</span></label>";
				}).join("") + "</div>";
			deps.el.permissionModalBackdrop.style.display = "flex";
		};
	}

	function createClosePermissionModal(deps) {
		return function closePermissionModal() {
			deps.state.permissionTargetId = null;
			if (deps.el.permissionModalBackdrop) deps.el.permissionModalBackdrop.style.display = "none";
		};
	}

	function createSavePermissions(deps) {
		return function savePermissions() {
			if (!deps.state.permissionTargetId || !deps.el.permissionModalBody) return;

			var checkedNodes = Array.prototype.slice.call(deps.el.permissionModalBody.querySelectorAll("input[data-permission-key]:checked"));
			var permissions = checkedNodes.map(function (node) { return node.getAttribute("data-permission-key"); });

			deps.state.users = deps.state.users.map(function (u) {
				if (Number(u.id) !== Number(deps.state.permissionTargetId)) return u;
				return Object.assign({}, u, { permissions: permissions });
			});

			deps.persistAll();
			deps.syncUsersToAuthStore();
			deps.closePermissionModal();
			deps.renderUsers();
			deps.renderCompanyTable();
			deps.toast("Đã lưu phân quyền người dùng.", "success");
			deps.addLog("Cập nhật phân quyền tài khoản ID " + deps.state.permissionTargetId, { module: "users" });
		};
	}

	function createRenderIndustries(deps) {
		return function renderIndustries() {
			if (!deps.el.industryList) return;
			deps.el.industryList.innerHTML = deps.state.industries.map(function (name, idx) {
				return "<li><div style='display:flex;justify-content:space-between;gap:8px;align-items:center;'><span>" + (idx + 1) + ". " + name + "</span><span class='row-actions'><button class='btn-xs' data-industry-action='edit' data-index='" + idx + "'>Sửa</button><button class='btn-xs btn-reject' data-industry-action='delete' data-index='" + idx + "'>Xóa</button></span></div></li>";
			}).join("");
		};
	}

	function createAddIndustry(deps) {
		return function addIndustry() {
			if (!deps.el.industryInput) return;
			var value = String(deps.el.industryInput.value || "").trim();
			if (!value) {
				deps.toast("Vui lòng nhập tên ngành nghề.", "warn");
				return;
			}

			var normalizedValue = deps.normalize(value);
			var existed = deps.state.industries.some(function (item) { return deps.normalize(item) === normalizedValue; });
			if (existed) {
				deps.toast("Tên ngành nghề đã tồn tại.", "warn");
				return;
			}

			deps.state.industries.unshift(value);
			deps.el.industryInput.value = "";
			deps.persistAll();
			deps.renderIndustries();
			deps.toast("Đã thêm ngành nghề mới.", "success");
			deps.addLog("Thêm ngành nghề: " + value, { module: "industries" });
		};
	}

	function createEditIndustry(deps) {
		return function editIndustry(index) {
			var i = Number(index);
			if (!Number.isInteger(i) || i < 0 || i >= deps.state.industries.length) return;

			var oldValue = deps.state.industries[i];
			var nextValue = window.prompt("Sửa tên ngành nghề:", oldValue) || "";
			nextValue = String(nextValue).trim();
			if (!nextValue) {
				deps.toast("Tên ngành nghề không được để trống.", "warn");
				return;
			}

			var normalizedValue = deps.normalize(nextValue);
			var duplicated = deps.state.industries.some(function (item, idx) { return idx !== i && deps.normalize(item) === normalizedValue; });
			if (duplicated) {
				deps.toast("Tên ngành nghề bị trùng lặp.", "warn");
				return;
			}

			deps.state.industries[i] = nextValue;
			deps.persistAll();
			deps.renderIndustries();
			deps.toast("Đã cập nhật ngành nghề.", "success");
			deps.addLog("Sửa ngành nghề: " + oldValue + " -> " + nextValue, { module: "industries" });
		};
	}

	function createDeleteIndustry(deps) {
		return function deleteIndustry(index) {
			var i = Number(index);
			if (!Number.isInteger(i) || i < 0 || i >= deps.state.industries.length) return;

			var target = deps.state.industries[i];
			if (!window.confirm("Xác nhận xóa ngành nghề: " + target + "?")) return;

			deps.state.industries.splice(i, 1);
			deps.persistAll();
			deps.renderIndustries();
			deps.toast("Đã xóa ngành nghề.", "success");
			deps.addLog("Xóa ngành nghề: " + target, { module: "industries" });
		};
	}

	function createRenderPolicies(deps) {
		return function renderPolicies() {
			if (!deps.el.policiesList) return;
			deps.el.policiesList.innerHTML = deps.policies.map(function (item) {
				return "<div class='policy-card'><h3>" + item.title + "</h3><p>" + item.content + "</p></div>";
			}).join("");
		};
	}

	window.AdminModules.users = {
		createGetFilteredUsers: createGetFilteredUsers,
		createGetCompanyRecords: createGetCompanyRecords,
		createRenderCompanyTable: createRenderCompanyTable,
		createOpenCompanyDetailModal: createOpenCompanyDetailModal,
		createCloseCompanyDetailModal: createCloseCompanyDetailModal,
		createToggleCompanyStatus: createToggleCompanyStatus,
		createRenderUsers: createRenderUsers,
		createToggleUserStatus: createToggleUserStatus,
		createOpenUserDetailModal: createOpenUserDetailModal,
		createCloseUserDetailModal: createCloseUserDetailModal,
		createOpenPermissionModal: createOpenPermissionModal,
		createClosePermissionModal: createClosePermissionModal,
		createSavePermissions: createSavePermissions,
		createRenderIndustries: createRenderIndustries,
		createAddIndustry: createAddIndustry,
		createEditIndustry: createEditIndustry,
		createDeleteIndustry: createDeleteIndustry,
		createRenderPolicies: createRenderPolicies
	};
})();
