// khởi tạo du lieu mau cho toan he thong

function getSeedData() {
  return {
    jobs: [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Corp',
        salary: '$1000 - $1400',
        location: 'Ho Chi Minh',
        type: 'fulltime',
        status: 'active',
        description: 'Phat trien giao dien React, TypeScript va toi uu hieu nang.'
      },
      {
        id: 2,
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        salary: '$900 - $1200',
        location: 'Ha Noi',
        type: 'fulltime',
        status: 'active',
        description: 'Thiet ke UI kit, user flow va prototype tren Figma.'
      },
      {
        id: 3,
        title: 'Backend Developer',
        company: 'Nexa Solutions',
        salary: '$1100 - $1500',
        location: 'Da Nang',
        type: 'fulltime',
        status: 'active',
        description: 'Xay dung API Node.js, PostgreSQL, Redis va queue system.'
      },
      {
        id: 4,
        title: 'QA Engineer',
        company: 'Quality First',
        salary: '$850 - $1100',
        location: 'Can Tho',
        type: 'hybrid',
        status: 'active',
        description: 'Manual test, API test va automation test co ban.'
      },
      {
        id: 5,
        title: 'Product Analyst',
        company: 'Insight Labs',
        salary: '$950 - $1300',
        location: 'Ho Chi Minh',
        type: 'remote',
        status: 'active',
        description: 'Phan tich hanh vi nguoi dung, SQL va dashboard BI.'
      },
      {
        id: 6,
        title: 'DevOps Engineer',
        company: 'Cloud Works',
        salary: '$1300 - $1800',
        location: 'Ha Noi',
        type: 'fulltime',
        status: 'closed',
        description: 'CI/CD, Docker, Kubernetes va monitoring stack.'
      },
      {
        id: 7,
        title: 'Mobile Developer',
        company: 'App Nation',
        salary: '$1000 - $1500',
        location: 'Remote',
        type: 'remote',
        status: 'active',
        description: 'Flutter/React Native, release pipeline va crash analytics.'
      }
    ],
    users: [
      {
        id: 1,
        role: 'admin',
        email: 'admin@jobportalplatform.vn',
        password: 'Adm!n2026#Portal',
        name: 'Admin User',
        phone: '0123456789'
      },
      {
        id: 2,
        role: 'recruiter',
        email: 'recruiter@company.com',
        password: 'Recruiter#2026!Job',
        name: 'Recruiter Name',
        company: 'Tech Corp',
        phone: '0987654321',
        balance: 0,
        transactions: []
      },
      {
        id: 3,
        role: 'candidate',
        email: 'candidate@email.com',
        password: 'Cand!date2026#Job',
        name: 'Candidate One',
        avatar: 'NA',
        phone: '0911111111',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '2 years'
      }
    ],
    applications: [
      {
        id: 1,
        jobId: 2,
        candidateId: 3,
        candidateName: 'Candidate One',
        recruiterEmail: 'recruiter@company.com',
        status: 'pending',
        message: 'Toi muon ung tuyen vi tri UI/UX Designer.',
        appliedAt: '2026-04-01T09:10:00.000Z'
      },
      {
        id: 2,
        jobId: 1,
        candidateId: 3,
        candidateName: 'Candidate One',
        recruiterEmail: 'recruiter@company.com',
        status: 'reviewed',
        message: 'Toi quan tam den vi tri Frontend Developer.',
        appliedAt: '2026-04-02T10:30:00.000Z'
      }
    ],
    currentUser: {
      id: 3,
      role: 'candidate',
      name: 'Candidate One',
      email: 'candidate@email.com',
      avatar: 'NA'
    },
    applicants: [
      {
        id: 301,
        name: 'Candidate One',
        email: 'candidate@email.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        years: 2
      },
      {
        id: 302,
        name: 'Tran Binh',
        email: 'tranbinh@email.com',
        skills: ['Vue', 'TypeScript'],
        years: 3
      }
    ],
    allTransactions: []
  };
}
//Đưa dữ liệu vào localStorage nếu chưa tồn tại hoặc khi forceReset là true
function initializeData(forceReset) {
  var seed = getSeedData();
  var shouldForce = forceReset === true;
  var STORAGE = {
    JOBS: 'JOBS_DATA',
    APPLICATIONS: 'APPLICATIONS_DATA'
  };
  function mergeSeedUsers(existingUsers) {
    var map = {};
    var merged = [];

    (Array.isArray(existingUsers) ? existingUsers : []).forEach(function (user) {
      var key = String(user && user.email ? user.email : '').trim().toLowerCase();
      if (!key) return;
      map[key] = true;
      merged.push(user);
    });

    seed.users.forEach(function (seedUser) {
      var key = String(seedUser.email || '').trim().toLowerCase();
      if (!key) return;

      var existingIndex = merged.findIndex(function (user) {
        return String(user && user.email ? user.email : '').trim().toLowerCase() === key;
      });

      if (existingIndex >= 0) {
        merged[existingIndex] = Object.assign({}, seedUser, merged[existingIndex]);
      } else {
        merged.push(seedUser);
      }

      map[key] = true;
    });

    return merged;
  }
// Chuẩn hóa dữ liệu công việc để đảm bảo tất cả trường cần thiết đều có giá trị hợp lệ
  var seededJobPosts = seed.jobs.map(function (item) {
    return Object.assign({}, item, {
      recruiterId: item.recruiterId || 2,
      recruiterEmail: item.recruiterEmail || 'recruiter@company.com',
      postedDate: item.postedDate || '2026-04-01',
      status: item.status === 'active' ? 'open' : item.status
    });
  });
// Lưu dữ liệu vào localStorage nếu chưa tồn tại hoặc khi forceReset là true
  if (shouldForce || !localStorage.getItem(STORAGE.JOBS)) {
    localStorage.setItem(STORAGE.JOBS, JSON.stringify(seededJobPosts));
  }

  // Keep legacy key for pages that still read old names.
  if (shouldForce || !localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify(seededJobPosts));
  }

  if (shouldForce || !localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(seed.users));
  } else {
    var existingUsers = [];

    try {
      existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (err) {
      existingUsers = [];
    }

    localStorage.setItem('users', JSON.stringify(mergeSeedUsers(existingUsers)));
  }

  if (shouldForce || !localStorage.getItem(STORAGE.APPLICATIONS)) {
    localStorage.setItem(STORAGE.APPLICATIONS, JSON.stringify(seed.applications));
  }

  // Keep legacy key for pages that still read old names.
  if (shouldForce || !localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify(seed.applications));
  }

  if (shouldForce || !localStorage.getItem('ALL_TRANSACTIONS_DATA')) {
    localStorage.setItem('ALL_TRANSACTIONS_DATA', JSON.stringify(seed.allTransactions || []));
  }

  if (shouldForce || !localStorage.getItem('allTransactions')) {
    localStorage.setItem('allTransactions', JSON.stringify(seed.allTransactions || []));
  }

  if (shouldForce || !localStorage.getItem('jobPosts')) {
    localStorage.setItem('jobPosts', JSON.stringify(seededJobPosts));
  }

  if (shouldForce || !localStorage.getItem('applicants')) {
    localStorage.setItem('applicants', JSON.stringify(seed.applicants));
  }

  if (shouldForce || !localStorage.getItem('savedJobs')) {
    localStorage.setItem('savedJobs', JSON.stringify([]));
  }

  if (shouldForce || !localStorage.getItem('candidateCVs')) {
    localStorage.setItem('candidateCVs', JSON.stringify([
      { id: 1, name: 'Frontend CV - 2026', createdAt: '2026-04-01T08:00:00.000Z' },
      { id: 2, name: 'General CV - ATS', createdAt: '2026-04-02T08:00:00.000Z' }
    ]));
  }

  if (shouldForce || !localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(seed.currentUser));
  }

  if (shouldForce || !sessionStorage.getItem('currentUser')) {
    sessionStorage.setItem('currentUser', JSON.stringify(seed.currentUser));
  }
}
// Tự động khởi tạo dữ liệu khi trang được tải lên nếu đang chạy trong môi trường trình duyệt
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initializeData(false);
    });
  } else {
    initializeData(false);
  }
// Đưa hàm khởi tạo và lấy dữ liệu vào phạm vi toàn cục để các phần khác của ứng dụng có thể sử dụng
  window.initializeData = initializeData;
  window.getSeedData = getSeedData;
}
