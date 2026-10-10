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
                        <div style="flex:1;">
                            <div class="loan-title">${loan.device_name}${loan.device_color ? ` - ${loan.device_color}` : ''}</div>
                            ${statusBadge}
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                            <button onclick="window.printUserStatement('${loan.id}')" style="display:inline-flex; align-items:center; gap:6px; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:12px; font-weight:600; color:var(--text-main); cursor:pointer; transition:background 0.2s;">
                                <i data-lucide="printer" style="width:14px; height:14px;"></i> PDF / Print
                            </button>
                            <button id="btn-email-user-${loan.id}" onclick="window.emailUserStatement('${loan.id}')" style="display:inline-flex; align-items:center; gap:6px; padding:8px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; font-size:12px; font-weight:600; color:#2563eb; cursor:pointer; transition:background 0.2s;">
                                <i data-lucide="mail" style="width:14px; height:14px;"></i> Email Statement
                            </button>
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

// ─── Print / PDF Statement Logic ──────────────────────────────────────────────
window.printUserStatement = async function(loanId) {
    try {
        const res = await fetch(`/loans/${loanId}/ledger`);
        if (!res.ok) throw new Error('Failed to fetch ledger details');
        const data = await res.json();
        const l = data.loan;
        const payments = data.payments || [];

        let currentBalance = parseFloat(l.total_amount);
        let rowsHtml = `
            <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">${new Date(l.created_at).toLocaleDateString()}</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-weight:bold;">Loan Issued</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right;">-</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:bold;">₱${currentBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
            </tr>
        `;

        for (const p of payments) {
            currentBalance -= parseFloat(p.amount_paid);
            rowsHtml += `
                <tr>
                    <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">${new Date(p.payment_date).toLocaleDateString()}</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">Payment Received (${p.payment_method})</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right; color:#16a34a; font-weight:bold;">-₱${parseFloat(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right;">₱${Math.max(0, currentBalance).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                </tr>
            `;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Statement of Account - ${l.device_name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #FF4191; padding-bottom: 20px; margin-bottom: 24px; }
                    .title { color: #FF4191; font-size: 28px; font-weight: 800; margin: 0; }
                    .subtitle { font-size: 13px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
                    .info-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .info-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
                    th { background: #fce7f3; color: #831843; padding: 10px 12px; text-align: left; font-weight: 700; }
                    .summary { margin-top: 24px; padding: 20px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; text-align: center; }
                    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; }
                    @media print { body { padding: 15px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">ADC Gadgets</h1>
                    <div class="subtitle">Official Statement of Account</div>
                </div>
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-label">Customer Information</div>
                        <div style="font-weight:700; font-size:15px;">${l.full_name || 'Customer'}</div>
                        <div style="font-size:13px; color:#64748b; margin-top:4px;">${l.email || ''}</div>
                        <div style="font-size:13px; color:#64748b;">${l.mobile || ''}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Contract Overview</div>
                        <div style="font-weight:700; font-size:15px;">${l.device_name}${l.device_color ? ' - ' + l.device_color : ''}</div>
                        <div style="font-size:13px; color:#64748b; margin-top:4px;">Total SRP: ₱${parseFloat(l.total_amount).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                        <div style="font-size:13px; color:#64748b;">Monthly Amortization: ₱${parseFloat(l.monthly_payment).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                        <div style="font-size:13px; font-weight:600; color:${l.status === 'completed' ? '#16a34a' : '#FF4191'}; margin-top:2px;">Status: ${l.status.toUpperCase()}</div>
                    </div>
                </div>

                <div style="font-size:14px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.5px;">Transaction Ledger</div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th style="text-align:right;">Amount Paid</th>
                            <th style="text-align:right;">Running Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="summary">
                    <div style="font-size:18px; font-weight:800; color:#1e293b;">
                        Remaining Balance: <span style="color:#FF4191;">₱${parseFloat(l.remaining_balance).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                    </div>
                    ${l.status !== 'completed' ? `<div style="font-size:13px; color:#64748b; margin-top:6px;">Next Payment Due: ${new Date(l.next_payment_date).toLocaleDateString()}</div>` : `<div style="font-size:13px; color:#16a34a; font-weight:700; margin-top:6px;">All obligations for this device are complete. Thank you!</div>`}
                </div>

                <div class="footer">
                    Generated from ADC Gadgets Online Portal &bull; System Verified &bull; ${new Date().toLocaleDateString()}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    } catch(err) {
        console.error(err);
        if (window.showToast) window.showToast('Unable to prepare statement for printing.', 'error');
    }
};

// ─── Email Statement Logic ───────────────────────────────────────────────────
window.emailUserStatement = async function(loanId) {
    const btn = document.getElementById(`btn-email-user-${loanId}`);
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:14px; height:14px;"></i> Sending...';
        btn.disabled = true;
        lucide.createIcons();
    }

    try {
        const res = await fetch('/api/user/email-statement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loan_id: loanId })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            if (window.showToast) window.showToast('Statement of account sent to your email!', 'success');
        } else {
            if (window.showToast) window.showToast(data.error || 'Failed to send email statement.', 'error');
        }
    } catch(err) {
        console.error(err);
        if (window.showToast) window.showToast('Network error while requesting statement.', 'error');
    } finally {
        if (btn) {
            btn.innerHTML = origHtml;
            btn.disabled = false;
            lucide.createIcons();
        }
    }
};
