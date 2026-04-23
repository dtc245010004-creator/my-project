// Admin payments module
(function () {
	window.AdminModules = window.AdminModules || {};

	function createSaveAllTransactions(deps) {
		return function saveAllTransactions(items) {
			deps.writeJson("ALL_TRANSACTIONS_DATA", items);
			deps.writeJson("allTransactions", items);
		};
	}

	function createRenderDepositRequests(deps) {
		return function renderDepositRequests() {
			var rows = (Array.isArray(deps.state.allTransactions) ? deps.state.allTransactions : []).filter(function (item) {
				return deps.normalize(item.type) === "deposit";
			}).sort(function (a, b) {
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			});

			var searchKeyword = deps.normalize(deps.state.paymentSearchKeyword);
			var filteredRows = !searchKeyword ? rows : rows.filter(function (item) {
				return deps.normalize(item.note).indexOf(searchKeyword) >= 0;
			});

			var pendingRows = filteredRows.filter(function (item) {
				return deps.normalize(item.status) === "pending";
			});

			var historyRows = filteredRows.filter(function (item) {
				return deps.normalize(item.status) !== "pending";
			});

			var pendingRowsAll = rows.filter(function (item) {
				return deps.normalize(item.status) === "pending";
			});

			if (deps.el.paymentPendingCount) {
				deps.el.paymentPendingCount.textContent = String(pendingRowsAll.length);
			}

			if (deps.el.paymentPendingTotal) {
				var pendingTotal = pendingRowsAll.reduce(function (sum, item) {
					return sum + Number(item.amount || 0);
				}, 0);
				deps.el.paymentPendingTotal.textContent = deps.formatCurrency(pendingTotal);
			}

			if (!pendingRows.length) {
				deps.el.depositRequestsList.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;'>" + (searchKeyword ? "Không có yêu cầu phù hợp với nội dung tìm kiếm." : "Chưa có giao dịch nạp tiền.") + "</td></tr>";
			} else {
				deps.el.depositRequestsList.innerHTML = pendingRows.map(function (item) {
					var canApprove = deps.normalize(item.status) === "pending";
					return (
						"<tr>" +
							"<td>#" + item.id + "</td>" +
							"<td>" + (item.recruiterEmail || "-") + "</td>" +
							"<td>" + deps.formatCurrency(item.amount) + "</td>" +
							"<td>" + (item.note || "-") + "</td>" +
							"<td><span class='badge " + (canApprove ? "pending" : "active") + "'>" + (item.status || "Success") + "</span></td>" +
							"<td>" +
								(canApprove
									? "<button class='btn-xs btn-approve' data-deposit-action='approve' data-id='" + item.id + "'>Duyệt</button>"
									: "<span style='color:#64748b;'>Đã duyệt</span>") +
							"</td>" +
						"</tr>"
					);
				}).join("");
			}

			if (deps.el.paymentHistoryList) {
				if (!historyRows.length) {
					deps.el.paymentHistoryList.innerHTML = "<li>" + (searchKeyword ? "Không có lịch sử phù hợp với nội dung tìm kiếm." : "Chưa có lịch sử thanh toán.") + "</li>";
				} else {
					deps.el.paymentHistoryList.innerHTML = historyRows.slice(0, 100).map(function (item) {
						var statusText = item.status || "Success";
						var timeText = deps.formatDateTime(item.approvedAt || item.createdAt);
						return "<li>[" + timeText + "] [" + statusText + "] " + (item.recruiterEmail || "-") + " - " + deps.formatCurrency(item.amount) + " - " + (item.note || "Nạp tiền ví") + "</li>";
					}).join("");
				}
			}
		};
	}

	function createApproveDeposit(deps) {
		return function approveDeposit(transactionId) {
			var id = Number(transactionId);
			var transactions = Array.isArray(deps.state.allTransactions) ? deps.state.allTransactions.slice() : [];
			var target = transactions.find(function (item) {
				return Number(item.id) === id;
			});

			if (!target) {
				deps.toast("Không tìm thấy giao dịch.", "warn");
				return;
			}

			if (deps.normalize(target.status) === "success") {
				deps.toast("Giao dịch đã được duyệt trước đó.", "warn");
				return;
			}

			var users = deps.readJson("users", []);
			var index = users.findIndex(function (user) {
				var byId = Number(user.id) === Number(target.recruiterId);
				var byEmail = deps.normalize(user.email) === deps.normalize(target.recruiterEmail);
				return deps.normalize(user.role) === "recruiter" && (byId || byEmail);
			});

			if (index < 0) {
				deps.toast("Không tìm thấy recruiter để cộng tiền.", "error");
				return;
			}

			var recruiter = users[index];
			var balance = Number(recruiter.balance || 0);
			var ownTx = Array.isArray(recruiter.transactions) ? recruiter.transactions.slice() : [];

			ownTx = ownTx.map(function (item) {
				if (Number(item.id) !== id) return item;
				return Object.assign({}, item, { status: "Success", approvedAt: new Date().toISOString() });
			});

			if (!ownTx.some(function (item) { return Number(item.id) === id; })) {
				ownTx.unshift(Object.assign({}, target, { status: "Success", approvedAt: new Date().toISOString() }));
			}

			users[index] = Object.assign({}, recruiter, {
				balance: balance + Number(target.amount || 0),
				transactions: ownTx
			});

			deps.writeJson("users", users);

			try {
				var currentRaw = sessionStorage.getItem("currentUser");
				var currentUser = currentRaw ? JSON.parse(currentRaw) : null;
				if (currentUser && Number(currentUser.id) === Number(users[index].id)) {
					sessionStorage.setItem("currentUser", JSON.stringify(Object.assign({}, currentUser, users[index])));
				}
			} catch (err) {
				// ignore
			}

			transactions = transactions.map(function (item) {
				if (Number(item.id) !== id) return item;
				return Object.assign({}, item, { status: "Success", approvedAt: new Date().toISOString() });
			});

			deps.state.allTransactions = transactions;
			deps.state.users = users;
			deps.saveAllTransactions(transactions);
			deps.persistAll();
			deps.renderUsers();
			deps.renderDepositRequests();
			deps.renderKpis();
			deps.addLog("Duyệt nạp tiền giao dịch #" + id + " cho " + (target.recruiterEmail || "recruiter") + ".", { module: "payments" });
			deps.toast("Đã duyệt nạp tiền thành công.", "success");
		};
	}

	window.AdminModules.payments = {
		createSaveAllTransactions: createSaveAllTransactions,
		createRenderDepositRequests: createRenderDepositRequests,
		createApproveDeposit: createApproveDeposit
	};
})();
