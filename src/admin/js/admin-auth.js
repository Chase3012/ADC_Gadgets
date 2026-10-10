// src/admin/js/admin-auth.js
function checkAdminAuth() {
    var storedUser = localStorage.getItem('admin_user');
    if (!storedUser) {
        window.location.replace('/src/admin/login.html');
        return;
    }
    
    var user;
    try {
        user = JSON.parse(storedUser);
    } catch (e) {
        localStorage.removeItem('admin_user');
        window.location.replace('/src/admin/login.html');
        return;
    }
    
    if (user.role !== 'admin') {
        localStorage.removeItem('admin_user');
        alert('Access Denied: Administrator privileges required.');
        window.location.replace('/src/admin/login.html');
        return;
    }
    
    var fullName = user.email ? user.email.split('@')[0] : 'Admin';
    
    var nameEl = document.querySelector('.user-profile .name');
    if(nameEl) nameEl.textContent = fullName;
    
    var imgEl = document.querySelector('.user-profile img');
    if(imgEl) imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`;
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try { await fetch('/api/logout', { method: 'POST' }); } catch(err) {}
            localStorage.removeItem('admin_user');
            window.location.replace('/src/admin/login.html');
        });
    }
});
