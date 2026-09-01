// Shared floating customer support chat widget
(async function() {
    const sb = window.supabaseClient || (window.supabase && window.supabase.createClient(
        'http://127.0.0.1:54321',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    ));
    if (sb && !window.supabaseClient) window.supabaseClient = sb;
    if (document.getElementById('chat-bubble')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <button id="chat-bubble" class="chat-bubble" type="button" aria-label="Open customer support chat" aria-expanded="false">
            <i data-lucide="message-circle"></i>
            <span class="chat-bubble-dot"></span>
        </button>
        <section id="section-chat" class="chat-widget" hidden aria-label="Customer support chat">
            <div class="chat-widget-panel">
                <div class="chat-widget-header">
                    <div class="chat-widget-avatar">
                        <i data-lucide="message-circle"></i>
                    </div>
                    <div>
                        <strong>Customer Support</strong>
                        <div class="chat-widget-status"><span></span>Online</div>
                    </div>
                    <div id="chat-login-notice" class="chat-login-notice"></div>
                    <button id="chat-widget-close" class="chat-widget-close" type="button" aria-label="Close customer support chat">&times;</button>
                </div>
                <div id="chat-messages" class="chat-widget-messages">
                    <div id="chat-placeholder" class="chat-placeholder">
                        <i data-lucide="message-square-dashed"></i>
                        <p>No messages yet. Say hello!</p>
                    </div>
                </div>
                <div class="chat-widget-input">
                    <input id="chat-input" type="text" placeholder="Type a message..." disabled>
                    <button id="chat-send-btn" type="button" aria-label="Send message" disabled>
                        <i data-lucide="send"></i>
                    </button>
                </div>
            </div>
        </section>
    `);

    if (window.lucide) lucide.createIcons();

    const messagesEl = document.getElementById('chat-messages');
    const placeholderEl = document.getElementById('chat-placeholder');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const loginNotice = document.getElementById('chat-login-notice');
    const chatBubble = document.getElementById('chat-bubble');
    const chatWidget = document.getElementById('section-chat');
    const chatWidgetClose = document.getElementById('chat-widget-close');

    function setChatOpen(isOpen) {
        chatWidget.hidden = !isOpen;
        chatBubble.setAttribute('aria-expanded', String(isOpen));
        if (isOpen && !inputEl.disabled) inputEl.focus();
    }

    chatBubble.addEventListener('click', () => setChatOpen(true));
    chatWidgetClose.addEventListener('click', () => setChatOpen(false));
    document.querySelectorAll('.support-chat-trigger').forEach(trigger => {
        trigger.addEventListener('click', event => {
            event.preventDefault();
            setChatOpen(true);
        });
    });

    if (!sb) {
        loginNotice.textContent = 'Please log in to chat';
        inputEl.placeholder = 'Log in to send messages';
        return;
    }

    let sessionChecked = false;
    sb.auth.onAuthStateChange((event, nextSession) => {
        if (sessionChecked && nextSession && event !== 'TOKEN_REFRESHED') {
            window.location.reload();
        }
    });

    const { data: { session } } = await sb.auth.getSession();
    sessionChecked = true;
    if (!session) {
        loginNotice.textContent = 'Please log in to chat';
        inputEl.placeholder = 'Log in to send messages';
        window.setTimeout(async () => {
            const { data: latestSession } = await sb.auth.getSession();
            if (latestSession.session) window.location.reload();
        }, 1000);
        return;
    }

    const userId = session.user.id;
    inputEl.disabled = false;
    sendBtn.disabled = false;

    function renderMessage(msg) {
        if (placeholderEl) placeholderEl.style.display = 'none';
        const isUser = msg.sender_role === 'user';
        const bubble = document.createElement('div');
        bubble.style.cssText = `display:flex; flex-direction:column; align-items:${isUser ? 'flex-end' : 'flex-start'}; gap:2px;`;
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const safeMessage = msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        bubble.innerHTML = `
            <div style="max-width:75%; padding:10px 16px; border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}; background:${isUser ? 'linear-gradient(135deg,#FF4191,#e90074)' : '#fff'}; color:${isUser ? '#fff' : '#111'}; font-size:14px; line-height:1.5; box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                ${safeMessage}
                <small style="display:block; margin-top:6px; text-align:right; opacity:0.7; font-size:10px;">${time}</small>
            </div>
        `;
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    const { data: existing } = await sb.from('support_chats').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (existing) existing.forEach(renderMessage);

    await sb.from('support_chats').update({ is_read: true }).eq('user_id', userId).eq('sender_role', 'admin').eq('is_read', false);

    sb.channel('user-chat-' + userId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_chats', filter: `user_id=eq.${userId}` }, payload => {
            renderMessage(payload.new);
            if (payload.new.sender_role === 'admin') sb.from('support_chats').update({ is_read: true }).eq('id', payload.new.id);
        })
        .subscribe();

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.value = '';
        sendBtn.disabled = true;
        const { error } = await sb.from('support_chats').insert({ user_id: userId, sender_role: 'user', message: text });
        if (error) {
            console.error('Send error:', error);
            inputEl.value = text;
        }
        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
})();
