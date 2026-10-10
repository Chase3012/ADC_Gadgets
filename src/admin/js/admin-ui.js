// src/admin/js/admin-ui.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Dashboard, Manage Users, and Reports dropdown toggles
    const dashToggle = document.getElementById('dashboard-toggle');
    const dashSub = document.getElementById('dashboard-sub');
    const manageUsersToggle = document.getElementById('manage-users-toggle');
    const manageUsersSub = document.getElementById('manage-users-sub');
    const reportsToggle = document.getElementById('reports-toggle');
    const reportsSub = document.getElementById('reports-sub');

    function closeOtherDropdowns(exceptToggle) {
      if (dashToggle && dashToggle !== exceptToggle && dashSub) {
        dashToggle.classList.remove('expanded');
        dashSub.classList.remove('open');
      }
      if (manageUsersToggle && manageUsersToggle !== exceptToggle && manageUsersSub) {
        manageUsersToggle.classList.remove('expanded');
        manageUsersSub.classList.remove('open');
      }
      if (reportsToggle && reportsToggle !== exceptToggle && reportsSub) {
        reportsToggle.classList.remove('expanded');
        reportsSub.classList.remove('open');
      }
    }
    
    if (dashToggle && dashSub) {
      dashToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !dashSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(dashToggle);
        dashToggle.classList.toggle('expanded');
        dashSub.classList.toggle('open');
      });
    }

    if (manageUsersToggle && manageUsersSub) {
      manageUsersToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !manageUsersSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(manageUsersToggle);
        manageUsersToggle.classList.toggle('expanded');
        manageUsersSub.classList.toggle('open');
      });
    }

    if (reportsToggle && reportsSub) {
      reportsToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !reportsSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(reportsToggle);
        reportsToggle.classList.toggle('expanded');
        reportsSub.classList.toggle('open');
      });
    }

    // --- Tab Switching Logic ---
    const panels = { analytics: 'panel-analytics', sales: 'panel-sales', 'manage-users': 'panel-manage-users', communications: 'panel-communications' };
    const headerTitle = document.querySelector('.page-title');
    const panelTitles = { analytics: 'Analytics', sales: 'Sales', 'manage-users': 'Manage Users', communications: 'Communications' };

    function showPanel(name) {
      Object.values(panels).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const target = document.getElementById(panels[name]);
      if (target) target.style.display = 'block';
      if (headerTitle) headerTitle.textContent = panelTitles[name] || name;
    }

    if (dashSub && dashToggle) {
      dashSub.querySelectorAll('.nav-sub-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          // If we are on dashboard.html, handle panel switching
          if (document.getElementById('panel-analytics')) {
            e.preventDefault();
            dashSub.querySelectorAll('.nav-sub-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            dashToggle.classList.add('active');
            showPanel(item.dataset.panel || item.textContent.toLowerCase());
          }
          // Otherwise, allow normal link navigation to dashboard.html
        });
      });
    }

    // Top-level Communications tab click
    const navComms = document.getElementById('nav-communications');
    if (navComms && document.getElementById('panel-communications')) {
      navComms.addEventListener('click', function(e) {
        e.preventDefault();
        closeOtherDropdowns(null);
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-sub-item').forEach(el => el.classList.remove('active'));
        navComms.classList.add('active');
        showPanel('communications');
      });

      if (window.location.hash === '#communications') {
        navComms.click();
      }
    }

});


// Global Chat Badge Logic
async function updateGlobalChatBadge() {
    try {
        const res = await fetch('/dashboard/stats');
        if (!res.ok) return;
        const data = await res.json();
        const badge = document.getElementById('global-chat-badge');
        if (badge) {
            if (data.unreadMessages && data.unreadMessages > 0) {
                badge.textContent = data.unreadMessages;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) {
        // fail silently
    }
}
updateGlobalChatBadge();
setInterval(updateGlobalChatBadge, 30000);

// ─── Global Glassmorphism Modals (Confirm & Alert) ───────────────────────────
function ensureCustomModals() {
    if (!document.getElementById('custom-confirm-modal')) {
        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'custom-confirm-modal';
        confirmDiv.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); z-index:99999; justify-content:center; align-items:center;';
        confirmDiv.innerHTML = `
            <div style="background:var(--surface, #18181b); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:16px; padding:32px; width:90%; max-width:400px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.4);">
                <div style="background:rgba(255, 65, 145, 0.1); width:56px; height:56px; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 16px auto;">
                    <i data-lucide="help-circle" style="color:#FF4191; width:28px; height:28px;"></i>
                </div>
                <h3 id="custom-confirm-title" style="margin:0 0 8px 0; font-size:18px; color:var(--text-main, #fff); font-weight:700;">Please Confirm</h3>
                <p id="custom-confirm-message" style="color:var(--text-muted, #94a3b8); font-size:14px; line-height:1.5; margin:0 0 24px 0;"></p>
                <div style="display:flex; justify-content:center; gap:12px;">
                    <button id="custom-cancel-btn" style="flex:1; padding:11px; border-radius:8px; border:1px solid var(--border, rgba(255,255,255,0.1)); background:transparent; color:var(--text-main, #fff); font-weight:600; cursor:pointer;">Cancel</button>
                    <button id="custom-confirm-btn" style="flex:1; padding:11px; border-radius:8px; border:none; background:#FF4191; color:white; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(255, 65, 145, 0.3);">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmDiv);
    }

    if (!document.getElementById('custom-alert-modal')) {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'custom-alert-modal';
        alertDiv.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); z-index:99999; justify-content:center; align-items:center;';
        alertDiv.innerHTML = `
            <div style="background:var(--surface, #18181b); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:16px; padding:32px; width:90%; max-width:400px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.4);">
                <div style="background:rgba(244, 114, 182, 0.1); width:56px; height:56px; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 16px auto;">
                    <i data-lucide="info" style="color:#FF4191; width:28px; height:28px;"></i>
                </div>
                <h3 id="custom-alert-title" style="margin:0 0 8px 0; font-size:18px; color:var(--text-main, #fff); font-weight:700;">Notification</h3>
                <p id="custom-alert-message" style="color:var(--text-muted, #94a3b8); font-size:14px; line-height:1.5; margin:0 0 24px 0;"></p>
                <button id="custom-alert-close-btn" style="width:100%; padding:11px; border-radius:8px; border:none; background:#FF4191; color:white; font-weight:600; cursor:pointer;">Dismiss</button>
            </div>
        `;
        document.body.appendChild(alertDiv);
    }
    if (window.lucide) lucide.createIcons();
}

window.showCustomConfirm = function(message, onConfirm, title = 'Please Confirm') {
    ensureCustomModals();
    const modal = document.getElementById('custom-confirm-modal');
    document.getElementById('custom-confirm-message').textContent = message;
    const titleEl = document.getElementById('custom-confirm-title');
    if (titleEl) titleEl.textContent = title;
    modal.style.display = 'flex';

    const confirmBtn = document.getElementById('custom-confirm-btn');
    const cancelBtn = document.getElementById('custom-cancel-btn');

    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newCancel.onclick = () => { modal.style.display = 'none'; };
    newConfirm.onclick = () => {
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') onConfirm();
    };
    if (window.lucide) lucide.createIcons();
};

window.showCustomAlert = function(message, title = 'Notification') {
    ensureCustomModals();
    const modal = document.getElementById('custom-alert-modal');
    document.getElementById('custom-alert-message').textContent = message;
    const titleEl = document.getElementById('custom-alert-title');
    if (titleEl) titleEl.textContent = title;
    modal.style.display = 'flex';

    const closeBtn = document.getElementById('custom-alert-close-btn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    if (window.lucide) lucide.createIcons();
};

window.closeCustomAlert = function() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) modal.style.display = 'none';
};
