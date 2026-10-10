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

    // Set greeting name
    const firstName = user.email.split('@')[0] || 'there';
    document.getElementById('hero-first-name').textContent = firstName;

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
            const res = await fetch('/loans?user_id=' + user.id);
            if (!res.ok) throw new Error('Failed to fetch loans');
            const loans = await res.json();

            if (!loans || loans.length === 0) {
                loanContainer.innerHTML = `
                    <div style="text-align:center; padding: 60px; color:var(--text-muted);">
                        <i data-lucide="package" style="width:48px;height:48px; margin-bottom:16px;"></i>
                        <p>You have no active loans.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            loanContainer.innerHTML = '';

            loans.forEach(loan => {
                const progress = ((loan.total_amount - loan.remaining_balance) / loan.total_amount) * 100;
                const nextDate = new Date(loan.next_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const totalMonths    = loan.term_months ? parseInt(loan.term_months) : Math.ceil(loan.total_amount / loan.monthly_payment);
                const monthsRemaining = Math.ceil(loan.remaining_balance / loan.monthly_payment);
                const monthsPaid     = Math.max(0, totalMonths - monthsRemaining);
                const imgPath = loan.device_image.includes('/') ? loan.device_image : `/images/phones/${loan.device_image}`;

                const item = document.createElement('div');
                item.className = 'loan-item';
                const isCompleted = loan.status === 'completed' || parseFloat(loan.remaining_balance) < 1;
                const statusBadge = isCompleted
                    ? `<div class="loan-status" style="color:#22c55e;"><i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> Loan Fully Paid</div>`
                    : `<div class="loan-status"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> Active Loan</div>`;
                item.innerHTML = `
                    <div class="loan-header">
                        <img src="${imgPath}" alt="${loan.device_name}" class="loan-img">
                        <div>
                            <div class="loan-title">${loan.device_name}${loan.device_color ? ` - ${loan.device_color}` : ''}</div>
                            ${statusBadge}
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
                            ${!isCompleted ? `<button class="btn-primary pay-btn" data-loan="${loan.id}"
                                style="display:inline-block; width:100%; max-width:300px; padding:14px;
                                background:linear-gradient(135deg, var(--pink), #ff6eaa); color:white;
                                border:none; cursor:pointer; font-family:inherit; font-weight:600;
                                border-radius:8px; font-size:15px; box-shadow:0 4px 12px rgba(255,65,145,0.3);
                                transition:transform 0.2s ease;">
                                Pay Now
                            </button>` : `<div style="padding:14px; background:rgba(34,197,94,0.08); border-radius:8px; border:1px solid rgba(34,197,94,0.2); color:#16a34a; font-weight:600; font-size:14px;">
                                ✅ This loan has been fully paid. Thank you!
                            </div>`}
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
                        <div class="loan-history-container" id="history-container-${loan.id}">
                            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                                <i data-lucide="loader-2" class="spin" style="width:24px;height:24px;"></i>
                                <p style="font-size:14px; margin-top:12px;">Loading history...</p>
                            </div>
                        </div>
                    </div>
                `;
                loanContainer.appendChild(item);

                // Load payment history asynchronously
                fetch(`/loans/${loan.id}/payments`)
                    .then(r => r.json())
                    .then(payments => {
                        const hc = document.getElementById(`history-container-${loan.id}`);
                        if (!hc) return;
                        if (payments.length === 0) {
                            hc.innerHTML = '<div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:14px;">No payments recorded yet.</div>';
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
                        if (hc) hc.innerHTML = '<div style="text-align:center; padding:40px 20px; color:var(--danger); font-size:14px;">Failed to load history.</div>';
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

                // Pay Now — directly redirects to PayMongo (GCash & Maya only)
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
                            alert(data.error || 'Failed to start payment.');
                            payBtn.textContent = originalText;
                            payBtn.disabled = false;
                            payBtn.style.opacity = '1';
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Network error. Please try again.');
                        payBtn.textContent = originalText;
                        payBtn.disabled = false;
                        payBtn.style.opacity = '1';
                    }
                });
            });

            lucide.createIcons();

        } catch (err) {
            console.error('Error fetching loans:', err);
            loanContainer.innerHTML = '<p style="color:var(--text-muted);">Failed to load loans.</p>';
        }
    }

    // Init
    loadLoans();
});
