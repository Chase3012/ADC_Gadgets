--
-- PostgreSQL database dump
--

\restrict yWoglCpfDoyulEcBFGW9rrSq67wGb7IJFovRG9hMlYcvYcrDPsMOmkLxxnFPcFD

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    device_name text NOT NULL,
    device_image text NOT NULL,
    total_amount numeric NOT NULL,
    remaining_balance numeric NOT NULL,
    monthly_payment numeric NOT NULL,
    next_payment_date date NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_id uuid,
    amount_paid numeric NOT NULL,
    payment_date timestamp with time zone DEFAULT timezone('utc'::text, now())
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    mobile text,
    address text,
    id_type text,
    id_url text,
    active_loan_model text,
    status text DEFAULT 'Active'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    role text DEFAULT 'user'::text,
    email text
);


--
-- Name: support_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sender_role text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT support_chats_sender_role_check CHECK ((sender_role = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: support_chats support_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_chats
    ADD CONSTRAINT support_chats_pkey PRIMARY KEY (id);


--
-- Name: support_chats_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_chats_created_at_idx ON public.support_chats USING btree (created_at DESC);


--
-- Name: support_chats_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_chats_user_id_idx ON public.support_chats USING btree (user_id);


--
-- Name: loans loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_chats support_chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_chats
    ADD CONSTRAINT support_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_chats support_chats_user_id_fkey_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_chats
    ADD CONSTRAINT support_chats_user_id_fkey_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: support_chats Admins can mark messages read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can mark messages read" ON public.support_chats FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: support_chats Admins can read all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all messages" ON public.support_chats FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: support_chats Admins can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can send messages" ON public.support_chats FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) AND (sender_role = 'admin'::text)));


--
-- Name: profiles Allow public insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);


--
-- Name: profiles Allow public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read" ON public.profiles FOR SELECT USING (true);


--
-- Name: profiles Allow public update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update" ON public.profiles FOR UPDATE USING (true);


--
-- Name: payments Users can insert their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.loans
  WHERE ((loans.id = payments.loan_id) AND (loans.user_id = auth.uid())))));


--
-- Name: support_chats Users can mark own messages read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can mark own messages read" ON public.support_chats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: support_chats Users can read own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own messages" ON public.support_chats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: support_chats Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.support_chats FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (sender_role = 'user'::text)));


--
-- Name: loans Users can update their own loans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own loans" ON public.loans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: loans Users can view their own loans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own loans" ON public.loans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payments Users can view their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.loans
  WHERE ((loans.id = payments.loan_id) AND (loans.user_id = auth.uid())))));


--
-- Name: loans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: support_chats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict yWoglCpfDoyulEcBFGW9rrSq67wGb7IJFovRG9hMlYcvYcrDPsMOmkLxxnFPcFD

