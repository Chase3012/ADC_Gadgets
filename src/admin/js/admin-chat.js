// src/admin/js/admin-chat.js

(async function() {
    const sb = window.supabaseClient;
    if (!sb) return;

    let currentUserId = null;
    let chatChannel = null;

    const listEl = document.getElementById('admin-chat-list');
    const emptyEl = document.getElementById('admin-chat-empty');
    const messagesEl = document.getElementById('admin-chat-messages');
    const inputEl = document.getElementById('admin-chat-input');
    const sendBtn = document.getElementById('admin-chat-send');
    const resolveBtn = document.getElementById('chat-resolve-btn');
    const badgeEl = document.getElementById('nav-chat-badge');
    const headerName = document.getElementById('chat-header-name');
    const clearBtn = document.getElementById('admin-chat-clear');
    const headerInitial = document.getElementById('chat-header-initial');

    async function loadConversations() {
        try {
            const { data, error } = await sb
                .from('support_chats')
                .select('*, profiles(full_name, email, active_loan_model)')
                .order('created_at', { ascending: false });

        if (error || !data) {
            listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">Error loading</div>';
            return;
        }

        const map = new Map();
        let totalUnread = 0;

        data.forEach(msg => {
            if (!map.has(msg.user_id)) {
                map.set(msg.user_id, {
                    user_id: msg.user_id,
                    full_name: (msg.profiles && msg.profiles.full_name) ? msg.profiles.full_name : 'Unknown User',
                    email: (msg.profiles && msg.profiles.email) ? msg.profiles.email : ('Account ID: ' + (msg.user_id ? parseInt(msg.user_id.replace(/-/g, '').substring(0, 8), 16).toString().padStart(10, '0') : '0000000000')),
                    active_loan: (msg.profiles && msg.profiles.active_loan_model) ? msg.profiles.active_loan_model : 'None',
                    last_message: msg.message,
                    last_time: msg.created_at,
                    unread: 0
                });
            }
            if (msg.sender_role === 'user' && !msg.is_read) {
                map.get(msg.user_id).unread++;
                totalUnread++;
            }
        });

        updateBadge(totalUnread);

        const convos = Array.from(map.values());
        if (convos.length === 0) {
            listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">No active conversations</div>';
            return;
        }

        listEl.innerHTML = '';
        convos.forEach(c => {
            const div = document.createElement('div');
            div.className = 'chat-contact-item' + (currentUserId === c.user_id ? ' active' : '');
            
            // Randomish color for avatar based on first letter
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            const charCode = c.full_name.charCodeAt(0) || 0;
            const bg = colors[charCode % colors.length];

            // Format date: if today, show time, else show short date
            const dateObj = new Date(c.last_time);
            const isToday = dateObj.toDateString() === new Date().toDateString();
            const timeStr = isToday ? dateObj.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : dateObj.toLocaleDateString([],{month:'short', day:'numeric'});

            div.innerHTML = `
                <div class="chat-avatar" style="background:${bg};">${c.full_name.charAt(0).toUpperCase()}</div>
                <div class="chat-contact-info">
                    <div class="chat-contact-top">
                        <div class="chat-contact-name">${c.full_name}</div>
                        <div class="chat-contact-time">${timeStr}</div>
                    </div>
                    <div class="chat-contact-bottom">
                        <div class="chat-contact-preview">${c.last_message}</div>
                        ${c.unread > 0 ? `<div class="chat-badge">${c.unread}</div>` : ''}
                    </div>
                </div>
            `;
            div.addEventListener('click', () => openChat(c));
            listEl.appendChild(div);
        });
        } catch (err) {
            console.error('loadConversations error:', err);
            listEl.innerHTML = `<div style="padding:20px;text-align:left;color:red;font-size:12px;word-break:break-all;">Error: ${err.message}<br>${err.stack}</div>`;
        }
    }

    function updateBadge(count) {
        if (count > 0) {
            badgeEl.style.display = 'inline-block';
            badgeEl.textContent = count;
        } else {
            badgeEl.style.display = 'none';
        }
    }

    async function openChat(c) {
        currentUserId = c.user_id;
        emptyEl.style.display = 'none';
        
        headerName.textContent = c.full_name;
        
        // Add click listener to header to show full profile/loan info
        const headerInfo = document.getElementById('admin-chat-user-info');
        headerInfo.onclick = () => {
            const existingModal = document.getElementById('admin-custom-user-modal');
            if(existingModal) existingModal.remove();
            
            const overlay = document.createElement('div');
            overlay.id = 'admin-custom-user-modal';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
            overlay.style.backdropFilter = 'blur(4px)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '999999';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            
            const card = document.createElement('div');
            card.style.background = '#FFFFFF';
            card.style.borderRadius = '20px';
            card.style.padding = '32px';
            card.style.width = '420px';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            card.style.transform = 'scale(0.95) translateY(20px)';
            card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.position = 'relative';
            
            card.innerHTML = `
                <button id="close-user-modal" style="position:absolute; top:20px; right:20px; background:var(--bg); border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); cursor:pointer; transition:background 0.2s;">
                    <i data-lucide="x" style="width:16px;height:16px;"></i>
                </button>
                
                <div style="display:flex; align-items:center; gap:16px; margin-bottom: 28px;">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=FF4191&color=fff&size=64&bold=true" style="border-radius:16px; width:64px; height:64px; box-shadow: 0 8px 16px rgba(255,65,145,0.2);" />
                    <div>
                        <h3 style="margin:0; font-size:22px; font-weight:800; color:var(--text-main); letter-spacing:-0.5px;">${c.full_name}</h3>
                        <p style="margin:4px 0 0 0; color:var(--text-muted); font-size:14px; font-weight:500;">${c.email}</p>
                    </div>
                </div>
                
                <div style="background:var(--bg); border-radius:14px; padding:18px; margin-bottom:16px; border: 1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <i data-lucide="smartphone" style="width:16px;height:16px;color:var(--primary);"></i>
                        <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:700;">Active Loan</div>
                    </div>
                    <div style="font-size:18px; font-weight:700; color:var(--text-main); padding-left:24px;">${c.active_loan || 'None'}</div>
                </div>
                
                <div style="background:var(--bg); border-radius:14px; padding:18px; border: 1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <i data-lucide="fingerprint" style="width:16px;height:16px;color:var(--text-muted);"></i>
                        <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:700;">Account ID</div>
                    </div>
                    <div style="font-size:16px; font-family:monospace; color:var(--text-main); font-weight:700; word-break:break-all; padding-left:24px; opacity:0.9;">${c.user_id ? parseInt(c.user_id.replace(/-/g, '').substring(0, 8), 16).toString().padStart(10, '0') : '0000000000'}</div>
                </div>
            `;
            
            overlay.appendChild(card);
            document.body.appendChild(overlay);
            
            if(window.lucide) window.lucide.createIcons();
            
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                card.style.transform = 'scale(1) translateY(0)';
            });
            
            const close = () => {
                overlay.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(20px)';
                setTimeout(() => overlay.remove(), 300);
            };
            
            overlay.onclick = (e) => {
                if(e.target === overlay) close();
            }
            const closeBtn = document.getElementById('close-user-modal');
            closeBtn.onclick = close;
            closeBtn.onmouseover = function() { this.style.background = 'var(--border)'; };
            closeBtn.onmouseout = function() { this.style.background = 'var(--bg)'; };
        };
        
        inputEl.disabled = false;
        sendBtn.disabled = false;
        if (clearBtn) clearBtn.disabled = false;
        
        // Mark read
        await sb.from('support_chats')
            .update({ is_read: true })
            .eq('user_id', currentUserId)
            .eq('sender_role', 'user')
            .eq('is_read', false);

        await loadMessages();
        await loadConversations(); // refresh list to clear unread bubble

        // Subscribe to this specific chat
        if (chatChannel) sb.removeChannel(chatChannel);
        chatChannel = sb.channel('admin-chat-' + currentUserId)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_chats',
                filter: `user_id=eq.${currentUserId}`
            }, (payload) => {
                renderMessage(payload.new);
                if (payload.new.sender_role === 'user') {
                    sb.from('support_chats').update({ is_read: true }).eq('id', payload.new.id);
                }
            })
            .subscribe();
    }

    async function loadMessages() {
        const { data } = await sb.from('support_chats')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: true });
        
        messagesEl.innerHTML = '';
        if (data) {
            data.forEach(renderMessage);
        }
    }

    function renderMessage(msg) {
        const isAdmin = msg.sender_role === 'admin';
        const bubble = document.createElement('div');
        bubble.className = `msg-wrapper ${isAdmin ? 'admin' : 'user'}`;

        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let userInitial = '?';
        if (!isAdmin && headerName.textContent) {
            userInitial = headerName.textContent.charAt(0).toUpperCase();
        }

        bubble.innerHTML = `
            <div class="chat-avatar" style="width:32px; height:32px; font-size:12px; background:${isAdmin ? '#ef4444' : '#3b82f6'}; color:#fff; border:none;">${isAdmin ? 'JD' : userInitial}</div>
            <div class="msg-bubble-container">
                <div class="msg-bubble ${isAdmin ? 'admin' : 'user'}">
                    <div class="msg-subject" style="font-weight: 600; margin-bottom: 8px;">Re: ADC Support Request</div>
                    <div class="msg-text" style="line-height: 1.5;">${msg.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
                    <div class="msg-time" style="font-size: 11px; color: ${isAdmin ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; text-align: right; margin-top: 8px;">${time}</div>
                </div>
            </div>
        `;
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text || !currentUserId) return;
        inputEl.value = '';
        sendBtn.disabled = true;

        const { error } = await sb.from('support_chats').insert({
            user_id: currentUserId,
            sender_role: 'admin',
            message: text
        });

        if (error) {
            console.error('Send error:', error);
            inputEl.value = text;
        } else {
            await loadConversations();
        }
        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        } 
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputEl.value = '';
            inputEl.focus();
        });
    }

    resolveBtn.addEventListener('click', async () => {
        if (!currentUserId || !confirm('Are you sure you want to resolve and clear this conversation?')) return;
        
        await sb.from('support_chats').delete().eq('user_id', currentUserId);
        
        currentUserId = null;
        emptyEl.style.display = 'flex';
        messagesEl.innerHTML = '';
        inputEl.disabled = true;
        sendBtn.disabled = true;
        if (clearBtn) clearBtn.disabled = true;
        headerName.textContent = 'Select a user';
        if (chatChannel) sb.removeChannel(chatChannel);
        
        await loadConversations();
    });

    // Global listener for new messages to update the list even if we're not in the chat
    sb.channel('admin-global')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_chats' }, () => {
            loadConversations();
        })
        .subscribe();

    loadConversations();
})();
