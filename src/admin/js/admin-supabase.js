// src/admin/js/admin-supabase.js

// Admin Portal Anon Client (uses custom storage key so it doesn't conflict with User Portal)
window.supabaseClient = window.supabase ? window.supabase.createClient(
    'http://127.0.0.1:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    {
        auth: {
            storageKey: 'admin-auth-token'
        }
    }
) : null;
