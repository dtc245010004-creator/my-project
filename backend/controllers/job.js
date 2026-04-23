(function () {
	var STORAGE = {
		JOBS: 'JOBS_DATA',
		LEGACY_JOBS: 'jobs',
		JOB_POSTS: 'jobPosts',
		USERS: 'users',
		TRANSACTIONS: 'ALL_TRANSACTIONS_DATA',
		LEGACY_TRANSACTIONS: 'allTransactions'
	};

	function readJson(key, fallback) { // Hàm tiện ích để đọc dữ liệu JSON từ localStorage, nó sẽ nhận vào một khóa và một giá trị mặc định. Hàm sẽ cố gắng lấy giá trị thô từ localStorage bằng khóa đã cho, nếu có thì sẽ cố gắng phân tích cú pháp JSON của giá trị đó và trả về kết quả. Nếu không có giá trị nào hoặc có lỗi khi phân tích cú pháp, hàm sẽ trả về giá trị mặc định đã cho
		try {
			var raw = localStorage.getItem(key);
			return raw ? JSON.parse(raw) : fallback;
		} catch (e) {
			return fallback;
		}
	}

	function writeJson(key, value) { // Hàm tiện ích để ghi dữ liệu JSON vào localStorage, nó sẽ nhận vào một khóa và một giá trị. Hàm sẽ chuyển đổi giá trị thành chuỗi JSON và lưu nó vào localStorage với khóa đã cho
		localStorage.setItem(key, JSON.stringify(value));
	}

	function writeJobsAll(jobs) { // Hàm tiện ích để ghi dữ liệu công việc vào localStorage, nó sẽ nhận vào một mảng các công việc và gọi hàm writeJson để lưu chúng vào ba khóa khác nhau trong localStorage: STORAGE.JOBS, STORAGE.LEGACY_JOBS và STORAGE.JOB_POSTS. Điều này giúp đảm bảo rằng tất cả các phần của ứng dụng có thể truy cập dữ liệu công việc từ bất kỳ khóa nào mà chúng đang sử dụng
		writeJson(STORAGE.JOBS, jobs);
		writeJson(STORAGE.LEGACY_JOBS, jobs);
		writeJson(STORAGE.JOB_POSTS, jobs);
	}

	function getJobs() { // Hàm tiện ích để lấy dữ liệu công việc từ localStorage, nó sẽ cố gắng đọc dữ liệu từ STORAGE.JOBS trước tiên. Nếu có dữ liệu hợp lệ, nó sẽ trả về dữ liệu đó. Nếu không có dữ liệu nào hoặc dữ liệu không hợp lệ, nó sẽ cố gắng đọc dữ liệu từ STORAGE.LEGACY_JOBS. Nếu có dữ liệu hợp lệ ở đó, nó sẽ gọi hàm writeJobsAll để sao chép dữ liệu đó vào tất cả các khóa liên quan và trả về dữ liệu đó. Nếu không có dữ liệu nào hoặc dữ liệu không hợp lệ ở cả hai khóa, nó sẽ trả về một mảng rỗng
		var shared = readJson(STORAGE.JOBS, []);
		if (Array.isArray(shared) && shared.length) {
			return shared;
		}

		var legacy = readJson(STORAGE.LEGACY_JOBS, []);
		if (Array.isArray(legacy) && legacy.length) {
			writeJobsAll(legacy);
			return legacy;
		}

		return [];
	}

	function getUsers() { // Hàm tiện ích để lấy dữ liệu người dùng từ localStorage, nó sẽ cố gắng đọc dữ liệu từ STORAGE.USERS. Nếu có dữ liệu hợp lệ, nó sẽ trả về dữ liệu đó. Nếu không có dữ liệu nào hoặc dữ liệu không hợp lệ, nó sẽ trả về một mảng rỗng
		var users = readJson(STORAGE.USERS, []);
		return Array.isArray(users) ? users : [];
	}

	function saveUsers(users) { // Hàm tiện ích để lưu dữ liệu người dùng vào localStorage, nó sẽ nhận vào một mảng các người dùng và gọi hàm writeJson để lưu chúng vào STORAGE.USERS
		writeJson(STORAGE.USERS, users) ;
	}

	function getAllTransactions() { // Hàm tiện ích để lấy dữ liệu giao dịch từ localStorage, nó sẽ cố gắng đọc dữ liệu từ STORAGE.TRANSACTIONS trước tiên. Nếu có dữ liệu hợp lệ, nó sẽ cố gắng đọc dữ liệu từ STORAGE.LEGACY_TRANSACTIONS. Nếu không có dữ liệu nào hoặc dữ liệu không hợp lệ ở đó, nó sẽ gọi hàm writeJson để sao chép dữ liệu giao dịch hiện tại vào STORAGE.LEGACY_TRANSACTIONS. Cuối cùng, nó sẽ trả về dữ liệu giao dịch hiện tại. Nếu không có dữ liệu nào hoặc dữ liệu không hợp lệ ở cả hai khóa, nó sẽ trả về một mảng rỗng
		var shared = readJson(STORAGE.TRANSACTIONS, []);
		if (Array.isArray(shared) && shared.length) {
			var legacy = readJson(STORAGE.LEGACY_TRANSACTIONS, []);
			if (!Array.isArray(legacy) || legacy.length !== shared.length) {
				writeJson(STORAGE.LEGACY_TRANSACTIONS, shared);
			}
			return shared;
		}

		var legacyOnly = readJson(STORAGE.LEGACY_TRANSACTIONS, []);
		if (Array.isArray(legacyOnly) && legacyOnly.length) {
			writeJson(STORAGE.TRANSACTIONS, legacyOnly);
			return legacyOnly;
		}

		return [];
	}

	function saveAllTransactions(items) { // Hàm tiện ích để lưu dữ liệu giao dịch vào localStorage, nó sẽ nhận vào một mảng các giao dịch và gọi hàm writeJson để lưu chúng vào cả STORAGE.TRANSACTIONS và STORAGE.LEGACY_TRANSACTIONS. Điều này giúp đảm bảo rằng tất cả các phần của ứng dụng có thể truy cập dữ liệu giao dịch từ bất kỳ khóa nào mà chúng đang sử dụng
		writeJson(STORAGE.TRANSACTIONS, items);
		writeJson(STORAGE.LEGACY_TRANSACTIONS, items);
	}

	function toOpenStatus(status) { // Hàm tiện ích để chuyển đổi trạng thái công việc thành 'open' nếu trạng thái là 'active', ngược lại trả về trạng thái gốc hoặc 'open' nếu trạng thái gốc không hợp lệ. Điều này giúp chuẩn hóa dữ liệu công việc để tất cả các công việc có thể được hiển thị dưới dạng 'open' khi chúng đang hoạt động
		if (status === 'active') {
			return 'open';
		}
		return status || 'open';
	}

	function normalize(text) { // Hàm tiện ích để chuẩn hóa một chuỗi văn bản bằng cách loại bỏ khoảng trắng thừa và chuyển đổi tất cả các ký tự thành chữ thường. Điều này giúp chuẩn hóa dữ liệu đầu vào để có thể so sánh hoặc tìm kiếm một cách nhất quán mà không bị ảnh hưởng bởi sự khác biệt về chữ hoa chữ thường hoặc khoảng trắng
		return String(text || '').trim().toLowerCase();
	}

	function getTodayKey() { // Hàm tiện ích để lấy một chuỗi đại diện cho ngày hiện tại theo định dạng 'YYYY-MM-DD', nó sẽ tạo một đối tượng Date mới và chuyển đổi nó thành chuỗi ISO, sau đó tách chuỗi đó bằng ký tự 'T' và lấy phần đầu tiên. Điều này giúp tạo ra một khóa duy nhất cho mỗi ngày mà có thể được sử dụng để đếm số lượng bài đăng trong ngày hoặc thực hiện các logic liên quan đến ngày
		return new Date().toISOString().split('T')[0];
	}

	function createTransactionRecord(options) { // Hàm tiện ích để tạo một bản ghi giao dịch mới, nó sẽ nhận vào một đối tượng chứa các tùy chọn cho giao dịch như loại, hướng, số tiền, ghi chú, trạng thái, thông tin nhà tuyển dụng, id công việc và meta dữ liệu bổ sung. Hàm sẽ trả về một đối tượng giao dịch mới với một id duy nhất được tạo bằng cách kết hợp timestamp hiện tại và một số ngẫu nhiên, cùng với các trường khác được lấy từ đối tượng tùy chọn hoặc có giá trị mặc định. Điều này giúp chuẩn hóa dữ liệu giao dịch và đảm bảo rằng tất cả các giao dịch đều có cấu trúc giống nhau
		return {
			id: Date.now() + Math.floor(Math.random() * 1000),
			type: options.type,
			direction: options.direction,
			amount: Number(options.amount || 0),
			note: options.note || '',
			status: options.status || 'Success',
			recruiterId: options.recruiterId || 0,
			recruiterEmail: options.recruiterEmail || '',
			jobId: options.jobId || 0,
			meta: options.meta || {},
			createdAt: new Date().toISOString()
		};
	}

	function updateCurrentUserIfMatch(updatedRecruiter) { // Hàm tiện ích để cập nhật thông tin người dùng hiện tại trong sessionStorage và localStorage nếu thông tin nhà tuyển dụng đã được cập nhật khớp với người dùng hiện tại. Hàm sẽ nhận vào một đối tượng nhà tuyển dụng đã được cập nhật, sau đó cố gắng lấy thông tin người dùng hiện tại từ sessionStorage và localStorage. Nếu tìm thấy người dùng hiện tại và id hoặc email của họ khớp với id hoặc email của nhà tuyển dụng đã cập nhật, hàm sẽ cập nhật thông tin người dùng hiện tại bằng cách kết hợp thông tin cũ với thông tin mới và lưu lại vào sessionStorage và localStorage. Điều này giúp đảm bảo rằng khi thông tin nhà tuyển dụng được cập nhật, tất cả các phần của ứng dụng đều có thể truy cập thông tin mới nhất về nhà tuyển dụng đó
		if (!updatedRecruiter) return;
		try {
			var rawSession = sessionStorage.getItem('currentUser');
			var currentSession = rawSession ? JSON.parse(rawSession) : null;
			if (currentSession && Number(currentSession.id) === Number(updatedRecruiter.id)) {
				sessionStorage.setItem('currentUser', JSON.stringify(Object.assign({}, currentSession, updatedRecruiter)));
			}
		} catch (e) {
			// ignore session parse errors
		}

		try {
			var rawLocal = localStorage.getItem('currentUser');
			var currentLocal = rawLocal ? JSON.parse(rawLocal) : null;
			if (currentLocal && Number(currentLocal.id) === Number(updatedRecruiter.id)) {
				localStorage.setItem('currentUser', JSON.stringify(Object.assign({}, currentLocal, updatedRecruiter)));
			}
		} catch (e2) {
			// ignore local parse errors
		}
	}

	function findRecruiterFromPayload(payloadRecruiter) { // Hàm tiện ích để tìm kiếm thông tin nhà tuyển dụng từ một đối tượng payload, nó sẽ nhận vào một đối tượng chứa thông tin nhà tuyển dụng có thể bao gồm id và email. Hàm sẽ lấy danh sách người dùng hiện tại và cố gắng tìm kiếm một người dùng có id khớp với id của nhà tuyển dụng trong payload và có vai trò là 'recruiter'. Nếu tìm thấy, hàm sẽ trả về người dùng đó. Nếu không tìm thấy, hàm sẽ cố gắng tìm kiếm một người dùng có email khớp với email của nhà tuyển dụng trong payload và có vai trò là 'recruiter'. Nếu tìm thấy, hàm sẽ trả về người dùng đó. Nếu không tìm thấy ở cả hai cách, hàm sẽ trả về null. Điều này giúp đảm bảo rằng khi tạo hoặc cập nhật công việc, chúng ta có thể xác định chính xác nhà tuyển dụng liên quan dựa trên thông tin đã cho
		var users = getUsers();
		if (!payloadRecruiter) {
			return null;
		}

		var byId = users.find(function (user) {
			return Number(user.id) === Number(payloadRecruiter.id) && normalize(user.role) === 'recruiter';
		});
		if (byId) return byId;

		return users.find(function (user) {
			return normalize(user.email) === normalize(payloadRecruiter.email) && normalize(user.role) === 'recruiter';
		}) || null;
	}

	function chargeRecruiterBalance(recruiter, amount, note, type, jobId, meta) { // Hàm tiện ích để trừ số dư của nhà tuyển dụng khi thực hiện một giao dịch, nó sẽ nhận vào một đối tượng nhà tuyển dụng, số tiền cần trừ, ghi chú cho giao dịch, loại giao dịch, id công việc liên quan và meta dữ liệu bổ sung. Hàm sẽ lấy danh sách người dùng hiện tại và cố gắng tìm kiếm nhà tuyển dụng trong danh sách đó bằng cách so sánh id hoặc email. Nếu không tìm thấy nhà tuyển dụng, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi. Nếu tìm thấy nhà tuyển dụng, hàm sẽ kiểm tra xem số dư hiện tại của nhà tuyển dụng có đủ để thực hiện giao dịch hay không. Nếu không đủ, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi chi tiết về số dư hiện tại và số tiền cần thiết. Nếu đủ, hàm sẽ tạo một bản ghi giao dịch mới bằng cách gọi hàm createTransactionRecord với các thông tin đã cho, sau đó cập nhật số dư của nhà tuyển dụng bằng cách trừ đi số tiền giao dịch và thêm bản ghi giao dịch vào danh sách giao dịch của nhà tuyển dụng. Cuối cùng, hàm sẽ lưu lại danh sách người dùng đã cập nhật và danh sách giao dịch đã cập nhật vào localStorage, đồng thời cập nhật thông tin người dùng hiện tại nếu khớp với nhà tuyển dụng đã cập nhật. Hàm sẽ trả về một đối tượng với success là true, thông tin nhà tuyển dụng đã cập nhật và bản ghi giao dịch mới
		var users = getUsers();
		var targetIndex = users.findIndex(function (user) {
			return Number(user.id) === Number(recruiter.id) || normalize(user.email) === normalize(recruiter.email);
		});
		if (targetIndex < 0) {
			return { success: false, message: 'Không tìm thấy nhà tuyển dụng để trừ phí.' };
		}

		var target = users[targetIndex];
		var currentBalance = Number(target.balance || 0);
		var fee = Number(amount || 0);
		if (fee > currentBalance) {
			return {
				success: false,
				message: 'Số dư không đủ để thực hiện giao dịch. Cần ' + fee.toLocaleString('vi-VN') + 'đ, hiện có ' + currentBalance.toLocaleString('vi-VN') + 'đ.'
			};
		}

		var transaction = createTransactionRecord({
			type: type,
			direction: 'out', 
			amount: fee,
			note: note,
			status: 'Success',
			recruiterId: target.id,
			recruiterEmail: target.email,
			jobId: jobId,
			meta: meta || {}
		});

		var ownTx = Array.isArray(target.transactions) ? target.transactions.slice() : [];
		ownTx.unshift(transaction);

		var updatedTarget = Object.assign({}, target, {
			balance: currentBalance - fee,
			transactions: ownTx
		});

		users[targetIndex] = updatedTarget;
		saveUsers(users);
		updateCurrentUserIfMatch(updatedTarget);

		var allTransactions = getAllTransactions();
		allTransactions.unshift(transaction);
		saveAllTransactions(allTransactions);

		return { success: true, recruiter: updatedTarget, transaction: transaction };
	}

	function getTodayPostCount(jobs, recruiter) { // Hàm tiện ích để đếm số lượng bài đăng đã được đăng trong ngày hiện tại bởi một nhà tuyển dụng cụ thể, nó sẽ nhận vào một mảng các công việc và một đối tượng nhà tuyển dụng. Hàm sẽ tạo ra một khóa đại diện cho ngày hiện tại bằng cách gọi hàm getTodayKey, sau đó lọc danh sách công việc để chỉ giữ lại những công việc có ngày đăng trùng với ngày hiện tại và có id hoặc email của nhà tuyển dụng khớp với id hoặc email của nhà tuyển dụng đã cho. Cuối cùng, hàm sẽ trả về số lượng công việc đã lọc được. Điều này giúp xác định xem nhà tuyển dụng đã đăng bao nhiêu công việc trong ngày hôm nay để áp dụng các logic liên quan đến phí đăng tin hoặc giới hạn số lượng bài đăng
		var today = getTodayKey();
		return jobs.filter(function (job) {
			if (String(job.postedDate || '').split('T')[0] !== today) return false;
			var byId = Number(job.recruiterId) === Number(recruiter.id);
			var byEmail = normalize(job.recruiterEmail) === normalize(recruiter.email);
			return byId || byEmail;
		}).length;
	}

	function createJobFromForm(payload) { // Hàm tiện ích để tạo một công việc mới từ dữ liệu được gửi từ một biểu mẫu, nó sẽ nhận vào một đối tượng payload chứa thông tin về công việc như tiêu đề, mức lương, mô tả, địa điểm, yêu cầu, số lượng hồ sơ tối đa, thông tin nhà tuyển dụng và liệu công việc có được đánh dấu là nổi bật hay không. Hàm sẽ kiểm tra tính hợp lệ của các trường bắt buộc như tiêu đề, mức lương, mô tả và địa điểm. Nếu có trường nào không hợp lệ, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi. Nếu tất cả các trường đều hợp lệ, hàm sẽ tìm kiếm thông tin nhà tuyển dụng dựa trên thông tin trong payload. Nếu không tìm thấy nhà tuyển dụng, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi. Nếu tìm thấy nhà tuyển dụng, hàm sẽ đếm số lượng bài đăng đã được đăng trong ngày hiện tại bởi nhà tuyển dụng đó để xác định phí đăng tin cần trừ. Nếu phí đăng tin lớn hơn 0, hàm sẽ gọi hàm chargeRecruiterBalance để trừ phí từ số dư của nhà tuyển dụng. Nếu việc trừ phí không thành công, hàm sẽ trả về kết quả của hàm chargeRecruiterBalance. Nếu việc trừ phí thành công hoặc không cần trừ phí, hàm sẽ tạo một đối tượng công việc mới với id tự động tăng và các trường khác được lấy từ payload và thông tin nhà tuyển dụng. Sau đó, hàm sẽ thêm công việc mới vào đầu danh sách công việc hiện tại và lưu lại danh sách mới vào localStorage bằng cách gọi hàm writeJobsAll. Cuối cùng, hàm sẽ trả về một đối tượng với success là true, thông tin công việc mới, tổng phí đã trừ và một thông báo thành công
		var title = String(payload.title || '').trim();
		var salary = String(payload.salary || '').trim();

		// Validate salary numbers: do not allow negative numeric values
		try {
			var salaryNums = (salary.match(/-?\d+(?:\.\d+)?/g) || []).map(function (s) { return Number(s); });
			if (salaryNums.some(function (n) { return Number.isFinite(n) && n < 0; })) {
				return { success: false, message: 'Mức lương không được âm' };
			}
		} catch (e) {
			// ignore parsing errors and let other validations handle format
		}
		var description = String(payload.description || '').trim();
		var location = String(payload.location || '').trim();
		var requirements = String(payload.requirements || '').trim();
		var maxApplicantsRaw = String(payload.maxApplicants || '').trim();
		var recruiterPayload = payload.recruiter || null;
		var isFeatured = !!payload.isFeatured;
		var maxApplicants = 0;

		if (!title || !salary || !description || !location) {
			return { success: false, message: 'Vui lòng nhập đầy đủ tiêu đề, mức lương, mô tả và địa điểm.' };
		}

		if (maxApplicantsRaw) {
			maxApplicants = Number(maxApplicantsRaw);
			if (!Number.isFinite(maxApplicants) || maxApplicants < 1) {
				return { success: false, message: 'Số lượng hồ sơ tối đa phải là số nguyên lớn hơn 0.' };
			}
			maxApplicants = Math.floor(maxApplicants);
		}

		var recruiter = findRecruiterFromPayload(recruiterPayload);
		if (!recruiter) {
			return { success: false, message: 'Không tìm thấy thông tin nhà tuyển dụng.' };
		}

		var jobs = getJobs();
		var todayPostCount = getTodayPostCount(jobs, recruiter);
		var baseFee = todayPostCount >= 1 ? 10000 : 0;
		var featuredFee = isFeatured ? 20000 : 0;
		var totalFee = baseFee + featuredFee;

		if (totalFee > 0) {
			var feeParts = [];
			if (baseFee > 0) feeParts.push('Phí đăng tin thứ 2 trong ngày');
			if (featuredFee > 0) feeParts.push('Phí ghim/nổi bật');

			var feeResult = chargeRecruiterBalance(
				recruiter,
				totalFee,
				feeParts.join(' + '),
				'post_fee',
				0,
				{ todayPostCount: todayPostCount + 1, isFeatured: isFeatured }
			);

			if (!feeResult.success) {
				return feeResult;
			}

			recruiter = feeResult.recruiter;
		}

		var nextId = jobs.reduce(function (max, item) {
			return Math.max(max, Number(item.id) || 0);
		}, 0) + 1;

		var newJob = {
			id: nextId,
			title: title,
			company: recruiter.company || recruiter.name || 'Tech Corp',
			salary: salary,
			location: location,
			type: payload.type || 'fulltime',
			status: toOpenStatus('open'),
			description: description,
			requirements: requirements,
			recruiterId: recruiter ? recruiter.id : 0,
			recruiterEmail: recruiter ? recruiter.email : '',
			recruiterName: recruiter ? (recruiter.name || recruiter.email) : 'Recruiter',
			maxApplicants: maxApplicants,
			featured: isFeatured,
			postedDate: getTodayKey()
		};

		jobs.unshift(newJob);
		writeJobsAll(jobs);

		return {
			success: true,
			job: newJob,
			fee: totalFee,
			message: totalFee > 0 ? 'Dang tin thanh cong. Da tru phi ' + totalFee.toLocaleString('vi-VN') + 'đ.' : 'Dang tin thanh cong (tin dau trong ngay duoc mien phi).'
		};
	}

	function chargeCommissionByJobId(jobId, amount, note) { // Hàm tiện ích để trừ phí hoa hồng ứng tuyển từ nhà tuyển dụng dựa trên id công việc, nó sẽ nhận vào id công việc, số tiền cần trừ và ghi chú cho giao dịch. Hàm sẽ cố gắng tìm kiếm công việc trong danh sách công việc hiện tại dựa trên id đã cho. Nếu không tìm thấy công việc, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi. Nếu tìm thấy công việc, hàm sẽ cố gắng tìm kiếm nhà tuyển dụng liên quan đến công việc đó dựa trên id hoặc email của nhà tuyển dụng trong công việc. Nếu không tìm thấy nhà tuyển dụng, hàm sẽ trả về một đối tượng với success là false và một thông báo lỗi. Nếu tìm thấy nhà tuyển dụng, hàm sẽ gọi hàm chargeRecruiterBalance để trừ phí hoa hồng từ số dư của nhà tuyển dụng với các thông tin đã cho và trả về kết quả của hàm chargeRecruiterBalance
		var fee = Number(amount || 5000);
		var jobs = getJobs();
		var targetJob = jobs.find(function (job) {
			return Number(job.id) === Number(jobId);
		});
		if (!targetJob) {
			return { success: false, message: 'Không tìm thấy tin tuyển dụng để trừ phí hoa hồng.' };
		}

		var users = getUsers();
		var recruiter = users.find(function (user) {
			if (normalize(user.role) !== 'recruiter') return false;
			var byId = Number(user.id) === Number(targetJob.recruiterId);
			var byEmail = normalize(user.email) === normalize(targetJob.recruiterEmail);
			return byId || byEmail;
		}) || null;

		if (!recruiter) {
			return { success: false, message: 'Không tìm thấy recruiter sở hữu tin tuyển dụng.' };
		}

		return chargeRecruiterBalance(
			recruiter,
			fee,
			note || 'Phí hoa hồng ứng tuyển cho công việc: ' + (targetJob.title || ''),
			'apply_commission',
			jobId,
			{ jobTitle: targetJob.title || '' }
		);
	}

	window.JobModule = {
		getJobs: getJobs,
		createJobFromForm: createJobFromForm,
		chargeCommissionByJobId: chargeCommissionByJobId
	};
})();
