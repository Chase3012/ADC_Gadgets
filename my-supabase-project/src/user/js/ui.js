// src/user/js/ui.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Sidebar / nav panel logic
    const navHamBtn = document.getElementById('nav-ham-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sb-overlay');
    const sbClose = document.getElementById('sb-close');

    function openSidebar() {
        if(sidebar) sidebar.classList.add('open');
        if(overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (navHamBtn) navHamBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeSidebar() {
        if(sidebar) sidebar.classList.remove('open');
        if(overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
        if (navHamBtn) navHamBtn.setAttribute('aria-expanded', 'false');
    }

    if(navHamBtn) navHamBtn.addEventListener('click', openSidebar);
    if(sbClose) sbClose.addEventListener('click', closeSidebar);
    if(overlay) overlay.addEventListener('click', closeSidebar);
    
    // Sidebar active link highlighting for account.html
    document.querySelectorAll('.side-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.side-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

window.showToast = function(msg, type='success') {
    const t = document.getElementById('toast');
    if(!t) return;
    const icon = t.querySelector('i');
    const msgEl = document.getElementById('toast-msg');
    if(msgEl) msgEl.textContent = msg;
    t.className = 'toast ' + type;
    if(icon && window.lucide) {
        icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : 'x-circle');
        lucide.createIcons();
    }
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3800);
};
