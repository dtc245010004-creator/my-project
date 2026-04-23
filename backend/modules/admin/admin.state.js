(function () {
	window.AdminModules = window.AdminModules || {};

	function createStorageConfig() {
		return {
			PENDING_JOBS: "ADMIN_PENDING_JOBS",
			USERS: "ADMIN_USERS",
			INDUSTRIES: "ADMIN_INDUSTRIES",
			CONTACTS: "ADMIN_CONTACTS",
			SYSTEM_SETTINGS: "ADMIN_SYSTEM_SETTINGS",
			ACTIVITY_LOGS: "ADMIN_ACTIVITY_LOGS"
		};
	}

	function createDefaultPendingJobs() {
		return [
			{
				id: 1,
				title: "Senior Frontend Developer",
				company: "Tech Corp",
				owner: "hr@techcorp.com",
				submittedAt: "2026-04-03",
				status: "pending",
				salary: "$1800 - $2500",
				location: "Hồ Chí Minh",
				description: "Phát triển giao diện web với React,tối ưu hóa trải nghiệm người dùng.",
				requirements: "React, JavaScript, REST API, 3+ nam kinh nghiem"
			},
			{
				id: 2,
				title: "UI Designer Intern",
				company: "Blue Pixel",
				owner: "recruit@bluepixel.vn",
				submittedAt: "2026-04-02",
				status: "pending",
				salary: "$300 - $500",
				location: "Đà Nẵng",
				description: "Hỗ trợ thiết kế wireframe, mockup và thử nghiệm giao diện di động.",
				requirements: "Figma, tư duy UX cơ bản"
			},
			{
				id: 3,
				title: "Crypto Specialist",
				company: "Fast Coin",
				owner: "owner@fastcoin.xyz",
				submittedAt: "2026-04-01",
				status: "violation",
				salary: "$2500+",
				location: "Remote",
				description: "Nội dung có dấu hiệu gây hiểu nhầm và vi phạm chính sách nên bị đánh dấu.",
				requirements: "Blockchain, tuân thủ pháp lý"
			},
			{
				id: 4,
				title: "Backend Engineer",
				company: "Nexa",
				owner: "jobs@nexa.io",
				submittedAt: "2026-04-02",
				status: "pending",
				salary: "$1600 - $2200",
				location: "Hà Nội",
				description: "ây dựng API và tối ưu CSDL cho nền tảng tuyển dụng.",
				requirements: "Node.js, SQL/NoSQL, Docker"
			},
			{
				id: 5,
				title: "Part-time Data Entry",
				company: "Quick Money",
				owner: "admin@quick-money.biz",
				submittedAt: "2026-03-31",
				status: "violation",
				salary: "$1000+",
				location: "Remote",
				description: "Tin có dấu hiệu lừa đảo và thông tin không minh bạch.",
				requirements: "Không rõ "
			},
			{
				id: 6,
				title: "Mobile Lead",
				company: "Smart Labs",
				owner: "hire@smartlabs.vn",
				submittedAt: "2026-03-30",
				status: "locked",
				salary: "$2200 - $3000",
				location: "Hồ Chí Minh",
				description: "ẫn dắt team mobile và xây dựng lộ trình sản phẩm.",
				requirements: "Flutter/React Native, kinh nghiệm lead"
			},
			{
				id: 7,
				title: "QA Engineer",
				company: "Quality First",
				owner: "qa@qualityfirst.vn",
				submittedAt: "2026-03-29",
				status: "pending",
				salary: "$1000 - $1500",
				location: "Cần Thơ",
				description: "Thiết lập test plan, test case và báo cáo chất lượng release.",
				requirements: "Manual test, API testing"
			}
		];
	}

	function createDefaultUsers() {
		return [
			{
				id: 101,
				name: "Tran Minh",
				email: "tranminh@techcorp.vn",
				company: "Tech Corp",
				joinedAt: "2025-12-12",
				role: "recruiter",
				status: "active",
				permissions: ["view", "post_job"]
			},
			{
				id: 102,
				name: "Nguyen Anh",
				email: "nguyenanh@gmail.com",
				company: "-",
				joinedAt: "2026-01-05",
				role: "candidate",
				status: "active",
				permissions: ["view", "apply"]
			},
			{
				id: 103,
				name: "Le Phuong",
				email: "lephuong@biz.vn",
				company: "Talent Hub",
				joinedAt: "2025-08-21",
				role: "recruiter",
				status: "locked",
				lockReason: "Vi phạm chính sách nội dung",
				permissions: ["view"]
			},
			{
				id: 104,
				name: "Pham Huy",
				email: "huypham@gmail.com",
				company: "-",
				joinedAt: "2026-02-01",
				role: "candidate",
				status: "active",
				permissions: ["view", "apply"]
			},
			{
				id: 105,
				name: "Blue Pixel",
				email: "contact@bluepixel.vn",
				company: "Blue Pixel",
				joinedAt: "2025-10-18",
				role: "company",
				status: "active",
				permissions: ["view", "post_job"]
			}
		];
	}

	function createDefaultIndustries() {
		return [
			"ông nghệ thông tin",
			"Tài chính - Ngân hàng",
			"Marketing - Truyền thông",
			"Thiết kế - sáng tạo",
			"Logistics"
		];
	}

	function createDefaultContacts() {
		return [
			{
				id: 1,
				fullName: "Bui Quang",
				email: "quang.bui@gmail.com",
				title: "Bao cao loi ung tuyen",
				content: "Tôi gặp lỗi khi nộp CV cho tin Frontend. Mong admin hỗ trơ kiểm tra.",
				status: "new",
				createdAt: "2026-04-03T09:20:00"
			},
			{
				id: 2,
				fullName: "Le Nhi",
				email: "hr@sunjobs.vn",
				title: "Cập nhật thông tin công ty",
				content: "Nhờ bộ phận admin cấp quyền cập nhật logo công ty cho tài khoản doanh nghiệp.",
				status: "new",
				createdAt: "2026-04-02T13:10:00"
			}
		];
	}

	function createPolicies() {
		return [
			{
				title: "Chính sách đăng tin tuyển dụng",
				content: "Nội dung tin đăng phải rõ ràng, trung thực, không chứa nội dung lừa đảo hoặc phân biệt đối xử."
			},
			{
				title: "Chính sách bảo mật dữ liệu",
				content: "Hệ thống mã hóa thông tin nhạy cảm và giới hạn truy cập theo vai trò người dùng."
			},
			{
				title: "Chính sách xử lý vi phạm",
				content: "Tài khoản vi phạm sẽ bị cảnh báo, khóa tạm thời hoặc khóa vĩnh viễn tùy theo mức độ."
			}
		];
	}

	function createRangeConfig() {
		return {
			"7d": { labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], values: [20, 28, 24, 33, 41, 37, 46] },
			"30d": { labels: ["W1", "W2", "W3", "W4"], values: [122, 138, 149, 171] },
			"90d": { labels: ["Th1", "Th2", "Th3"], values: [420, 468, 503] },
			"1y": { labels: ["Q1", "Q2", "Q3", "Q4"], values: [1240, 1360, 1498, 1622] }
		};
	}

	function createPermissions() {
		return [
			{ key: "view", label: "Xem" },
			{ key: "edit", label: "Sửa" },
			{ key: "delete", label: "Xóa" },
			{ key: "approve_job", label: "Duyệt tin" },
			{ key: "finance", label: "Quản lý tài chính" },
			{ key: "post_job", label: "Đăng tin" },
			{ key: "apply", label: "Ứng tuyển" }
		];
	}

	function createDefaultSystemSettings() {
		return {
			emailNotifications: true,
			autoLog: true,
			fastModeration: false
		};
	}

	function createRuntimeState(deps) {
		return {
			pendingJobs: deps.readJson(deps.STORAGE.PENDING_JOBS, deps.defaults.pendingJobs.slice()),
			users: deps.readJson(deps.STORAGE.USERS, deps.defaults.users.slice()),
			industries: deps.readJson(deps.STORAGE.INDUSTRIES, deps.defaults.industries.slice()),
			contacts: deps.readJson(deps.STORAGE.CONTACTS, deps.defaults.contacts.slice()),
			systemSettings: Object.assign({}, deps.defaults.systemSettings, deps.readJson(deps.STORAGE.SYSTEM_SETTINGS, {})),
			activityLogs: deps.readJson(deps.STORAGE.ACTIVITY_LOGS, []),
			allTransactions: deps.readJson("ALL_TRANSACTIONS_DATA", []),
			currentFilter: "all",
			currentPage: 1,
			pageSize: 4,
			searchKeyword: "",
			userStatusFilter: "all",
			userRoleFilter: "all",
			userScope: "all",
			rejectTargetId: null,
			detailTargetId: null,
			userDetailTargetId: null,
			companyTargetName: null,
			permissionTargetId: null,
			contactTargetId: null,
			statsRange: "7d",
			paymentSearchKeyword: ""
		};
	}

	function createLoadAllData(deps) {
		return function loadAllData() {
			try {
				var authUsers = deps.Auth.getUsers ? deps.Auth.getUsers() : [];
				var authJobs = deps.Auth.getJobs ? deps.Auth.getJobs() : [];

				var pendingJobsList = authJobs.map(function (job) {
					var recruiterInfo = authUsers.find(function (user) {
						return user.role === "recruiter" && user.company === job.company;
					}) || {};

					return {
						id: job.id || Math.random().toString(36).substr(2, 9),
						title: job.title || "",
						company: job.company || "",
						owner: recruiterInfo.email || job.recruiterEmail || job.postedBy || "unknown",
						submittedAt: job.createdAt || new Date().toISOString().split("T")[0],
						status: job.status === "closed" ? "approved" : (job.status || "pending"),
						featured: !!job.featured,
						pinnedByAdmin: !!job.pinnedByAdmin,
						pinnedAt: job.pinnedAt || null,
						salary: job.salary || "Đang cập nhật",
						location: job.location || "",
						description: job.description || "",
						requirements: job.requirements || ""
					};
				});

				deps.state.pendingJobs = pendingJobsList.length > 0 ? pendingJobsList : deps.readJson(deps.STORAGE.PENDING_JOBS, deps.defaults.pendingJobs.slice());
				deps.state.users = authUsers.length > 0 ? authUsers : deps.readJson(deps.STORAGE.USERS, deps.defaults.users.slice());
				deps.state.contacts = deps.readJson(deps.STORAGE.CONTACTS, deps.defaults.contacts.slice());
				deps.state.systemSettings = Object.assign({}, deps.defaults.systemSettings, deps.readJson(deps.STORAGE.SYSTEM_SETTINGS, {}));
				deps.state.allTransactions = deps.readJson("ALL_TRANSACTIONS_DATA", deps.readJson("allTransactions", []));

				deps.persistAll();
			} catch (err) {
				console.error("Error loading data from Auth:", err);
			}
		};
	}

	window.AdminModules.state = {
		createStorageConfig: createStorageConfig,
		createDefaultPendingJobs: createDefaultPendingJobs,
		createDefaultUsers: createDefaultUsers,
		createDefaultIndustries: createDefaultIndustries,
		createDefaultContacts: createDefaultContacts,
		createPolicies: createPolicies,
		createRangeConfig: createRangeConfig,
		createPermissions: createPermissions,
		createDefaultSystemSettings: createDefaultSystemSettings,
		createRuntimeState: createRuntimeState,
		createLoadAllData: createLoadAllData
	};
})();
