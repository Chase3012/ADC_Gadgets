-- Support Chats table for real-time chat support
CREATE TABLE IF NOT EXISTS public.support_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS support_chats_user_id_idx ON public.support_chats(user_id);
CREATE INDEX IF NOT EXISTS support_chats_created_at_idx ON public.support_chats(created_at DESC);

-- Enable RLS
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

-- Users can read their own messages
CREATE POLICY "Users can read own messages"
    ON public.support_chats FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can send messages"
    ON public.support_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id AND sender_role = 'user');

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
    ON public.support_chats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert messages (replies)
CREATE POLICY "Admins can send messages"
    ON public.support_chats FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        AND sender_role = 'admin'
    );

-- Admins can update is_read
CREATE POLICY "Admins can mark messages read"
    ON public.support_chats FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can mark their own messages read
CREATE POLICY "Users can mark own messages read"
    ON public.support_chats FOR UPDATE
    USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chats;
