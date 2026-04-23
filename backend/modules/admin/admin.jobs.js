(function () {
	window.AdminModules = window.AdminModules || {};

	function createStatusBadge() {
		return function statusBadge(status) {
			if (status === "pending") return "<span class='badge pending'>Chờ duyệt</span>";
			if (status === "violation") return "<span class='badge violation'>Vi phạm</span>";
			if (status === "approved") return "<span class='badge active'>Đã duyệt</span>";
			return "<span class='badge locked'>Đã khóa</span>";
		};
	}

	function createGetFilteredPendingJobs(deps) {
		return function getFilteredPendingJobs() {
			return deps.state.pendingJobs.filter(function (job) {
				var byFilter = deps.state.currentFilter === "all" ? true : job.status === deps.state.currentFilter;
				var key = deps.state.searchKeyword;
				var bySearch = !key ||
					deps.normalize(job.title).includes(key) ||
					deps.normalize(job.company).includes(key) ||
					deps.normalize(job.owner).includes(key) ||
					deps.normalize(job.location).includes(key);
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
		};
	}

	function createPaginate(deps) {
		return function paginate(items) {
			var totalPages = Math.max(1, Math.ceil(items.length / deps.state.pageSize));
			if (deps.state.currentPage > totalPages) deps.state.currentPage = totalPages;
			var start = (deps.state.currentPage - 1) * deps.state.pageSize;
			var end = start + deps.state.pageSize;
			return { pageItems: items.slice(start, end), totalPages: totalPages, total: items.length };
		};
	}

	function createRenderPendingTable(deps) {
		return function renderPendingTable() {
			if (!deps.el.pendingTableBody) return;
			var filtered = deps.getFilteredPendingJobs();
			var result = deps.paginate(filtered);

			if (!result.pageItems.length) {
				deps.el.pendingTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>Không có dữ liệu phù hợp.</td></tr>";
			} else {
				deps.el.pendingTableBody.innerHTML = result.pageItems.map(function (job) {
					var pinText = job.pinnedByAdmin ? "Bỏ ghim" : "Ghim đầu";
					var pinClass = job.pinnedByAdmin ? "btn-xs" : "btn-xs btn-approve";
					var featuredBadge = job.featured ? " <span class='badge pending'>Noi bat</span>" : "";
					var pinAt = job.pinnedAt ? deps.formatDateTime(job.pinnedAt) : "";
					var isNewPinned = false;
					if (job.pinnedByAdmin && job.pinnedAt) {
						var pinnedTime = new Date(job.pinnedAt).getTime();
						isNewPinned = !Number.isNaN(pinnedTime) && (Date.now() - pinnedTime) <= 24 * 60 * 60 * 1000;
					}
					var pinBadge = job.pinnedByAdmin
						? (isNewPinned ? "<span class='badge active'>Moi ghim</span>" : "<span class='badge locked'>Da ghim</span>")
						: "";
					var pinInfo = job.pinnedByAdmin ? "<div style='font-size:12px;color:#64748b;margin-top:4px;'>Ghim luc: " + pinAt + "</div>" : "";
					return (
						"<tr>" +
							"<td><strong>" + job.title + "</strong>" + featuredBadge + "</td>" +
							"<td>" + job.company + "</td>" +
							"<td>" + job.owner + "</td>" +
							"<td>" + job.submittedAt + "</td>" +
							"<td>" + deps.statusBadge(job.status) + " " + pinBadge + pinInfo + "</td>" +
							"<td><div class='row-actions'>" +
								"<button class='btn-xs' data-action='detail' data-id='" + job.id + "'>📄 Chi tiết</button>" +
								"<button class='btn-xs btn-approve' data-action='approve' data-id='" + job.id + "'>◯ Phê duyệt</button>" +
								"<button class='btn-xs btn-reject' data-action='reject' data-id='" + job.id + "'>⊘ Từ chối</button>" +
								"<button class='" +  pinClass + "' data-action='pin' data-id='" + job.id + "'>📌" + pinText + "</button>" +
								"<button class='btn-xs btn-reject' data-action='delete' data-id='" + job.id + "'>🗑️ Xóa tin</button>" +
							"</div></td>" +
						"</tr>"
					);
				}).join("");
			}

			if (deps.el.pageInfo) deps.el.pageInfo.textContent = "Trang " + deps.state.currentPage + " / " + result.totalPages + " (" + result.total + " ban ghi)";
			if (deps.el.btnPrevPage) deps.el.btnPrevPage.disabled = deps.state.currentPage <= 1;
			if (deps.el.btnNextPage) deps.el.btnNextPage.disabled = deps.state.currentPage >= result.totalPages;
		};
	}

	function createApproveJob(deps) { // cập nhật trạng thái job thành "approved" và gửi thông báo cho recruiter
		return function approveJob(jobId, bypassConfirm) {
			var target = deps.state.pendingJobs.find(function (j) { return Number(j.id) === Number(jobId); });
			if (!target) return;
			if (!bypassConfirm && !window.confirm("Xác nhận phê duyệt job: " + target.title + "?")) return;

			deps.state.pendingJobs = deps.state.pendingJobs.map(function (job) {
				if (Number(job.id) !== Number(jobId)) return job;
				return Object.assign({}, job, { status: "approved" });
			});

			deps.patchSharedJob(jobId, { status: "approved" });
			deps.persistAll();
			deps.renderPendingTable();
			deps.renderKpis();
			deps.closeJobDetailModal();
			deps.toast("Đã phê duyệt tin: " + target.title, "success");
			deps.addLog("Phê duyệt tin " + target.title + " và gửi thông báo cho nhà tuyển dụng.", { module: "approval" });
		};
	}

	function createOpenJobDetailModal(deps) {
		return function openJobDetailModal(jobId) {
			var target = deps.state.pendingJobs.find(function (j) { return Number(j.id) === Number(jobId); });
			if (!target || !deps.el.jobDetailModalBackdrop || !deps.el.jobDetailBody) return;

			deps.state.detailTargetId = target.id;
			deps.el.jobDetailBody.innerHTML =
				"<div><label>Tiêu đề</label><input type='text' readonly value='" + target.title + "'></div>" +
				"<div><label>Công ty</label><input type='text' readonly value='" + target.company + "'></div>" +
				"<div><label>Người đăng</label><input type='text' readonly value='" + target.owner + "'></div>" +
				"<div><label>Lương</label><input type='text' readonly value='" + (target.salary || "Đang cập nhật") + "'></div>" +
				"<div><label>Địa điểm</label><input type='text' readonly value='" + (target.location || "Đang cập nhật") + "'></div>" +
				"<div><label>Mô tả</label><textarea readonly>" + (target.description || "") + "</textarea></div>" +
				"<div><label>Yêu cầu</label><textarea readonly>" + (target.requirements || "") + "</textarea></div>";

			deps.el.jobDetailModalBackdrop.style.display = "flex";
		};
	}

	function createCloseJobDetailModal(deps) {
		return function closeJobDetailModal() {
			deps.state.detailTargetId = null;
			if (deps.el.jobDetailModalBackdrop) deps.el.jobDetailModalBackdrop.style.display = "none";
		};
	}

	function createOpenRejectModal(deps) {
		return function openRejectModal(jobId) {
			deps.state.rejectTargetId = jobId;
			if (deps.el.rejectReason) deps.el.rejectReason.value = "";
			if (deps.el.rejectModalBackdrop) deps.el.rejectModalBackdrop.style.display = "flex";
		};
	}

	function createCloseRejectModal(deps) {
		return function closeRejectModal() {
			if (deps.el.rejectModalBackdrop) deps.el.rejectModalBackdrop.style.display = "none";
			deps.state.rejectTargetId = null;
		};
	}

	function createRejectJob(deps) {
		return function rejectJob() {
			if (!deps.state.rejectTargetId) return;
			var reason = deps.el.rejectReason ? String(deps.el.rejectReason.value || "").trim() : "";
			if (!reason) {
				deps.toast("Vui lòng nhập lý do vi phạm.", "warn");
				return;
			}

			var target = deps.state.pendingJobs.find(function (job) { return Number(job.id) === Number(deps.state.rejectTargetId); });

			deps.state.pendingJobs = deps.state.pendingJobs.map(function (job) {
				if (Number(job.id) !== Number(deps.state.rejectTargetId)) return job;
				return Object.assign({}, job, { status: "violation", reason: reason });
			});

			deps.persistAll();
			deps.closeRejectModal();
			deps.renderPendingTable();
			deps.renderKpis();
			deps.toast("Đã từ chối tin vi phạm.", "error");
			deps.addLog("Từ chối tin " + (target ? target.title : deps.state.rejectTargetId) + " với lý do: " + reason, { module: "approval" });
		};
	}

	function createDeletePendingJob(deps) {
		return function deletePendingJob(jobId) {
			var target = deps.state.pendingJobs.find(function (job) { return Number(job.id) === Number(jobId); });
			if (!target) return;
			if (!window.confirm("Xác nhận xóa tin: " + target.title + "?")) return;

			deps.state.pendingJobs = deps.state.pendingJobs.filter(function (job) { return Number(job.id) !== Number(jobId); });
			deps.syncSharedJobs(jobId);
			deps.persistAll();

			var totalPages = Math.max(1, Math.ceil(deps.getFilteredPendingJobs().length / deps.state.pageSize));
			if (deps.state.currentPage > totalPages) deps.state.currentPage = totalPages;

			deps.renderPendingTable();
			deps.renderKpis();
			deps.toast("Đã xóa tin: " + target.title, "success");
			deps.addLog("Xóa tin " + target.title + " khỏi danh sách kiểm duyệt.", { module: "approval" });
		};
	}

	function createTogglePinnedJob(deps) {
		return function togglePinnedJob(jobId) {
			var target = deps.state.pendingJobs.find(function (job) { return Number(job.id) === Number(jobId); });
			if (!target) return;
			if (!target.featured) {
				deps.toast("Tin chưa bật tính năng nổi bật từ phía recruiter.", "warn");
				return;
			}

			var nextPinned = !target.pinnedByAdmin;
			var pinnedAt = nextPinned ? new Date().toISOString() : null;

			deps.state.pendingJobs = deps.state.pendingJobs.map(function (job) {
				if (Number(job.id) !== Number(jobId)) return job;
				return Object.assign({}, job, { pinnedByAdmin: nextPinned, pinnedAt: pinnedAt });
			});

			deps.patchSharedJob(jobId, { pinnedByAdmin: nextPinned, pinnedAt: pinnedAt });
			deps.persistAll();
			deps.renderPendingTable();
			deps.toast(nextPinned ? "Đã ghim tin lên đầu danh sách." : "Đã bỏ ghim tin.", "success");
			deps.addLog((nextPinned ? "Ghim" : "Bỏ ghim") + " tin " + target.title + " trên màn kiểm duyệt.", { module: "approval" });
		};
	}

	window.AdminModules.jobs = {
		createStatusBadge: createStatusBadge,
		createGetFilteredPendingJobs: createGetFilteredPendingJobs,
		createPaginate: createPaginate,
		createRenderPendingTable: createRenderPendingTable,
		createApproveJob: createApproveJob,
		createOpenJobDetailModal: createOpenJobDetailModal,
		createCloseJobDetailModal: createCloseJobDetailModal,
		createOpenRejectModal: createOpenRejectModal,
		createCloseRejectModal: createCloseRejectModal,
		createRejectJob: createRejectJob,
		createDeletePendingJob: createDeletePendingJob,
		createTogglePinnedJob: createTogglePinnedJob
	};
})();
