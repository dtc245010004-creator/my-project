(function(){
  // View CV module (vanilla JS)
  var MODAL_ID = 'candidateModal';
  var MODAL_BACKDROP_ID = 'candidateModalBackdrop';

  // Utility: create modal DOM if not exists
  function ensureModal() {
    if (document.getElementById(MODAL_BACKDROP_ID)) return;

    var backdrop = document.createElement('div');
    backdrop.id = MODAL_BACKDROP_ID;
    backdrop.className = 'modal-backdrop';
    backdrop.style.display = 'none';
    backdrop.style.position = 'fixed';
    backdrop.style.left = 0;
    backdrop.style.top = 0;
    backdrop.style.right = 0;
    backdrop.style.bottom = 0;
    backdrop.style.background = 'rgba(0,0,0,0.4)';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = 2000;

    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'modal';
    modal.style.width = '760px';
    modal.style.maxWidth = '96%';
    modal.style.maxHeight = '92%';
    modal.style.overflow = 'auto';
    modal.style.background = '#fff';
    modal.style.borderRadius = '10px';
    modal.style.padding = '18px';
    modal.style.boxSizing = 'border-box';

    var head = document.createElement('div');
    head.className = 'modal-head';
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';

    var title = document.createElement('h3');
    title.textContent = 'Hồ sơ ứng viên';
    head.appendChild(title);

    var btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'modal-close';
    btnClose.innerHTML = '&times;';
    btnClose.addEventListener('click', closeCandidateModal);
    head.appendChild(btnClose);

    modal.appendChild(head);

    var body = document.createElement('div');
    body.className = 'modal-body';
    body.id = 'candidateModalBody';
    body.style.display = 'grid';
    body.style.gridTemplateColumns = '1fr';
    body.style.gap = '8px';
    body.style.marginTop = '8px';

    // Fields
    function field(labelText, id, tag) {
      var wrap = document.createElement('div');
      wrap.className = 'field';
      var label = document.createElement('label');
      label.textContent = labelText;
      label.htmlFor = id;
      var el = document.createElement(tag || 'input');
      el.id = id;
      if (tag === 'textarea') {
        el.style.minHeight = '72px';
      } else {
        el.type = 'text';
      }
      el.readOnly = true;
      el.style.width = '100%';
      el.style.boxSizing = 'border-box';
      el.style.padding = '8px';
      el.style.border = '1px solid #d1d5db';
      el.style.borderRadius = '6px';
      wrap.appendChild(label);
      wrap.appendChild(el);
      return wrap;
    }

    body.appendChild(field('Họ tên', 'name', 'input'));
    body.appendChild(field('Email', 'email', 'input'));
    body.appendChild(field('Vị trí ứng tuyển', 'position', 'input'));
    body.appendChild(field('CV (tên)', 'cv', 'input'));
    body.appendChild(field('Kỹ năng', 'skills', 'textarea'));
    body.appendChild(field('Tóm tắt', 'summary', 'textarea'));
    body.appendChild(field('Trạng thái', 'status', 'input'));
    body.appendChild(field('Ngày nộp', 'appliedAt', 'input'));
    body.appendChild(field('Lời nhắn', 'message', 'textarea'));

    // Actions
    var actions = document.createElement('div');
    actions.className = 'modal-actions';
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';
    actions.style.marginTop = '12px';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn btn-cancel';
    close.textContent = 'Đóng';
    close.addEventListener('click', closeCandidateModal);
    actions.appendChild(close);

    modal.appendChild(body);
    modal.appendChild(actions);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // close when clicking backdrop
    backdrop.addEventListener('click', function(e){
      if (e.target === backdrop) closeCandidateModal();
    });
  }

  // Find candidate by id from global candidates array
  function findCandidateById(id) {
    var nid = Number(id);
    if (!Number.isFinite(nid)) return null;
    var list = Array.isArray(window.candidates) ? window.candidates : [];
    return list.find(function(c){ return Number(c.id) === nid; }) || null;
  }

  // Render candidate into modal fields
  function renderCandidateToModal(candidate) {
    if (!candidate) return;
    var map = {
      name: '#name',
      email: '#email',
      position: '#position',
      cv: '#cv',
      skills: '#skills',
      summary: '#summary',
      status: '#status',
      appliedAt: '#appliedAt',
      message: '#message'
    };

    Object.keys(map).forEach(function(key){
      var sel = map[key];
      var el = document.querySelector(sel);
      if (!el) return;
      var value = '';
      if (candidate.hasOwnProperty(key) && candidate[key] != null) {
        value = candidate[key];
      } else {
        // support nested / alternate keys
        if (key === 'skills' && Array.isArray(candidate.skills)) value = candidate.skills.join(', ');
        else if (key === 'appliedAt' && candidate.appliedAt) value = formatDate(candidate.appliedAt);
        else value = '';
      }

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.value = value;
      } else {
        el.textContent = value;
      }
    });
  }

  function formatDate(val) {
    try {
      var d = new Date(val);
      if (isNaN(d.getTime())) return String(val || '');
      return d.toLocaleString();
    } catch (e) { return String(val || ''); }
  }

  function openCandidateModal() {
    ensureModal();
    var bd = document.getElementById(MODAL_BACKDROP_ID);
    if (!bd) return;
    bd.style.display = 'flex';
  }
  function closeCandidateModal(){
    var bd = document.getElementById(MODAL_BACKDROP_ID);
    if (!bd) return;
    bd.style.display = 'none';
  }

  // Event delegation: click on button[data-id][data-action="view-cv"] or button.view-cv
  document.addEventListener('click', function(ev){
    var btn = ev.target.closest('button[data-id]');
    if (!btn) return;
    var isView = btn.dataset.action === 'view-cv' || btn.classList.contains('view-cv');
    if (!isView) return;
    var id = btn.getAttribute('data-id');
    if (!id) return;
    var candidate = findCandidateById(id);
    if (!candidate) {
      alert('Không tìm thấy ứng viên với id ' + id);
      return;
    }
    renderCandidateToModal(candidate);
    openCandidateModal();
  });

  // Expose for testing
  window.ViewCvModule = {
    findCandidateById: findCandidateById,
    renderCandidateToModal: renderCandidateToModal,
    openCandidateModal: openCandidateModal,
    closeCandidateModal: closeCandidateModal
  };
})();
