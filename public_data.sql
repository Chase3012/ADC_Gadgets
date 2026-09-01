--
-- PostgreSQL database dump
--

\restrict mlW5fXdCyAwYexIruwMk4x3LEslWSGJoVC5JdR3w06sbccfoAc0s5hrx5Ttn5X3

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
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loans (id, user_id, device_name, device_image, total_amount, remaining_balance, monthly_payment, next_payment_date, status, created_at) FROM stdin;
c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b	e558120a-6885-4f50-bcb3-a7276a9e0d69	iPhone 16	../../images/phones/Iphone_16.png	54990	54990	2350	2026-09-16	active	2026-08-16 14:55:45.826402+00
72808fd2-1a73-40d6-82c5-90b74fdced21	deda7590-e2a7-4553-8739-f313907f2169	iPhone 16	../../images/phones/Iphone_16.png	54990	54990	2350	2026-09-16	active	2026-08-16 15:02:04.245355+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, loan_id, amount_paid, payment_date) FROM stdin;
bd3a03ff-6b7f-4f5b-9663-621fcdb1e8ad	c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b	7082.5	2026-08-16 15:03:30.692839+00
e8405f8f-0646-4035-bdc0-5c039edd7747	c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b	7082.5	2026-08-16 15:04:53.810541+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, mobile, address, id_type, id_url, active_loan_model, status, created_at, role, email) FROM stdin;
13efc55b-4e05-487d-b1ca-87b414b7b07d	test123@test.com	—	—	None		None	Active	2026-08-02 08:51:58.792138+00	user	\N
af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9	admin@adc.com	—	—	None		None	Active	2026-08-02 08:51:58.792138+00	admin	admin@adc.com
e558120a-6885-4f50-bcb3-a7276a9e0d69	Jhay Castro	09156834626	Kay Talise	National ID	http://127.0.0.1:54321/storage/v1/object/public/valid_ids/1785662750776_co98dm.png	iPhone 16	Active	2026-08-02 09:25:50.907575+00	user	chase@gmail.com
1ac59301-a17a-4040-afa6-42f22fa8417f	rica mhay	091321324567	Kay Talise	Driver's License	http://127.0.0.1:54321/storage/v1/object/public/valid_ids/1785663307796_s5kphc.png	iPhone 16	Active	2026-08-02 09:35:07.93169+00	user	rica@gmail.com
\.


--
-- Data for Name: support_chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_chats (id, user_id, sender_role, message, is_read, created_at) FROM stdin;
a05b2d61-7cb7-4867-bab2-e344377d7f51	af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9	user	hi	t	2026-08-16 14:11:42.47+00
fed1aa08-c033-497e-8397-40f9e30d0f80	af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9	user	hi	t	2026-08-16 14:17:22.243772+00
76dc32b6-9d1a-4710-a9c4-eef8590c7a97	af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9	admin	hello	t	2026-08-16 14:36:27.335816+00
29dbe6fc-c137-4e1e-8b36-021c6f2c31cf	af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9	admin	HELLO	f	2026-08-16 15:51:02.234699+00
353e7898-55d3-40a6-ab2b-03b4aeebddf0	e558120a-6885-4f50-bcb3-a7276a9e0d69	user	HELLO	t	2026-08-16 15:51:19.218267+00
21bee397-1273-4e36-94bd-9fea06b17a31	e558120a-6885-4f50-bcb3-a7276a9e0d69	admin	HI	t	2026-08-16 15:51:28.180513+00
37852b83-a5e7-4cf1-a026-fbe49d4beae7	e558120a-6885-4f50-bcb3-a7276a9e0d69	user	HI	t	2026-08-31 17:19:53.038723+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict mlW5fXdCyAwYexIruwMk4x3LEslWSGJoVC5JdR3w06sbccfoAc0s5hrx5Ttn5X3

