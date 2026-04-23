(function () {
	window.AdminModules = window.AdminModules || {};

	function createSetActiveView(deps) {
		return function setActiveView(view) {
			deps.el.menuLinks.forEach(function (link) {
				link.classList.toggle("active", link.getAttribute("data-view") === view);
			});

			if (deps.el.headerSection) deps.el.headerSection.style.display = "grid";
			if (deps.el.kpiSection) deps.el.kpiSection.style.display = view === "overview" ? "grid" : "none";

			if (deps.el.approvalSection) deps.el.approvalSection.style.display = (view === "approval" || view === "overview" || view === "users" || view === "industries") ? "block" : "none";
			if (deps.el.approvalTitle) deps.el.approvalTitle.style.display = view === "approval" ? "block" : "none";
			if (deps.el.approvalPanel) deps.el.approvalPanel.style.display = view === "approval" ? "block" : "none";

			if (deps.el.overviewGrid) {
				deps.el.overviewGrid.style.display = (view === "overview" || view === "users") ? "grid" : "none";
				deps.el.overviewGrid.style.gridTemplateColumns = view === "users" ? "1fr" : "1.2fr 1fr";
			}
			if (deps.el.growthPanel) deps.el.growthPanel.style.display = view === "overview" ? "block" : "none";
			if (deps.el.usersPanel) deps.el.usersPanel.style.display = view === "users" ? "block" : "none";

			var isSystemView = view === "industries" || view === "logs";
			if (deps.el.systemGrid) {
				deps.el.systemGrid.style.display = isSystemView ? "grid" : "none";
				deps.el.systemGrid.style.gridTemplateColumns = view === "logs" ? "1fr" : "1.2fr 1fr";
			}
			if (deps.el.industryPanel) deps.el.industryPanel.style.display = view === "industries" ? "block" : "none";
			if (deps.el.logPanel) deps.el.logPanel.style.display = isSystemView ? "block" : "none";

			if (deps.el.paymentsPanel) deps.el.paymentsPanel.style.display = view === "payments" ? "block" : "none";
			if (deps.el.settingsPanel) deps.el.settingsPanel.style.display = view === "settings" ? "block" : "none";
			if (deps.el.policiesPanel) deps.el.policiesPanel.style.display = view === "policies" ? "block" : "none";
			if (deps.el.contactsPanel) deps.el.contactsPanel.style.display = view === "contacts" ? "block" : "none";
		};
	}

	function createRenderApprovalStatusChart(deps) {
		return function renderApprovalStatusChart() {
			if (!deps.el.approvalStatusChart) return;

			var total = Math.max(1, deps.state.pendingJobs.length);
			var pending = deps.state.pendingJobs.filter(function (item) { return deps.normalize(item.status) === "pending"; }).length;
			var approved = deps.state.pendingJobs.filter(function (item) { return deps.normalize(item.status) === "approved"; }).length;
			var violation = deps.state.pendingJobs.filter(function (item) { return deps.normalize(item.status) === "violation"; }).length;

			var rows = [
				{ name: "Chờ duyệt", value: pending, color: "#2563eb" },
				{ name: "Đã duyệt", value: approved, color: "#16a34a" },
				{ name: "Vi phạm", value: violation, color: "#dc2626" }
			];

			deps.el.approvalStatusChart.innerHTML = rows.map(function (item) {
				var width = Math.round((item.value / total) * 100);
				return (
					"<div class='status-row'>" +
						"<span>" + item.name + "</span>" +
						"<div class='status-track'><div class='status-fill' style='width:" + width + "%; background:" + item.color + ";'></div></div>" +
						"<strong>" + item.value + "</strong>" +
					"</div>"
				);
			}).join("");
		};
	}

	function createRenderKpis(deps) {
		return function renderKpis() {
			var totalUsers = deps.state.users.length;
			var pendingCount = deps.state.pendingJobs.filter(function (j) { return j.status === "pending"; }).length;
			var violationCount = deps.state.pendingJobs.filter(function (j) { return j.status === "violation"; }).length;
			var newPosts = deps.state.pendingJobs.length;
			var revenue = (Array.isArray(deps.state.allTransactions) ? deps.state.allTransactions : []).reduce(function (sum, item) {
				var status = deps.normalize(item.status || "success");
				var type = deps.normalize(item.type);
				var direction = deps.normalize(item.direction);
				var isFeeType = type === "post_fee" || type === "apply_commission";
				var isChargeOut = direction === "out";
				if (status !== "success") return sum;
				if (!isFeeType && !isChargeOut) return sum;
				return sum + Number(item.amount || 0);
			}, 0);

			if (deps.el.kpiUsers) deps.el.kpiUsers.textContent = String(totalUsers);
			if (deps.el.kpiRevenuePosts) deps.el.kpiRevenuePosts.textContent = deps.formatCurrency(revenue) + " / " + String(newPosts);
			if (deps.el.kpiPending) deps.el.kpiPending.textContent = String(pendingCount);
			if (deps.el.kpiViolation) deps.el.kpiViolation.textContent = String(violationCount);

			deps.renderApprovalStatusChart();
		};
	}

	function createRenderGrowthChart(deps) {
		return function renderGrowthChart() {
			if (!deps.el.growthBars) return;

			var config = deps.rangeConfig[deps.state.statsRange] || deps.rangeConfig["7d"];
			var labels = config.labels;
			var values = config.values;
			var max = Math.max.apply(null, values);

			deps.el.growthBars.innerHTML = values.map(function (value, idx) {
				var h = Math.max(20, Math.round((value / max) * 130));
				return (
					"<div class='bar-col'>" +
						"<div class='bar' style='height:" + h + "px'></div>" +
						"<div class='bar-label'>" + labels[idx] + "</div>" +
					"</div>"
				);
			}).join("");

			if (deps.el.statsSummary) {
				var total = values.reduce(function (sum, item) { return sum + item; }, 0);
				var peakValue = Math.max.apply(null, values);
				var peakIndex = values.indexOf(peakValue);
				var avg = values.length ? Math.round(total / values.length) : 0;

				deps.el.statsSummary.innerHTML =
					"<div class='summary-item'><div class='label'>Tổng lượt trong kỳ</div><div class='value'>" + total + "</div></div>" +
					"<div class='summary-item'><div class='label'>Giá trị trung bình</div><div class='value'>" + avg + "</div></div>" +
					"<div class='summary-item'><div class='label'>Đỉnh cao</div><div class='value'>" + peakValue + " (" + labels[peakIndex] + ")</div></div>";
			}

			deps.renderApprovalStatusChart();
		};
	}

	function createDownloadFile() {
		return function downloadFile(filename, content, mimeType) {
			var blob = new Blob([content], { type: mimeType });
			var url = URL.createObjectURL(blob);
			var link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		};
	}

	function createExportReport(deps) {
		return function exportReport() {
			if (!deps.el.btnExport) return;
			if (deps.el.btnExport.classList.contains("loading")) return;

			var format = deps.el.exportFormat ? deps.el.exportFormat.value : "excel";

			deps.el.btnExport.classList.add("loading");
			deps.el.btnExport.textContent = "Đang tạo báo cáo...";

			setTimeout(function () {
				var now = new Date();
				var dateText = now.toISOString().slice(0, 10);

				if (format === "excel") {
					var header = "ID,Tên tin,Công ty,Người đăng,Ngày gửi,Trạng thái\n";
					var rows = deps.state.pendingJobs.map(function (job) {
						return [job.id, job.title, job.company, job.owner, job.submittedAt, job.status].join(",");
					}).join("\n");

					deps.downloadFile("admin-report-" + dateText + ".csv", header + rows, "text/csv;charset=utf-8;");
				} else {
					var pdfLike = [
						"BÁO CÁO HỆ THỐNG ADMIN",
						"Ngày xuất: " + deps.formatDateTime(now.toISOString()),
						"Tổng người dùng: " + deps.state.users.length,
						"Tổng tin đăng: " + deps.state.pendingJobs.length,
						"Tin chờ duyệt: " + deps.state.pendingJobs.filter(function (j) { return j.status === "pending"; }).length,
						"Tin vi phạm: " + deps.state.pendingJobs.filter(function (j) { return j.status === "violation"; }).length,
						"",
						"Danh sách tin tiêu biểu:",
						deps.state.pendingJobs.slice(0, 8).map(function (job) {
							return "- [" + job.status + "] " + job.title + " | " + job.company + " | " + job.submittedAt;
						}).join("\n")
					].join("\n");

					deps.downloadFile("admin-report-" + dateText + ".pdf", pdfLike, "application/pdf");
				}

				deps.el.btnExport.classList.remove("loading");
				deps.el.btnExport.textContent = "Xuất file (Excel/PDF)";
				deps.toast("Đã xuất báo cáo thành công.", "success");
				deps.addLog("Xuất báo cáo hệ thống định dạng " + (format === "excel" ? "Excel" : "PDF"), { module: "overview" });
			}, 700);
		};
	}

	window.AdminModules.view = {
		createSetActiveView: createSetActiveView,
		createRenderApprovalStatusChart: createRenderApprovalStatusChart,
		createRenderKpis: createRenderKpis,
		createRenderGrowthChart: createRenderGrowthChart,
		createDownloadFile: createDownloadFile,
		createExportReport: createExportReport
	};
})();
