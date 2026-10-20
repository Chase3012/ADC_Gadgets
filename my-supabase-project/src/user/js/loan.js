// src/user/js/loan.js

document.addEventListener('DOMContentLoaded', async () => {
    const loanContainer = document.getElementById('loan-container');

    // ── Auth check ───────────────────────────────────────────────────────────────
    const storedUser = localStorage.getItem('customer_user');
    let user = null;
    if (storedUser) {
        try { user = JSON.parse(storedUser); } catch(e){}
    }
    if (!user) {
        window.location.href = '/src/user/login.html';
        return;
    }

    // Set greeting name and ensure sidebar profile details are updated
    const firstName = user.email.split('@')[0] || 'there';
    document.getElementById('hero-first-name').textContent = firstName;

    const sbUserName = document.getElementById('sb-user-name');
    const sbUserEmail = document.getElementById('sb-user-email');
    const sbAvatar = document.getElementById('sb-avatar-img');
    const email = user.email || '—';
    const fullName = user.full_name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const initial = fullName.charAt(0).toUpperCase();

    if (sbUserName) sbUserName.textContent = fullName;
    if (sbUserEmail) sbUserEmail.textContent = email;
    if (sbAvatar) {
        const gradients = {
            blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            pink: 'linear-gradient(135deg, #FF4191, #d9266e)',
            emerald: 'linear-gradient(135deg, #10b981, #047857)',
            amber: 'linear-gradient(135deg, #f59e0b, #b45309)',
            purple: 'linear-gradient(135deg, #8b5cf6, #5b21b6)'
        };
        const acolor = user.avatar_color || 'blue';
        sbAvatar.style.background = gradients[acolor] || gradients.blue;
        sbAvatar.textContent = initial;
    }

    // ── Load Loans ───────────────────────────────────────────────────────────────
    async function loadLoans() {
        // Handle PayMongo return URLs
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const returnLoanId  = urlParams.get('loan_id');
        let sessionId       = urlParams.get('session_id');

        if (sessionId === '{id}' || sessionId === '%7Bid%7D' || !sessionId) {
            sessionId = null;
        }

        // Check sessionStorage for session saved before redirect
        try {
            const saved = JSON.parse(sessionStorage.getItem('pending_paymongo_payment') || '{}');
            if (saved.session_id && (!returnLoanId || saved.loan_id === returnLoanId)) {
                if (!sessionId) sessionId = saved.session_id;
            }
        } catch(e) {}

        if (paymentStatus === 'success' && returnLoanId) {
            // Clean URL immediately so refresh doesn't retrigger
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('pending_paymongo_payment');

            // Call server to confirm payment, update method + balance + next_date
            try {
                const confirmRes = await fetch('/pay/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, loan_id: returnLoanId })
                });
                const confirmData = await confirmRes.json();
                if (confirmRes.ok) {
                    const msg = `Payment of ₱${Number(confirmData.amount_paid).toLocaleString(undefined,{minimumFractionDigits:2})} via ${confirmData.payment_method} was successful!`;
                    if (window.showToast) window.showToast(msg, 'success');
                    else alert(msg);
                } else {
                    console.error('Confirm error:', confirmData.error);
                    if (window.showToast) window.showToast(confirmData.error || 'Payment recorded. Details may take a moment to update.', 'success');
                }
            } catch (err) {
                console.error('Confirm fetch error:', err);
                if (window.showToast) window.showToast('Payment confirmed. Loading details...', 'info');
            }
        } else if (paymentStatus === 'cancel') {
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('pending_paymongo_payment');
            if (window.showToast) window.showToast('Payment was cancelled.', 'error');
        }

        try {
            const res = await fetch('/loans?user_id=' + user.id + '&all=true');
            if (!res.ok) throw new Error('Failed to fetch loans');
            const loans = await res.json();

            if (!loans || loans.length === 0) {
                loanContainer.innerHTML = `
                    <div style="text-align:center; padding: 60px; color:var(--text-muted);">
                        <i data-lucide="package" style="width:48px;height:48px; margin-bottom:16px;"></i>
                        <p style="font-size:16px; font-weight:500;">You have no active loans.</p>
                        <a href="devices.html" style="display:inline-flex; align-items:center; gap:8px; margin-top:16px; padding:10px 20px; background:var(--pink); color:#fff; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; box-shadow:0 4px 12px rgba(255,65,145,0.3);">
                            <i data-lucide="shopping-bag" style="width:16px; height:16px;"></i> Browse Devices
                        </a>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            loanContainer.innerHTML = '';

            const activeLoans = loans.filter(l => l.status !== 'completed' && parseFloat(l.remaining_balance) >= 1);
            const completedLoans = loans.filter(l => l.status === 'completed' || parseFloat(l.remaining_balance) < 1);

            // Case 1: No active loans, but has completed loans
            if (activeLoans.length === 0 && completedLoans.length > 0) {
                const completeContainer = document.createElement('div');
                completeContainer.className = 'loan-item';
                completeContainer.style.borderBottom = 'none';
                completeContainer.innerHTML = `
                    <div style="text-align:center; padding:36px 20px; background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; margin-bottom:32px;">
                        <div style="width:52px; height:52px; border-radius:50%; background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                            <i data-lucide="check-circle-2" style="width:28px; height:28px;"></i>
                        </div>
                        <h3 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:6px;">All Loans Completed</h3>
                        <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">You have no active payments due. All your device installment contracts are fully settled.</p>
                        <a href="devices.html" style="display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:var(--pink); color:#fff; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; box-shadow:0 4px 12px rgba(255,65,145,0.3);">
                            <i data-lucide="shopping-bag" style="width:16px; height:16px;"></i> Browse New Devices
                        </a>
                    </div>
                    ${buildPreviousLoansMarkup(completedLoans)}
                `;
                loanContainer.appendChild(completeContainer);
                bindPreviousLoanToggles(completeContainer);
                lucide.createIcons();
                return;
            }

            // Case 2: User has active loans
            activeLoans.forEach(loan => {
                const progress = ((loan.total_amount - loan.remaining_balance) / loan.total_amount) * 100;
                const nextDate = new Date(loan.next_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const totalMonths     = loan.term_months ? parseInt(loan.term_months) : Math.ceil(loan.total_amount / loan.monthly_payment);
                const monthsRemaining = Math.ceil(loan.remaining_balance / loan.monthly_payment);
                const monthsPaid      = Math.max(0, totalMonths - monthsRemaining);
                const imgPath = loan.device_image && loan.device_image.includes('/') ? loan.device_image : `/images/phones/${loan.device_image || 'default.png'}`;

                const item = document.createElement('div');
                item.className = 'loan-item';
                item.innerHTML = `
                    <div class="loan-header">
                        <img src="${imgPath}" alt="${loan.device_name}" class="loan-img">
                        <div style="flex:1;">
                            <div class="loan-title">${loan.device_name}${loan.device_color ? ` - ${loan.device_color}` : ''}</div>
                            <div class="loan-status"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> Active Loan</div>
                        </div>
                    </div>

                    <div class="loan-tabs">
                        <button class="loan-tab active" data-tab="details-${loan.id}">Device Details</button>
                        <button class="loan-tab" data-tab="balance-${loan.id}">Remaining Balance</button>
                        <button class="loan-tab" data-tab="schedule-${loan.id}">Payment Schedule</button>
                        <button class="loan-tab" data-tab="history-${loan.id}">Payment History</button>
                    </div>

                    <div class="loan-tab-content active" id="details-${loan.id}">
                        <div class="loan-info-grid">
                            <div class="info-group">
                                <span class="info-label">Next Payment Due</span>
                                <span class="info-value" style="color:#ef4444;">${nextDate}</span>
                            </div>
                            <div class="info-group">
                                <span class="info-label">Monthly Installment</span>
                                <span class="info-value highlight">₱${Number(loan.monthly_payment).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <div style="margin-top:24px; text-align:center;">
                            <button class="btn-primary pay-btn" data-loan="${loan.id}"
                                style="display:inline-block; width:100%; max-width:300px; padding:14px;
                                background:linear-gradient(135deg, var(--pink), #ff6eaa); color:white;
                                border:none; cursor:pointer; font-family:inherit; font-weight:600;
                                border-radius:8px; font-size:15px; box-shadow:0 4px 12px rgba(255,65,145,0.3);
                                transition:transform 0.2s ease;">
                                Pay Now
                            </button>
                        </div>
                    </div>

                    <div class="loan-tab-content" id="balance-${loan.id}">
                        <div class="loan-info-grid">
                            <div class="info-group">
                                <span class="info-label">Total Amount</span>
                                <span class="info-value">₱${Number(loan.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div class="info-group">
                                <span class="info-label">Remaining Balance</span>
                                <span class="info-value">₱${Number(loan.remaining_balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <div class="progress-wrap">
                            <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                                <span>Progress</span><span>${Math.round(progress)}% Paid</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width:${progress}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="loan-tab-content" id="schedule-${loan.id}">
                        <div class="loan-info-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                            <div class="info-group">
                                <span class="info-label">Agreed Term</span>
                                <span class="info-value">${totalMonths} Months</span>
                            </div>
                            <div class="info-group">
                                <span class="info-label">Months Paid</span>
                                <span class="info-value">${monthsPaid} Months</span>
                            </div>
                            <div class="info-group">
                                <span class="info-label">Months Remaining</span>
                                <span class="info-value highlight">${monthsRemaining} Months</span>
                            </div>
                        </div>
                    </div>

                    <div class="loan-tab-content" id="history-${loan.id}">
                        <div style="font-size:13px; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px; margin-bottom:12px;">
                            Payments for this Loan
                        </div>
                        <div class="loan-history-container" id="history-container-${loan.id}">
                            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                                <i data-lucide="loader-2" class="spin" style="width:24px;height:24px;"></i>
                                <p style="font-size:14px; margin-top:12px;">Loading history...</p>
                            </div>
                        </div>

                        ${completedLoans.length > 0 ? buildPreviousLoansMarkup(completedLoans) : ''}
                    </div>
                `;
                loanContainer.appendChild(item);

                // Load payment history asynchronously for this active loan
                fetch(`/loans/${loan.id}/payments`)
                    .then(r => r.json())
                    .then(payments => {
                        const hc = document.getElementById(`history-container-${loan.id}`);
                        if (!hc) return;
                        if (!payments || payments.length === 0) {
                            hc.innerHTML = '<div style="text-align:center; padding:32px 20px; color:var(--text-muted); font-size:14px;">No payments recorded yet for this loan.</div>';
                            return;
                        }
                        let html = '<div class="history-list" style="display:flex; flex-direction:column; gap:12px;">';
                        payments.forEach(p => {
                            const date = new Date(p.payment_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
                            html += `
                                <div class="history-item" style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; border-radius:50%; background:rgba(34,197,94,0.1); color:var(--success); display:flex; align-items:center; justify-content:center;">
                                            <i data-lucide="check" style="width:20px; height:20px;"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight:600; color:var(--text-main); font-size:15px;">
                                                Payment <span style="font-weight:400; font-size:13px; color:var(--g500); margin-left:4px;">via ${p.payment_method === 'cash' ? 'Cash (Admin)' : (p.payment_method || 'GCash / Maya')}</span>
                                            </div>
                                            <div style="color:var(--text-muted); font-size:13px;">${date}</div>
                                        </div>
                                    </div>
                                    <div style="font-weight:700; color:var(--text-main); font-size:16px;">
                                        ₱${parseFloat(p.amount_paid).toLocaleString(undefined, {minimumFractionDigits:2})}
                                    </div>
                                </div>
                            `;
                        });
                        html += '</div>';
                        hc.innerHTML = html;
                        lucide.createIcons({ root: hc });
                    })
                    .catch(() => {
                        const hc = document.getElementById(`history-container-${loan.id}`);
                        if (hc) hc.innerHTML = '<div style="text-align:center; padding:32px 20px; color:var(--danger); font-size:14px;">Failed to load history.</div>';
                    });

                // Tab switching
                item.querySelectorAll('.loan-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        item.querySelectorAll('.loan-tab').forEach(t => t.classList.remove('active'));
                        item.querySelectorAll('.loan-tab-content').forEach(c => c.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        item.querySelector('#' + e.currentTarget.dataset.tab).classList.add('active');
                    });
                });

                // Pay Now
                const payBtnEl = item.querySelector('.pay-btn');
                if (payBtnEl) payBtnEl.addEventListener('click', async (e) => {
                    const payBtn = e.currentTarget;
                    const loanId = payBtn.dataset.loan;
                    const originalText = payBtn.textContent;

                    payBtn.textContent = 'Processing...';
                    payBtn.disabled = true;
                    payBtn.style.opacity = '0.7';

                    try {
                        const res = await fetch('/pay', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                loan_id: loanId,
                                user_id: user.id
                            })
                        });
                        const data = await res.json();

                        if (res.ok && data.checkout_url) {
                            if (data.session_id) {
                                sessionStorage.setItem('pending_paymongo_payment', JSON.stringify({
                                    session_id: data.session_id,
                                    loan_id: loanId
                                }));
                            }
                            window.location.href = data.checkout_url;
                        } else {
                            const errText = data.error || 'Failed to start payment.';
                            if (window.showToast) window.showToast(errText, 'error');
                            else console.error(errText);
                            payBtn.textContent = originalText;
                            payBtn.disabled = false;
                            payBtn.style.opacity = '1';
                        }
                    } catch (err) {
                        console.error(err);
                        if (window.showToast) window.showToast('Network error. Please try again.', 'error');
                        payBtn.textContent = originalText;
                        payBtn.disabled = false;
                        payBtn.style.opacity = '1';
                    }
                });

                // Bind previous loans toggles inside this item if any
                bindPreviousLoanToggles(item);
            });

            lucide.createIcons();

        } catch (err) {
            console.error('Error fetching loans:', err);
            loanContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:40px;">Failed to load loans.</p>';
        }
    }

    // ── Helper: Build Previous Loans Markup ─────────────────────────────────────────
    function buildPreviousLoansMarkup(completedLoans) {
        if (!completedLoans || completedLoans.length === 0) return '';

        let html = `
            <div class="prev-loans-section">
                <div class="prev-loans-header">
                    <h4 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="history" style="width:18px; height:18px; color:var(--pink);"></i>
                        Previous Loans
                    </h4>
                    <span style="font-size:12px; color:var(--text-muted); font-weight:500;">
                        ${completedLoans.length} completed ${completedLoans.length === 1 ? 'loan' : 'loans'}
                    </span>
                </div>
                <div class="prev-loans-list" style="display:flex; flex-direction:column; gap:12px;">
        `;

        completedLoans.forEach(cLoan => {
            const cImg = cLoan.device_image && cLoan.device_image.includes('/')
                ? cLoan.device_image
                : `/images/phones/${cLoan.device_image || 'default.png'}`;
            const cTotal = Number(cLoan.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
            const cMonthly = Number(cLoan.monthly_payment).toLocaleString(undefined, { minimumFractionDigits: 2 });
            const cTerm = cLoan.term_months || Math.ceil(cLoan.total_amount / cLoan.monthly_payment) || 24;

            html += `
                <div class="prev-loan-card" id="prev-loan-card-${cLoan.id}">
                    <div class="prev-loan-toggle" data-loan-id="${cLoan.id}">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <img src="${cImg}" alt="${cLoan.device_name}" style="width:44px; height:44px; object-fit:contain; border-radius:8px; background:#fff; padding:2px; border:1px solid #e2e8f0;">
                            <div>
                                <div style="font-size:15px; font-weight:600; color:var(--text-main);">
                                    ${cLoan.device_name}${cLoan.device_color ? ' - ' + cLoan.device_color : ''}
                                </div>
                                <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; color:#16a34a; margin-top:2px;">
                                    <i data-lucide="check-circle-2" style="width:13px; height:13px;"></i> Fully Paid
                                </div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:16px;">
                            <div style="text-align:right;">
                                <div style="font-size:14px; font-weight:700; color:var(--text-main);">₱${cTotal}</div>
                                <div style="font-size:12px; color:var(--text-muted);">${cTerm} Months Term</div>
                            </div>
                            <div style="color:var(--text-muted); display:flex; align-items:center;">
                                <i data-lucide="chevron-down" class="prev-chevron" id="chevron-${cLoan.id}" style="width:20px; height:20px;"></i>
                            </div>
                        </div>
                    </div>

                    <div class="prev-loan-details" id="details-prev-${cLoan.id}">
                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; align-items:center; gap:10px; color:#166534; font-size:13px; font-weight:600;">
                            <i data-lucide="shield-check" style="width:18px; height:18px; flex-shrink:0;"></i>
                            <span>All installments for this device are complete and fully settled.</span>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:16px; margin-bottom:20px; padding:16px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
                            <div>
                                <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:600; letter-spacing:0.5px;">Total Contract</div>
                                <div style="font-size:15px; font-weight:700; color:var(--text-main); margin-top:2px;">₱${cTotal}</div>
                            </div>
                            <div>
                                <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:600; letter-spacing:0.5px;">Monthly Payment</div>
                                <div style="font-size:15px; font-weight:700; color:var(--text-main); margin-top:2px;">₱${cMonthly}</div>
                            </div>
                            <div>
                                <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:600; letter-spacing:0.5px;">Term Length</div>
                                <div style="font-size:15px; font-weight:700; color:var(--text-main); margin-top:2px;">${cTerm} Months</div>
                            </div>
                            <div>
                                <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:600; letter-spacing:0.5px;">Remaining Balance</div>
                                <div style="font-size:15px; font-weight:700; color:#16a34a; margin-top:2px;">₱0.00</div>
                            </div>
                        </div>

                        <div>
                            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px; margin-bottom:10px;">
                                Payment Ledger (${cLoan.device_name})
                            </div>
                            <div class="prev-loan-payments-container" id="prev-payments-${cLoan.id}">
                                <div style="text-align:center; padding:16px; color:var(--text-muted); font-size:13px;">
                                    <i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> Loading payments...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    // ── Helper: Bind Previous Loan Accordion Toggles ─────────────────────────────
    function bindPreviousLoanToggles(container) {
        container.querySelectorAll('.prev-loan-toggle').forEach(toggle => {
            toggle.addEventListener('click', async () => {
                const loanId = toggle.dataset.loanId;
                const detailsEl = container.querySelector(`#details-prev-${loanId}`);
                const chevronEl = container.querySelector(`#chevron-${loanId}`);
                if (!detailsEl) return;

                const isOpen = detailsEl.classList.contains('open');
                if (isOpen) {
                    detailsEl.classList.remove('open');
                    if (chevronEl) chevronEl.classList.remove('open');
                } else {
                    detailsEl.classList.add('open');
                    if (chevronEl) chevronEl.classList.add('open');

                    // Load payments for this completed loan if not loaded
                    const paymentsContainer = container.querySelector(`#prev-payments-${loanId}`);
                    if (paymentsContainer && !paymentsContainer.dataset.loaded) {
                        try {
                            const res = await fetch(`/loans/${loanId}/payments`);
                            const payments = await res.json();
                            paymentsContainer.dataset.loaded = 'true';
                            if (!payments || payments.length === 0) {
                                paymentsContainer.innerHTML = '<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:13px;">No recorded transactions found.</div>';
                                return;
                            }
                            let pHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
                            payments.forEach(p => {
                                const date = new Date(p.payment_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
                                pHtml += `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <div style="width:28px; height:28px; border-radius:50%; background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center;">
                                                <i data-lucide="check" style="width:14px; height:14px;"></i>
                                            </div>
                                            <div>
                                                <div style="font-weight:600; color:var(--text-main); font-size:13px;">
                                                    Payment <span style="font-weight:400; color:var(--text-muted); margin-left:4px;">via ${p.payment_method === 'cash' ? 'Cash (Admin)' : (p.payment_method || 'GCash / Maya')}</span>
                                                </div>
                                                <div style="color:var(--text-muted); font-size:12px;">${date}</div>
                                            </div>
                                        </div>
                                        <div style="font-weight:700; color:var(--text-main); font-size:14px;">
                                            ₱${parseFloat(p.amount_paid).toLocaleString(undefined, {minimumFractionDigits:2})}
                                        </div>
                                    </div>
                                `;
                            });
                            pHtml += '</div>';
                            paymentsContainer.innerHTML = pHtml;
                            lucide.createIcons({ root: paymentsContainer });
                        } catch (err) {
                            console.error('Error loading previous payments:', err);
                            paymentsContainer.innerHTML = '<div style="color:var(--danger); font-size:13px; text-align:center;">Failed to load payment history.</div>';
                        }
                    }
                }
            });
        });
    }

    // Init
    loadLoans();
});
