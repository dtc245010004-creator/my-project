// Admin contacts module
(function () {
	window.AdminModules = window.AdminModules || {};

	function createFormatContactStatusLabel() {
		return function formatContactStatusLabel(status) {
			if (status === "done") return "Đã xử lý";
			if (status === "processing") return "Đang xử lý";
			if (status === "replied") return "Đã phản hồi";
			return "Mới";
		};
	}

	function createRenderContacts(deps) {
		return function renderContacts() {
			if (!deps.el.contactsList) return;

			if (!deps.state.contacts.length) {
				deps.el.contactsList.innerHTML = "<div class='policy-card'><p>Chưa có liên hệ nào.</p></div>";
				return;
			}

			deps.el.contactsList.innerHTML = deps.state.contacts.map(function (contact) {
				var st = contact.status === "done" ? "Đã xử lý" : (contact.status === "processing" ? "Đang xử lý" : (contact.status === "replied" ? "Đã phản hồi" : "Mới"));
				var sourceLabel = contact.source === "recruiter" ? "Recruiter" : (contact.source === "candidate" ? "Candidate" : "Khác");
				var deptLabel = contact.department === "finance" ? "Tài chính" : contact.department === "recruitment" ? "Tuyển dụng" : contact.department === "account" ? "Tài khoản" : contact.department === "support" ? "Hỗ trợ kỹ thuật" : contact.department === "other" ? "Khác" : "Chưa phân loại";
				return (
					"<div class='contact-item'>" +
						"<div>" +
							"<div class='contact-title'>" + contact.title + "</div>" +
							"<div class='contact-sub'>" + contact.fullName + " - " + contact.email + "</div>" +
							"<div class='contact-sub'>Nguồn: " + sourceLabel + " | Bộ phận: " + deptLabel + " | Trạng thái: " + st + " | " + deps.formatDateTime(contact.createdAt) + "</div>" +
						"</div>" +
						"<button class='btn-xs' data-contact-action='view' data-contact-id='" + contact.id + "'>Xem chi tiết</button>" +
					"</div>"
				);
			}).join("");
		};
	}

	function createRenderContactHistory(deps) {
		return function renderContactHistory(contact) {
			if (!deps.el.contactHistoryList) return;

			var history = Array.isArray(contact && contact.history) ? contact.history.slice() : [];
			if (!history.length) {
				deps.el.contactHistoryList.innerHTML = "<div class='policy-card'><p>Chưa có lịch sử xử lý.</p></div>";
				return;
			}

			deps.el.contactHistoryList.innerHTML = history.map(function (item) {
				return (
					"<div style='border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;'>" +
						"<div style='font-weight:700;color:#334155;'>" + (item.label || item.action || 'Mốc xử lý') + "</div>" +
						"<div style='font-size:12px;color:#64748b;'>" + deps.formatDateTime(item.at) + "</div>" +
					"</div>"
				);
			}).join("");
		};
	}

	function createCloseContactModal(deps) {
		return function closeContactModal() {
			deps.state.contactTargetId = null;
			if (deps.el.contactModalBackdrop) {
				deps.el.contactModalBackdrop.style.display = "none";
			}
		};
	}

	function createOpenContactModal(deps) {
		return function openContactModal(contactId) {
			var target = deps.state.contacts.find(function (item) { return Number(item.id) === Number(contactId); });
			if (!target || !deps.el.contactModalBackdrop || !deps.el.contactModalBody) return;

			deps.state.contactTargetId = target.id;

			if (deps.el.contactDepartment) {
				deps.el.contactDepartment.value = target.department || "support";
			}
			if (deps.el.contactReplyNote) {
				deps.el.contactReplyNote.value = target.adminNote || target.replyNote || "";
			}

			deps.renderContactHistory(target);

			deps.el.contactModalBody.innerHTML =
				"<div><label>Họ tên</label><input type='text' readonly value='" + target.fullName + "'></div>" +
				"<div><label>Email</label><input type='text' readonly value='" + target.email + "'></div>" +
				"<div><label>Nguồn gửi</label><input type='text' readonly value='" + ((target.source === "recruiter" ? "Recruiter" : target.source === "candidate" ? "Candidate" : "Khác")) + "'></div>" +
				"<div><label>Bộ phận được chuyển</label><input type='text' readonly value='" + (target.department || "Chưa phân loại") + "'></div>" +
				"<div><label>Tiêu đề</label><input type='text' readonly value='" + target.title + "'></div>" +
				"<div><label>Nội dung</label><textarea readonly>" + target.content + "</textarea></div>" +
				"<div><label>Trạng thái</label><input type='text' readonly value='" + deps.formatContactStatusLabel(target.status) + "'></div>";

			deps.el.contactModalBackdrop.style.display = "flex";
		};
	}

	function createUpdateContactStatus(deps) {
		return function updateContactStatus(nextStatus, persistNote) {
			if (!deps.state.contactTargetId) return;

			var note = deps.el.contactReplyNote ? String(deps.el.contactReplyNote.value || '').trim() : '';
			var department = deps.el.contactDepartment ? String(deps.el.contactDepartment.value || '').trim() : 'support';
			var finalNote = persistNote === false ? '' : note;
			var nextLabel = nextStatus === 'done' ? 'Đã xử lý' : (nextStatus === 'replied' ? 'Đã phản hồi' : 'Đã chuyển cho bộ phận phụ trách');

			deps.state.contacts = deps.state.contacts.map(function (item) {
				if (Number(item.id) !== Number(deps.state.contactTargetId)) return item;
				var history = Array.isArray(item.history) ? item.history.slice() : [];
				history.push({
					action: nextStatus,
					label: nextLabel + (department ? ' • ' + department : '') + (finalNote ? ' • ' + finalNote : ''),
					at: new Date().toISOString()
				});
				return Object.assign({}, item, {
					status: nextStatus,
					department: department,
					adminNote: finalNote,
					replyNote: finalNote,
					history: history,
					updatedAt: new Date().toISOString(),
					handledAt: nextStatus === 'done' ? new Date().toISOString() : (item.handledAt || '')
				});
			});

			deps.persistAll();
			deps.renderContacts();
			deps.closeContactModal();

			var message = nextStatus === 'done'
				? "Đã đánh dấu yêu cầu liên hệ là đã xử lý."
				: (nextStatus === 'replied' ? "Đã ghi phản hồi cho liên hệ." : "Đã chuyển liên hệ cho bộ phận phụ trách.");

			deps.toast(message, "success");
			deps.addLog("Cập nhật liên hệ ID " + deps.state.contactTargetId + " -> " + nextStatus, { module: "contacts" });
		};
	}

	function createMarkContactDone(deps) {
		return function markContactDone() {
			deps.updateContactStatus("done");
		};
	}

	function createForwardContact(deps) {
		return function forwardContact() {
			deps.updateContactStatus("processing", false);
		};
	}

	function createReplyContact(deps) {
		return function replyContact() {
			deps.updateContactStatus("replied");
		};
	}

	window.AdminModules.contacts = {
		createFormatContactStatusLabel: createFormatContactStatusLabel,
		createRenderContacts: createRenderContacts,
		createRenderContactHistory: createRenderContactHistory,
		createCloseContactModal: createCloseContactModal,
		createOpenContactModal: createOpenContactModal,
		createUpdateContactStatus: createUpdateContactStatus,
		createMarkContactDone: createMarkContactDone,
		createForwardContact: createForwardContact,
		createReplyContact: createReplyContact
	};
})();
