-- Allow administrators to view loan details in the communications profile popup.
CREATE POLICY "Admins can read loans"
    ON public.loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );