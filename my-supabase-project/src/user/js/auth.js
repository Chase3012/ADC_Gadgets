// src/user/js/auth.js

async function initUserPortalAuth() {
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    // Sidebar elements
    const sbUserName = document.getElementById('sb-user-name');
    const sbUserEmail = document.getElementById('sb-user-email');

    if (!session) {
        // User is logged out
        if (sbUserName) sbUserName.textContent = 'Guest';
        if (sbUserEmail) sbUserEmail.textContent = 'Please log in';
        
        // If they are on account.html (which requires auth), bounce them
        if (window.location.pathname.includes('account.html')) {
            window.location.replace('../../index.html');
        }
    } else {
        // User is logged in, fetch profile
        const user = session.user;
        const sessionEmail = user.email || (user.user_metadata && user.user_metadata.email) || '—';
        if (sbUserEmail) sbUserEmail.textContent = sessionEmail;
        
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('full_name, name, email')
            .eq('id', user.id)
            .maybeSingle();

        const email = sessionEmail !== '—' ? sessionEmail : ((profile && profile.email) || '—');

        let fullName = 'ADC Member';
        if (profile) {
            fullName = profile.full_name || profile.name || email.split('@')[0];
        } else {
            fullName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        if (sbUserName) sbUserName.textContent = fullName;
        if (sbUserEmail) sbUserEmail.textContent = email;
    }
}

document.addEventListener('DOMContentLoaded', initUserPortalAuth);
