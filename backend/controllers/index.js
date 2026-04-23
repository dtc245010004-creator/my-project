initializeData(false);

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderJobs(items) {
      var root = document.getElementById('latest-jobs');
      if (!items || !items.length) {
        root.innerHTML = '<div class="empty">Hien chua co viec lam moi</div>';
        return;
      }

      root.innerHTML = items.slice(0, 8).map(function (job) {
        var tags = '';
        if (job.tags && job.tags.length) {
          tags = job.tags.map(function (t) { return '<span class="pill">' + escapeHtml(t) + '</span>'; }).join('');
        } else {
          tags = '<span class="pill">' + escapeHtml(job.type || 'Toàn thời gian') + '</span>';
        }

        var statusClass = (String(job.status || '').toLowerCase() === 'closed') ? 'closed' : 'open';
        var applicants = job.applicants != null ? job.applicants : (job.applied || 0);

        var avatar = '';
        if (job.logo) {
          avatar = '<img class="brand-logo" src="' + escapeHtml(job.logo) + '" alt="' + escapeHtml(job.company || '') + '" />';
        } else {
          var initials = (job.company || job.title || '').split(/\s+/).slice(0,2).map(function(w){ return w.charAt(0); }).join('').toUpperCase();
          avatar = '<div class="brand-avatar">' + escapeHtml(initials || 'JP') + '</div>';
        }

        return [
          '<article class="job-card" data-job-id="' + escapeHtml(job.id) + '">',
          '<div class="job-top">',
            '<div class="job-brand">',
              avatar,
              '<div class="brand-info">',
                '<h3 class="job-title">' + escapeHtml(job.title) + '</h3>',
                '<p class="job-company">' + escapeHtml(job.company) + '</p>',
              '</div>',
            '</div>',
            '<div class="job-salary">' + escapeHtml(job.salary || '') + '</div>',
          '</div>',
          '<p class="job-desc">' + escapeHtml(job.description || '') + '</p>',
          '<div class="job-pill-row">' +
            '<span class="pill job-status ' + statusClass + '">' + escapeHtml((job.status||'Mở').toString()) + '</span>' +
            tags +
          '</div>',
          '<div class="job-actions">',
            '<button class="btn apply">Ứng tuyển</button>',
            '<button class="btn detail">Xem chi tiết</button>',
            '<button class="icon favorite" aria-label="Yêu thích">❤</button>',
          '</div>',
          '<div class="job-meta">',
            '<span class="meta-item">Đã ứng tuyển: ' + escapeHtml(String(applicants || 0)) + '</span>',
            '<span class="meta-item">Views: ' + escapeHtml(String(job.views || 0)) + '</span>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function setupSearch() {
      var allJobs = Auth.getJobs();
      renderJobs(allJobs);

      document.getElementById('search-btn').addEventListener('click', function () {
        var keyword = document.getElementById('job-search').value.trim().toLowerCase();
        if (!keyword) {
          renderJobs(allJobs);
          return;
        }

        var filtered = allJobs.filter(function (job) {
          var title = String(job.title || '').toLowerCase();
          var company = String(job.company || '').toLowerCase();
          var description = String(job.description || '').toLowerCase();
          return title.includes(keyword) || company.includes(keyword) || description.includes(keyword);
        });

        renderJobs(filtered);
      });

      document.getElementById('job-search').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          document.getElementById('search-btn').click();
        }
      });
    }

    function setupSupportWidget() { // 
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
    }

    setupSearch();
    setupSupportWidget();