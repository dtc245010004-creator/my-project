(function () {
  window.RecruiterModules = window.RecruiterModules || {};

  function createRecruiterWalletApi(deps) {
    function setWalletStep(step) {
      var isStepTwo = Number(step) === 2;
      if (deps.el.walletStep1) {
        deps.el.walletStep1.classList.toggle('hidden', isStepTwo);
      }
      if (deps.el.walletStep2) {
        deps.el.walletStep2.classList.toggle('hidden', !isStepTwo);
      }
      if (deps.el.walletHistorySection) {
        deps.el.walletHistorySection.style.display = isStepTwo ? 'none' : 'grid';
      }
      if (deps.el.walletFooterActions) {
        deps.el.walletFooterActions.style.display = isStepTwo ? 'none' : 'grid';
      }
    }

    function stopWalletCountdown() {
      clearInterval(deps.state.walletCountdownTimer);
      deps.state.walletCountdownTimer = null;
      deps.state.walletCountdownDeadline = 0;
    }

    function renderWalletCountdown() {
      if (!deps.el.walletQrTimer) return;

      var remainingMs = deps.state.walletCountdownDeadline - Date.now();
      if (remainingMs <= 0) {
        deps.el.walletQrTimer.textContent = '00:00:00';
        if (deps.el.btnCreateDeposit) {
          deps.el.btnCreateDeposit.disabled = true;
        }
        stopWalletCountdown();
        return;
      }

      var totalSeconds = Math.floor(remainingMs / 1000);
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      deps.el.walletQrTimer.textContent =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    }

    function startWalletCountdown() {
      stopWalletCountdown();
      deps.state.walletCountdownDeadline = Date.now() + (10 * 60 * 1000);
      if (deps.el.btnCreateDeposit) {
        deps.el.btnCreateDeposit.disabled = false;
      }
      renderWalletCountdown();
      deps.state.walletCountdownTimer = setInterval(renderWalletCountdown, 1000);
    }

    function updateGenerateQrState() {
      if (!deps.el.btnGenerateQr) return;
      var amount = deps.parseVndAmount(deps.el.depositAmount ? deps.el.depositAmount.value : 0);
      deps.el.btnGenerateQr.disabled = amount < 10000;
    }

    function generateAutoTransferNote() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter || {};
      var key = recruiter.id ? String(recruiter.id) : String(recruiter.email || 'EMP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      var now = new Date();
      var yy = String(now.getFullYear()).slice(-2);
      var mm = String(now.getMonth() + 1).padStart(2, '0');
      var dd = String(now.getDate()).padStart(2, '0');
      var hh = String(now.getHours()).padStart(2, '0');
      var mi = String(now.getMinutes()).padStart(2, '0');
      var ss = String(now.getSeconds()).padStart(2, '0');
      return 'EMP' + key + yy + mm + dd + hh + mi + ss;
    }

    function copyWalletValue(targetId) {
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;

      var text = String(target.textContent || '').trim();
      if (!text) return;

      var showCopied = function () {
        if (!deps.el.walletCopyToast) return;
        deps.el.walletCopyToast.textContent = 'Da copy: ' + text;
        clearTimeout(deps.state.walletCopyToastTimer);
        deps.state.walletCopyToastTimer = setTimeout(function () {
          if (deps.el.walletCopyToast) {
            deps.el.walletCopyToast.textContent = '';
          }
        }, 1400);
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(showCopied).catch(function () {});
        return;
      }

      var area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        showCopied();
      } catch (e) {
        // ignore copy fallback errors
      }
      document.body.removeChild(area);
    }

    function getAllTransactions() {
      return deps.readCollection(deps.STORAGE.TRANSACTIONS, deps.STORAGE.LEGACY_TRANSACTIONS);
    }

    function saveAllTransactions(items) {
      deps.writeCollection(deps.STORAGE.TRANSACTIONS, deps.STORAGE.LEGACY_TRANSACTIONS, items);
    }

    function renderWalletInfo() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!recruiter) return;

      var balance = Number(recruiter.balance || 0);
      if (deps.el.walletBalanceText) {
        deps.el.walletBalanceText.textContent = deps.formatCurrency(balance);
      }

      if (!deps.el.walletHistoryList) {
        renderWalletQr();
        return;
      }

      var tx = Array.isArray(recruiter.transactions) ? recruiter.transactions.slice() : [];
      tx.sort(function (a, b) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      if (!tx.length) {
        deps.el.walletHistoryList.innerHTML = '<div class="empty-note">Chưa có giao dịch.</div>';
        renderWalletQr();
        return;
      }

      deps.el.walletHistoryList.innerHTML = tx.slice(0, 8).map(function (item) {
        var status = item.status || 'Success';
        var sign = item.direction === 'out' ? '-' : '+';
        return (
          '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;">' +
            '<div style="font-weight:700;color:#334155;">' + deps.escapeHtml(item.note || item.type || 'Giao dịch') + '</div>' +
            '<div style="display:flex;justify-content:space-between;gap:8px;color:#64748b;">' +
              '<span>' + deps.escapeHtml(status) + ' • ' + deps.escapeHtml(deps.formatDateTime(item.createdAt)) + '</span>' +
              '<strong style="color:' + (item.direction === 'out' ? '#b91c1c' : '#047857') + ';">' + sign + deps.formatCurrency(item.amount) + '</strong>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      renderWalletQr();
    }

    function buildWalletQrPayload() {
      var amount = deps.parseVndAmount(deps.el.depositAmount ? deps.el.depositAmount.value : 0);
      var finalAmount = amount > 0 ? amount : 100000;
      var finalNote = deps.state.walletGeneratedNote || generateAutoTransferNote();

      return {
        amount: finalAmount,
        note: finalNote
      };
    }

    function buildVietQrImageUrl(amount, note) {
      var bankCode = encodeURIComponent(deps.QR_PAYMENT_INFO.bankCode);
      var accountNo = encodeURIComponent(deps.QR_PAYMENT_INFO.accountNo);
      var accountName = encodeURIComponent(deps.QR_PAYMENT_INFO.accountName);
      var addInfo = encodeURIComponent(note);
      return 'https://img.vietqr.io/image/' + bankCode + '-' + accountNo + '-compact2.png?amount=' + String(amount) + '&addInfo=' + addInfo + '&accountName=' + accountName;
    }

    function renderWalletQr() {
      if (!deps.el.walletQrImage) return;

      var payload = buildWalletQrPayload();
      deps.el.walletQrImage.src = buildVietQrImageUrl(payload.amount, payload.note);
      deps.el.walletQrImage.alt = 'QR chuyển khoản employer';

      var labelAmount = deps.formatCurrency(payload.amount);

      if (deps.el.qrBankValue) deps.el.qrBankValue.textContent = deps.QR_PAYMENT_INFO.bank;
      if (deps.el.qrAccountNameValue) deps.el.qrAccountNameValue.textContent = deps.QR_PAYMENT_INFO.accountName;
      if (deps.el.qrAccountNoValue) deps.el.qrAccountNoValue.textContent = deps.QR_PAYMENT_INFO.accountNo;
      if (deps.el.qrAmountValue) deps.el.qrAmountValue.textContent = labelAmount;
      if (deps.el.qrNoteValue) deps.el.qrNoteValue.textContent = payload.note;

      if (deps.el.walletQrText) {
        deps.el.walletQrText.textContent = 'Quet QR de vao app ngan hang voi noi dung chuyen khoan da dien san: ' + payload.note + ' • So tien: ' + labelAmount;
      }
    }

    function handleGenerateQr() {
      var amount = deps.parseVndAmount(deps.el.depositAmount ? deps.el.depositAmount.value : 0);

      if (amount < 10000) {
        deps.showToast('Số tiền nạp tối thiểu là 10.000đ.', 'error');
        return;
      }

      deps.state.walletGeneratedNote = generateAutoTransferNote();

      if (deps.el.walletCopyToast) {
        deps.el.walletCopyToast.textContent = '';
      }

      setWalletStep(2);
      renderWalletQr();
      startWalletCountdown();
    }

    function createDepositRequest() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!recruiter) return;

      var payload = buildWalletQrPayload();
      var amount = Number(payload.amount || 0);
      var note = String(payload.note || '').trim();

      if (!deps.state.walletCountdownDeadline || deps.state.walletCountdownDeadline <= Date.now()) {
        deps.showToast('Ma QR da het han. Vui long tao ma thanh toan moi.', 'error');
        if (deps.el.btnCreateDeposit) {
          deps.el.btnCreateDeposit.disabled = true;
        }
        return;
      }

      if (!amount || amount < 10000) {
        deps.showToast('Số tiền nạp tối thiểu là 10.000đ.', 'error');
        return;
      }

      var now = new Date().toISOString();
      var transaction = {
        id: Date.now(),
        type: 'deposit',
        direction: 'in',
        amount: amount,
        note: note,
        status: 'Pending',
        recruiterId: recruiter.id,
        recruiterEmail: recruiter.email,
        createdAt: now
      };

      var allTransactions = getAllTransactions();
      allTransactions.unshift(transaction);
      saveAllTransactions(allTransactions);

      var users = deps.getStoredUsers().map(function (user) {
        if (Number(user.id) !== Number(recruiter.id)) return user;
        var ownTx = Array.isArray(user.transactions) ? user.transactions.slice() : [];
        ownTx.unshift(transaction);
        return Object.assign({}, user, { transactions: ownTx });
      });

      deps.writeJson('users', users);
      deps.state.users = users;
      deps.state.recruiter = deps.getStoredUserRecord() || deps.state.recruiter;

      if (deps.el.depositAmount) deps.el.depositAmount.value = '';
      if (deps.el.depositNote) deps.el.depositNote.value = '';
      deps.state.walletGeneratedNote = '';

      stopWalletCountdown();
      if (deps.el.walletQrTimer) {
        deps.el.walletQrTimer.textContent = '00:10:00';
      }

      setWalletStep(1);
      updateGenerateQrState();

      renderWalletInfo();
      deps.showToast('Đã tạo yêu cầu nạp tiền, chờ Admin duyệt.', 'success');
    }

    function openWalletModal() {
      var recruiter = deps.getStoredUserRecord() || deps.state.recruiter;
      if (!deps.el.walletModalBackdrop || !recruiter) {
        return;
      }

      if (deps.el.walletModalTitle) {
        deps.el.walletModalTitle.textContent = 'Thanh toán / Ví';
      }

      if (deps.el.depositAmount) deps.el.depositAmount.value = '';
      if (deps.el.depositNote) deps.el.depositNote.value = '';
      if (deps.el.walletCopyToast) deps.el.walletCopyToast.textContent = '';
      deps.state.walletGeneratedNote = '';

      stopWalletCountdown();
      if (deps.el.walletQrTimer) {
        deps.el.walletQrTimer.textContent = '00:10:00';
      }

      setWalletStep(1);
      updateGenerateQrState();
      renderWalletInfo();

      deps.el.walletModalBackdrop.style.display = 'flex';
    }

    function closeWalletModal() {
      if (!deps.el.walletModalBackdrop) {
        return;
      }

      stopWalletCountdown();
      deps.el.walletModalBackdrop.style.display = 'none';
    }

    return {
      setWalletStep: setWalletStep,
      stopWalletCountdown: stopWalletCountdown,
      renderWalletCountdown: renderWalletCountdown,
      startWalletCountdown: startWalletCountdown,
      updateGenerateQrState: updateGenerateQrState,
      generateAutoTransferNote: generateAutoTransferNote,
      copyWalletValue: copyWalletValue,
      getAllTransactions: getAllTransactions,
      saveAllTransactions: saveAllTransactions,
      renderWalletInfo: renderWalletInfo,
      buildWalletQrPayload: buildWalletQrPayload,
      buildVietQrImageUrl: buildVietQrImageUrl,
      renderWalletQr: renderWalletQr,
      handleGenerateQr: handleGenerateQr,
      createDepositRequest: createDepositRequest,
      openWalletModal: openWalletModal,
      closeWalletModal: closeWalletModal
    };
  }

  window.RecruiterModules.Wallet = {
    createRecruiterWalletApi: createRecruiterWalletApi
  };
})();