// src/user/js/support-chat.js

(async function() {
    // Check session from localStorage
    const storedUser = localStorage.getItem('customer_user');
    let user = null;
    if (storedUser) {
        try { user = JSON.parse(storedUser); } catch(e){}
    }
    
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* Floating Button */
        #fab-chat-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF4191, #e90074);
            color: #fff;
            border: none;
            box-shadow: 0 4px 16px rgba(255, 65, 145, 0.4);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        #fab-chat-btn:hover {
            transform: scale(1.08) translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 65, 145, 0.5);
        }
        #fab-chat-btn svg {
            width: 28px;
            height: 28px;
            transition: transform 0.3s ease;
        }
        #fab-chat-btn.open svg:not(.close-icon) {
            transform: rotate(90deg) scale(0);
            opacity: 0;
            position: absolute;
        }
        #fab-chat-btn .close-icon {
            transform: rotate(-90deg) scale(0);
            opacity: 0;
            position: absolute;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        #fab-chat-btn.open .close-icon {
            transform: rotate(0deg) scale(1);
            opacity: 1;
        }

        /* Chat Window */
        #fab-chat-window {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 360px;
            height: 500px;
            max-height: calc(100vh - 120px);
            background: #fff;
            border-radius: 24px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
            z-index: 9998;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform-origin: bottom right;
            transform: scale(0.9) translateY(20px);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease;
        }
        #fab-chat-window.open {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        /* Chat Header */
        .fab-chat-header {
            padding: 16px 20px;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .fab-chat-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF4191, #e90074);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 12px rgba(255, 65, 145, 0.2);
        }
        .fab-chat-info {
            flex: 1;
        }
        .fab-chat-name {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 16px;
            color: #111;
        }
        .fab-chat-status {
            font-size: 12px;
            color: #22c55e;
            display: flex;
            align-items: center;
            gap: 5px;
            font-weight: 500;
        }
        .fab-chat-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            display: inline-block;
            box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
        }

        /* Chat Messages */
        #fab-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: #fafafa;
        }
        .fab-chat-placeholder {
            margin: auto;
            text-align: center;
            color: #bbb;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .fab-chat-placeholder p {
            margin-top: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        /* Chat Input */
        .fab-chat-input-area {
            padding: 16px 20px;
            background: #fff;
            border-top: 1px solid #f0f0f0;
            display: flex;
            gap: 10px;
        }
        #fab-chat-input {
            flex: 1;
            border: 1.5px solid #e5e5e5;
            border-radius: 14px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            color: #111;
            outline: none;
            font-family: inherit;
            transition: border 0.2s ease, box-shadow 0.2s ease;
        }
        #fab-chat-input:focus {
            border-color: #FF4191;
            box-shadow: 0 0 0 4px rgba(255, 65, 145, 0.1);
        }
        #fab-chat-send {
            background: linear-gradient(135deg, #FF4191, #e90074);
            color: #fff;
            border: none;
            border-radius: 14px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(255, 65, 145, 0.25);
        }
        #fab-chat-send:hover:not(:disabled) {
            transform: scale(1.05) translateY(-2px);
            filter: brightness(1.1);
        }
        #fab-chat-send:active:not(:disabled) {
            transform: scale(0.95) translateY(0);
        }
        #fab-chat-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Message Bubbles */
        .msg-bubble-wrap {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .msg-bubble-wrap.user {
            align-items: flex-end;
            animation: slideInRight 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .msg-bubble-wrap.admin {
            align-items: flex-start;
            animation: slideInLeft 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .msg-info {
            font-size: 11px;
            font-weight: 500;
            color: #999;
            margin: 0 6px;
        }
        .msg-bubble {
            max-width: 85%;
            padding: 12px 18px;
            font-size: 14.5px;
            line-height: 1.5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            word-wrap: break-word;
        }
        .msg-bubble-wrap.user .msg-bubble {
            border-radius: 20px 20px 6px 20px;
            background: linear-gradient(135deg, #FF4191, #e90074);
            color: #fff;
        }
        .msg-bubble-wrap.admin .msg-bubble {
            border-radius: 20px 20px 20px 6px;
            background: #fff;
            color: #111;
            border: 1px solid #f0f0f0;
        }

        /* Animations */
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* Scrollbar */
        #fab-chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        #fab-chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        #fab-chat-messages::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 10px;
        }

        /* Mobile tweaks */
        @media (max-width: 480px) {
            #fab-chat-window {
                width: calc(100vw - 32px);
                right: 16px;
                bottom: 84px;
                height: calc(100vh - 120px);
            }
            #fab-chat-btn {
                right: 16px;
                bottom: 16px;
            }
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = `
        <!-- Floating Button -->
        <button id="fab-chat-btn" aria-label="Open Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x close-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <!-- Chat Window -->
        <div id="fab-chat-window">
            <div class="fab-chat-header">
                <div class="fab-chat-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </div>
                <div class="fab-chat-info">
                    <div class="fab-chat-name">ADC Support</div>
                    <div class="fab-chat-status">
                        <span class="fab-chat-status-dot"></span> Online
                    </div>
                </div>
                <div id="fab-chat-login-notice" style="font-size:12px; font-weight:500; color:#999; margin-left:auto;"></div>
            </div>
            
            <div id="fab-chat-messages">
                <div id="fab-chat-placeholder" class="fab-chat-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-dashed"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
                    <p>No messages yet.<br>Send a message to start!</p>
                </div>
            </div>

            <div class="fab-chat-input-area">
                <input id="fab-chat-input" type="text" placeholder="Type a message..." disabled />
                <button id="fab-chat-send" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Logic Elements
    const btn = document.getElementById('fab-chat-btn');
    const win = document.getElementById('fab-chat-window');
    const messagesEl = document.getElementById('fab-chat-messages');
    const placeholderEl = document.getElementById('fab-chat-placeholder');
    const inputEl = document.getElementById('fab-chat-input');
    const sendBtn = document.getElementById('fab-chat-send');
    const loginNotice = document.getElementById('fab-chat-login-notice');

    let isOpen = false;
    let pollInterval = null;

    // Toggle Chat
    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            btn.classList.add('open');
            win.classList.add('open');
            if (user) setTimeout(() => inputEl.focus(), 300);
            
            if (user) {
                loadMessages();
                if (pollInterval) clearInterval(pollInterval);
                pollInterval = setInterval(loadMessages, 3000);
            }
        } else {
            btn.classList.remove('open');
            win.classList.remove('open');
            if (pollInterval) clearInterval(pollInterval);
        }
    });

    if (!user) {
        loginNotice.textContent = 'Please log in';
        inputEl.placeholder = 'Log in to chat';
        return;
    }

    const userId = user.id;
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.placeholder = 'Type a message...';

    let renderedMessageCount = 0;
    function renderMessage(msg) {
        if (placeholderEl) placeholderEl.style.display = 'none';
        const isUser = msg.sender === 'user';
        const wrap = document.createElement('div');
        wrap.className = `msg-bubble-wrap ${isUser ? 'user' : 'admin'}`;

        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const senderLabel = isUser ? 'You' : 'Support';

        wrap.innerHTML = `
            <div class="msg-info">${senderLabel} &bull; ${time}</div>
            <div class="msg-bubble">${msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        `;
        messagesEl.appendChild(wrap);
        // smooth scroll
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }

    async function loadMessages() {
        try {
            const res = await fetch('/chats/' + userId);
            if (!res.ok) return;
            const data = await res.json();
            
            if (data.length === 0) {
                if (placeholderEl) {
                    messagesEl.appendChild(placeholderEl);
                    placeholderEl.style.display = 'flex';
                }
                return;
            }
            if (data.length > renderedMessageCount) {
                const newMsgs = data.slice(renderedMessageCount);
                newMsgs.forEach(msg => {
                    renderMessage(msg);
                    if (msg.sender === 'admin' && !msg.is_read) {
                        fetch('/chats/' + msg.id + '/read', { method: 'PUT' });
                    }
                });
                renderedMessageCount = data.length;
            }
        } catch(e) {
            console.error(e);
        }
    }

    // Send message
    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.value = '';
        sendBtn.disabled = true;

        try {
            const res = await fetch('/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    sender: 'user',
                    message: text
                })
            });
            if (!res.ok) throw new Error('Failed to send');
            await loadMessages();
        } catch (error) {
            console.error('Send error:', error);
            inputEl.value = text;
        }
        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
})();
