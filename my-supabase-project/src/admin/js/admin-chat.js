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
    const deleteBtn = document.getElementById('chat-delete-btn');
    const confirmModal = document.getElementById('admin-confirm-modal');
    const confirmTitle = document.getElementById('admin-confirm-title');
    const confirmMessage = document.getElementById('admin-confirm-message');
    const confirmSubmit = document.getElementById('admin-confirm-submit');
    const profileModal = document.getElementById('admin-profile-modal');
    const profileFields = {
        name: document.getElementById('admin-profile-name'),
        email: document.getElementById('admin-profile-email'),
        userNumber: document.getElementById('admin-profile-user-number'),
        loanNumber: document.getElementById('admin-loan-number'),
        device: document.getElementById('admin-loan-device'),
        status: document.getElementById('admin-loan-status'),
        total: document.getElementById('admin-loan-total'),
        balance: document.getElementById('admin-loan-balance'),
        monthly: document.getElementById('admin-loan-monthly'),
        next: document.getElementById('admin-loan-next')
    };

    function formatPeso(value) {
        return value === null || value === undefined ? '-' : `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    function closeProfileModal() {
        if (profileModal) profileModal.hidden = true;
    }

    async function showProfileModal(c) {
        if (!profileModal) return;

        const loanFields = [
            profileFields.loanNumber,
            profileFields.device,
            profileFields.status,
            profileFields.total,
            profileFields.balance,
            profileFields.monthly,
            profileFields.next
        ];

        profileFields.name.textContent = c.full_name;
        profileFields.email.textContent = c.email;
        profileFields.userNumber.textContent = c.user_number || '-';
        loanFields.forEach(field => field.textContent = 'Loading...');
        profileModal.hidden = false;

        const { data: loan, error } = await sb
            .from('loans')
            .select('loan_number, device_name, total_amount, remaining_balance, monthly_payment, next_payment_date, status')
            .eq('user_id', c.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !loan) {
            const message = error ? 'Unavailable' : 'No loan record';
            loanFields.forEach(field => field.textContent = message);
            return;
        }

        profileFields.loanNumber.textContent = loan.loan_number || '-';
        profileFields.device.textContent = loan.device_name || '-';
        profileFields.status.textContent = loan.status || '-';
        profileFields.total.textContent = formatPeso(loan.total_amount);
        profileFields.balance.textContent = formatPeso(loan.remaining_balance);
        profileFields.monthly.textContent = formatPeso(loan.monthly_payment);
        profileFields.next.textContent = loan.next_payment_date ? new Date(`${loan.next_payment_date}T00:00:00`).toLocaleDateString() : '-';
    }

    function showConfirmModal(title, message, actionLabel) {
        if (!confirmModal) return Promise.resolve(false);

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmSubmit.textContent = actionLabel;
        confirmModal.hidden = false;

        return new Promise(resolve => {
            const close = result => {
                confirmModal.hidden = true;
                confirmSubmit.removeEventListener('click', confirmAction);
                confirmModal.querySelectorAll('[data-confirm-cancel]').forEach(button => {
                    button.removeEventListener('click', cancelAction);
                });
                resolve(result);
            };
            const confirmAction = () => close(true);
            const cancelAction = () => close(false);

            confirmSubmit.addEventListener('click', confirmAction);
            confirmModal.querySelectorAll('[data-confirm-cancel]').forEach(button => {
                button.addEventListener('click', cancelAction);
            });
        });
    }

    async function loadConversations() {
        try {
            const { data, error } = await sb
                .from('support_chats')
                .select('*, profiles(full_name, email, active_loan_model, user_number)')
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
                    email: (msg.profiles && msg.profiles.email) ? msg.profiles.email : ('User ID: ' + msg.user_id.substring(0,8)),
                    active_loan: (msg.profiles && msg.profiles.active_loan_model) ? msg.profiles.active_loan_model : 'None',
                    user_number: msg.profiles ? msg.profiles.user_number : null,
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

    function getInitials(name) {
        return name.split(/\s+/).filter(Boolean).map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase() || 'AD';
    }

    async function openChat(c) {
        currentUserId = c.user_id;
        emptyEl.style.display = 'none';
        
        headerName.textContent = c.full_name;
        
        // Add click listener to header to show full profile/loan info
        const headerInfo = document.getElementById('admin-chat-user-info');
        headerInfo.onclick = () => showProfileModal(c);
        
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

        const adminInitials = getInitials(window.adminDisplayName || 'Admin');

        bubble.innerHTML = `
            <div class="chat-avatar" style="width:32px; height:32px; font-size:12px; background:${isAdmin ? '#ef4444' : '#3b82f6'}; color:#fff; border:none;">${isAdmin ? adminInitials : userInitial}</div>
            <div class="msg-bubble-container">
                <div class="msg-bubble ${isAdmin ? 'admin' : 'user'}">
                    <div class="msg-text" style="line-height: 1.5;">${msg.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
                    <div class="msg-time" style="font-size: 11px; color: ${isAdmin ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; text-align: right; margin-top: 8px;">${time}</div>
                </div>
            </div>
        `;
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    window.addEventListener('admin-profile-ready', () => {
        if (currentUserId) loadMessages();
    });

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

    if (profileModal) {
        profileModal.querySelectorAll('[data-profile-close]').forEach(button => {
            button.addEventListener('click', closeProfileModal);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!currentUserId || !(await showConfirmModal('Delete conversation?', 'This will permanently remove all messages in this conversation.', 'Delete'))) return;

            deleteBtn.disabled = true;
            const { data: deletedMessages, error } = await sb
                .from('support_chats')
                .delete()
                .eq('user_id', currentUserId)
                .select('id');

            if (error || !deletedMessages || deletedMessages.length === 0) {
                console.error('Delete conversation error:', error || 'No messages were deleted. Apply the admin DELETE policy migration.');
                alert(error ? `Unable to delete this conversation: ${error.message}` : 'No messages were deleted. Apply the latest Supabase migration.');
                deleteBtn.disabled = false;
                return;
            }

            currentUserId = null;
            emptyEl.style.display = 'flex';
            messagesEl.innerHTML = '';
            inputEl.disabled = true;
            sendBtn.disabled = true;
            if (clearBtn) clearBtn.disabled = true;
            headerName.textContent = 'Select a user';
            if (chatChannel) {
                sb.removeChannel(chatChannel);
                chatChannel = null;
            }

            deleteBtn.disabled = false;
            await loadConversations();
        });
    }

    resolveBtn.addEventListener('click', async () => {
        if (!currentUserId || !(await showConfirmModal('Resolve conversation?', 'This will clear all messages in this conversation.', 'Resolve'))) return;
        
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
