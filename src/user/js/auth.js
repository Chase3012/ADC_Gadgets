// src/user/js/auth.js

function initUserPortalAuth() {
    const storedUser = localStorage.getItem('customer_user');
    let user = null;
    
    try {
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {
        console.error("Invalid user JSON");
    }
    
    // Sidebar elements
    const sbUserName = document.getElementById('sb-user-name');
    const sbUserEmail = document.getElementById('sb-user-email');

    if (!user) {
        // User is logged out
        if (sbUserName) sbUserName.textContent = 'Guest';
        if (sbUserEmail) sbUserEmail.textContent = 'Please log in';
        
        // If they are on account.html (which requires auth) or user-home.html, bounce them
        if (window.location.pathname.includes('account.html') || window.location.pathname.includes('user-home.html') || window.location.pathname.includes('devices.html') || window.location.pathname.includes('loan.html') || window.location.pathname.includes('support.html')) {
            window.location.replace('/src/user/login.html');
        }
    } else {
        // User is logged in
        if (user.role === 'admin') {
            localStorage.removeItem('customer_user');
            window.location.replace('/src/user/login.html');
            return;
        }

        const email = user.email || '—';
        const fullName = user.full_name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const initial = fullName.charAt(0).toUpperCase();

        if (sbUserName) sbUserName.textContent = fullName;
        if (sbUserEmail) sbUserEmail.textContent = email;
        
        const sbAvatar = document.getElementById('sb-avatar-img');
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
    }
}

document.addEventListener('DOMContentLoaded', initUserPortalAuth);
