-- Allow administrators to delete complete support conversations.
DROP POLICY IF EXISTS "Admins can delete support chats" ON public.support_chats;

CREATE POLICY "Admins can delete support chats"
    ON public.support_chats FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );