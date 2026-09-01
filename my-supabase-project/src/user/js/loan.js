// src/user/js/loan.js

document.addEventListener('DOMContentLoaded', async () => {
    const loanContainer = document.getElementById('loan-container');
    
    // Check auth
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = '../../index.html';
        return;
    }
    
    // Set First Name
    const firstName = session.user.user_metadata.full_name?.split(' ')[0] || 'there';
    document.getElementById('hero-first-name').textContent = firstName;

    async function loadLoans() {
        const { data: loans, error } = await supabaseClient
            .from('loans')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching loans:', error);
            loanContainer.innerHTML = '<p style="color:var(--text-muted);">Failed to load loans.</p>';
            return;
        }

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
            
            const totalMonths = Math.ceil(loan.total_amount / loan.monthly_payment);
            const monthsRemaining = Math.ceil(loan.remaining_balance / loan.monthly_payment);
            const monthsPaid = Math.max(0, totalMonths - monthsRemaining);

            const item = document.createElement('div');
            item.className = 'loan-item';
            item.innerHTML = `
                <div class="loan-header">
                    <img src="${loan.device_image}" alt="${loan.device_name}" class="loan-img">
                    <div>
                        <div class="loan-title">${loan.device_name}</div>
                        <div class="loan-status">
                            <i data-lucide="check-circle" style="width:14px;height:14px;"></i> Active Loan
                        </div>
                    </div>
                </div>
                
                <div class="loan-tabs">
                    <button class="loan-tab active" data-tab="details-${loan.id}">Device Details</button>
                    <button class="loan-tab" data-tab="balance-${loan.id}">Remaining Balance</button>
                    <button class="loan-tab" data-tab="schedule-${loan.id}">Payment Schedule</button>
                </div>
                
                <div class="loan-tab-content active" id="details-${loan.id}">
                    <div class="loan-info-grid">
                        <div class="info-group">
                            <span class="info-label">Next Payment Due</span>
                            <span class="info-value" style="color: #ef4444;">${nextDate}</span>
                        </div>
                        <div class="info-group">
                            <span class="info-label">Monthly Installment</span>
                            <span class="info-value highlight">₱${loan.monthly_payment.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                <div class="loan-tab-content" id="balance-${loan.id}">
                    <div class="loan-info-grid">
                        <div class="info-group">
                            <span class="info-label">Total Amount</span>
                            <span class="info-value">₱${loan.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="info-group">
                            <span class="info-label">Remaining Balance</span>
                            <span class="info-value">₱${loan.remaining_balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    
                    <div class="progress-wrap">
                        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                            <span>Progress</span>
                            <span>${Math.round(progress)}% Paid</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
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
            `;
            loanContainer.appendChild(item);
        });

        lucide.createIcons();

        // Attach tab listeners
        document.querySelectorAll('.loan-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.tab;
                const item = e.currentTarget.closest('.loan-item');
                
                // Remove active classes
                item.querySelectorAll('.loan-tab').forEach(t => t.classList.remove('active'));
                item.querySelectorAll('.loan-tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active classes
                e.currentTarget.classList.add('active');
                item.querySelector('#' + targetId).classList.add('active');
            });
        });
    }

    // Init
    loadLoans();
});
