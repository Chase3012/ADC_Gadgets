// src/admin/js/admin-auth.js
async function checkAdminAuth() {
    if (!window.supabaseClient) return;
    window.adminDisplayName = 'Admin';
    var res = await window.supabaseClient.auth.getSession();
    var session = res.data.session;
    if (!session) {
        window.location.replace('login.html');
    } else {
        var profileRes = await window.supabaseClient.from('profiles').select('role, full_name').eq('id', session.user.id).single();
        if (profileRes.error || profileRes.data.role !== 'admin') {
            await window.supabaseClient.auth.signOut();
            alert('Access Denied: Administrator privileges required.');
            window.location.replace('login.html');
            return;
        }
        var userEmail = session.user.email;
        var fullName = profileRes.data.full_name || userEmail.split('@')[0];
        
        var nameEl = document.querySelector('.user-profile .name');
        if(nameEl) nameEl.textContent = fullName;
        window.adminDisplayName = fullName;
        window.dispatchEvent(new CustomEvent('admin-profile-ready'));
        
        var imgEl = document.querySelector('.user-profile img');
        if(imgEl) imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            window.location.replace('login.html');
        });
    }
});
