// Shared user logout behavior
async function logoutUser(event) {
    if (event) event.preventDefault();

    const logoutButton = event && event.currentTarget;
    if (logoutButton) logoutButton.disabled = true;

    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) console.error('Logout error:', error);
    }

    window.location.replace('../../index.html');
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('sb-logout');
    if (logoutButton) logoutButton.addEventListener('click', logoutUser);
});
