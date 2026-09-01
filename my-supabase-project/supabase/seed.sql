SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict VGqaupGx6BMeAKzV3Et4ylG2LUb2rIEf4f6Qu2vHXVw11HYmz5QdsRo3STJ7aTq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '3081338b-da7e-4d21-bfa5-ffbdcc6d0465', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@adcgadgets.com","user_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","user_phone":""}}', '2026-07-22 17:57:01.065779+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd83b2f5f-502f-47b8-80db-c21bf02e41a5', '{"action":"login","actor_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","actor_username":"test@adcgadgets.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-22 17:58:55.773473+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de3fde0b-50c6-44c1-b7be-8eb45befc64a', '{"action":"login","actor_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","actor_username":"test@adcgadgets.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-22 17:59:48.52387+00', ''),
	('00000000-0000-0000-0000-000000000000', '482c2add-ff07-4b70-8854-463b4151b3aa', '{"action":"login","actor_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","actor_username":"test@adcgadgets.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-22 18:01:20.911474+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6fd9d57-add5-4c34-a869-3c509caddfad', '{"action":"login","actor_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","actor_username":"test@adcgadgets.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-22 18:01:30.246949+00', ''),
	('00000000-0000-0000-0000-000000000000', '233a4c1b-a706-4721-a63f-101a3d76277d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@adcgadgets.com","user_id":"5119e317-e1cc-4182-b8f2-0a097ee4dc2f","user_phone":""}}', '2026-07-25 09:19:02.308707+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7df63a2-b16f-4f1d-88c6-f5281bdaf063', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test123@test.com","user_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","user_phone":""}}', '2026-07-25 09:19:15.721312+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eba89d31-335b-4bca-a117-cf47065400cf', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-25 09:19:45.976921+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e82ed46-fc95-41ef-9400-e797aa499943', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-25 10:07:38.268176+00', ''),
	('00000000-0000-0000-0000-000000000000', '20966c10-1571-4ac9-b647-9a15d88fbef3', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-25 10:11:02.808644+00', ''),
	('00000000-0000-0000-0000-000000000000', '8cdd7f4c-6f77-4049-84d2-6e05bd8a4941', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-25 10:16:33.73315+00', ''),
	('00000000-0000-0000-0000-000000000000', '506295f5-938c-49b7-a99f-12a8e820ac7c', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-28 16:18:04.67697+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e96f63f5-ed9a-471f-a25a-744090c1f0d2', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-28 16:18:04.680203+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7d924d6-f2dd-4130-b276-81214f0c410d', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 16:39:15.476629+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c260ec98-f3ee-4e36-8ed5-7c53b85b7add', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 17:17:56.600353+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e820545-2391-4515-8926-738ac2b5341b', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:03:01.184281+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a910b91b-6af5-400f-902c-20f37a091a51', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:05:35.216962+00', ''),
	('00000000-0000-0000-0000-000000000000', '24ee0630-7f26-4d9c-8726-1b346b9486e4', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:05:44.406664+00', ''),
	('00000000-0000-0000-0000-000000000000', 'baf3b39a-8e7b-47d2-ac9b-95f578682e33', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:06:25.652633+00', ''),
	('00000000-0000-0000-0000-000000000000', '82b39b2f-f52c-47e3-bc19-998250ccddaf', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:11:09.542301+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ba8f9fc-b11b-452b-8653-b5803e31b50c', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:16:43.572257+00', ''),
	('00000000-0000-0000-0000-000000000000', '6936704f-9d6a-429e-b666-0a7a359b4c77', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-28 18:45:46.952672+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a4e868fe-8da3-4179-b12c-31ec3b3f0e17', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-29 15:31:24.139625+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8d8f577-2e0a-4a33-8ff1-4355ee74de48', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-29 15:31:24.141979+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f657218-2c48-413c-a88d-e782559e8296', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-29 15:31:24.163371+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0a25681-3c3c-406b-a13f-d5c0a80a8b42', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-29 17:28:57.933596+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1a75af7-593d-4857-bf64-8253d39d413e', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-29 17:28:57.936322+00', ''),
	('00000000-0000-0000-0000-000000000000', '7df4cd7a-762f-49e7-9131-094658eb95c8', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-29 17:28:57.950882+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2b26db0-1b4f-4f04-b262-fabc3f627dae', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-29 17:29:49.142206+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2cb6087-3602-4c99-9166-1489d9bb2d38', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-29 17:35:53.805441+00', ''),
	('00000000-0000-0000-0000-000000000000', '62b98837-f426-4b52-8606-789c89cfa33b', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-30 15:07:45.606033+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd6653c2-b965-4794-939c-5767491f72d1', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-07-30 15:07:45.607846+00', ''),
	('00000000-0000-0000-0000-000000000000', '96c7b84c-8116-4639-8118-b1482dd21053', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 15:07:45.629268+00', ''),
	('00000000-0000-0000-0000-000000000000', '620cbccd-4b27-43d9-80b1-a9e80e605111', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 15:30:48.83535+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2f887a5-079d-4952-a7b8-8a96c34c689e', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 16:08:15.768726+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8746dfd-1f54-47e9-aea1-af9e1c778bf2', '{"action":"user_signedup","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-07-30 16:51:24.549732+00', ''),
	('00000000-0000-0000-0000-000000000000', 'edccd0b3-8994-45f6-b72a-40ad4d997833', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 16:51:24.570604+00', ''),
	('00000000-0000-0000-0000-000000000000', '5eec7e5a-3b19-40f9-b801-44fdac86ac92', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 16:53:35.583194+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b72b6883-f1b2-4e44-8554-5772e6a2d440', '{"action":"logout","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account"}', '2026-07-30 17:28:47.79989+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3e3cb39-fb96-481b-81d0-ff873e672dc4', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-07-30 17:39:18.119418+00', ''),
	('00000000-0000-0000-0000-000000000000', '642eb868-33c3-40bd-9c2b-60b66f05f4df', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 07:33:00.175922+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9b3f19d-1405-4cfe-b959-5226098ad94b', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 07:33:00.178023+00', ''),
	('00000000-0000-0000-0000-000000000000', '43883f74-e74f-4de2-96f1-4f70844d84fe', '{"action":"login","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 07:33:00.203594+00', ''),
	('00000000-0000-0000-0000-000000000000', '59ef3086-23f3-4c46-8902-aa2e8bcc7ff2', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 08:37:27.744345+00', ''),
	('00000000-0000-0000-0000-000000000000', '677f29bc-fc70-4779-a965-2cac50533ef8', '{"action":"token_revoked","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 08:37:27.747276+00', ''),
	('00000000-0000-0000-0000-000000000000', '6861e652-fb06-4963-af07-a6e3e3870a3e', '{"action":"token_refreshed","actor_id":"13efc55b-4e05-487d-b1ca-87b414b7b07d","actor_username":"test123@test.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 08:37:27.845394+00', ''),
	('00000000-0000-0000-0000-000000000000', '64f60cb0-7a49-44ad-aa80-377fb0c1e63c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jhay@gmail.com","user_id":"deda7590-e2a7-4553-8739-f313907f2169","user_phone":""}}', '2026-08-02 09:16:40.698169+00', ''),
	('00000000-0000-0000-0000-000000000000', '4f316316-09a6-46c0-8f4d-54291ade3074', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"chase@gmail.com","user_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","user_phone":""}}', '2026-08-02 09:25:50.887801+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2b0c872-ef92-4295-9857-3393017e0b89', '{"action":"login","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 09:29:25.031935+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c0d48f1-655f-43cf-b552-2fed0006a2ed', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"rica@gmail.com","user_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","user_phone":""}}', '2026-08-02 09:35:07.911965+00', ''),
	('00000000-0000-0000-0000-000000000000', '96e433bd-7c98-4b2a-a81f-26b59258ea3c', '{"action":"logout","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 09:35:34.393128+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c066e85f-9e06-4738-bab4-75b4f89095cc', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 09:35:43.031959+00', ''),
	('00000000-0000-0000-0000-000000000000', '5326506e-2182-4f2e-831d-fa46601be793', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:03:20.910972+00', ''),
	('00000000-0000-0000-0000-000000000000', '0175970c-2cc6-4afb-bad3-a98344f5964a', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:03:30.420212+00', ''),
	('00000000-0000-0000-0000-000000000000', '748da157-83e5-4fd6-8694-cadc9098c411', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:06:07.400183+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5883eab-163e-48ed-b428-6e90c7be7a3e', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:06:14.406344+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f27d6187-3d26-4f8a-af8e-dbf31459ede4', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:06:15.261851+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ffa5bfb-b5ae-42c7-acd3-79ddc2324017', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:06:22.069362+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e34f5f55-58e4-4e59-a85c-4298923557c1', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:06:22.908404+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f58ebd5a-ad0f-4ee2-bba2-0f15f1309e61', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:06:29.275467+00', ''),
	('00000000-0000-0000-0000-000000000000', '6bdf2c04-3d87-4289-af28-58d6233ca0cd', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:06:30.130161+00', ''),
	('00000000-0000-0000-0000-000000000000', '7329f0ab-c4db-41dd-ae00-e67003ca8ac7', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:08:27.042277+00', ''),
	('00000000-0000-0000-0000-000000000000', '6aa3a8e6-1c07-4d41-a0ed-c916d2671e4d', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:08:27.146078+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a01d978-43b5-48f9-9f71-830cdb67d635', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:12:36.309936+00', ''),
	('00000000-0000-0000-0000-000000000000', '7bbaded8-1a6b-4fdc-9d7f-987d05e41b4c', '{"action":"logout","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:12:50.255543+00', ''),
	('00000000-0000-0000-0000-000000000000', '375d9e8e-39f5-4708-b7f0-0107f9243224', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:32:50.602312+00', ''),
	('00000000-0000-0000-0000-000000000000', '98f2a86f-f604-4d57-b68a-3be735fc177a', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:33:19.293083+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4b6cc63-a871-42a8-ba2d-0db99a4fec2e', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:33:32.265593+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c368ecbe-2105-4390-b6c9-ee807beb09e1', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:35:05.484074+00', ''),
	('00000000-0000-0000-0000-000000000000', '9cdc6195-ef8f-4f86-b19b-c6db5f3250e2', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 10:36:18.804004+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c9246f2-93e9-4fa9-ad6c-2b7312ae480c', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 10:36:32.699506+00', ''),
	('00000000-0000-0000-0000-000000000000', '50873ed1-2be8-4285-b0a9-e9f7ad4c75f8', '{"action":"token_refreshed","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 11:59:15.740542+00', ''),
	('00000000-0000-0000-0000-000000000000', '19f02f99-afb7-409f-898e-55b6184706b8', '{"action":"token_revoked","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 11:59:15.743184+00', ''),
	('00000000-0000-0000-0000-000000000000', '3cb7fe50-be32-4891-bb15-6ae0747c9b06', '{"action":"token_refreshed","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 11:59:15.832474+00', ''),
	('00000000-0000-0000-0000-000000000000', '7068c5d7-f1df-40da-b3cf-9ba2c2efbd16', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 11:59:17.4228+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c883acb0-ef98-42ab-8274-346d4d5c16c0', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 11:59:38.581615+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1519ebe-77c9-4cda-9bcf-40748a802232', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 12:00:25.926125+00', ''),
	('00000000-0000-0000-0000-000000000000', '363119c9-4109-4f9d-b719-229415de9933', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 12:01:23.002099+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b7b01e2d-abf9-4f74-8d3f-df18e1ffedb6', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 12:04:36.45728+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa546a9e-4086-49a5-ab4f-abc97e090c80', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 12:04:36.566659+00', ''),
	('00000000-0000-0000-0000-000000000000', '11537bb1-6f5f-4afd-a493-76f59cb7fdcc', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 14:58:42.38077+00', ''),
	('00000000-0000-0000-0000-000000000000', '9dc012b4-92b5-4b48-a9b7-497e7d985d50', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 15:13:29.890218+00', ''),
	('00000000-0000-0000-0000-000000000000', '73bc54c6-ed55-4d5e-8665-c1a81f3538e8', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 15:14:01.022855+00', ''),
	('00000000-0000-0000-0000-000000000000', '490f4e12-738b-4984-8a54-b72e648a2a3c', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 16:12:01.247199+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0f082a4-1d59-4457-91f0-15d9de3acbf7', '{"action":"token_revoked","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 16:12:01.249961+00', ''),
	('00000000-0000-0000-0000-000000000000', '063fe3f9-2563-49d6-9295-2c0c1af7ab8c', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 16:12:01.334914+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a9ad771-90b0-4be7-b0e8-3cca50ce5d38', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dela@gmail.com","user_id":"01976421-f4f5-458c-b20f-565c4cd28dde","user_phone":""}}', '2026-08-02 16:43:17.641663+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bc03e149-af00-4df7-bd64-3a31b31d8256', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dela@gmail.com","user_id":"01976421-f4f5-458c-b20f-565c4cd28dde","user_phone":""}}', '2026-08-02 16:50:49.894779+00', ''),
	('00000000-0000-0000-0000-000000000000', '32a4dd03-7503-4583-ba83-fe6bd12df251', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 17:28:52.454578+00', ''),
	('00000000-0000-0000-0000-000000000000', '65bed561-60aa-4f8d-af80-088eff690ea9', '{"action":"token_revoked","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 17:28:52.457558+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd6e0d16f-8dfe-4f5a-9892-436c2e9942f5', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-02 17:28:52.554251+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c3d9f3a-4f26-4db3-9823-3d2a9d0e2d7b', '{"action":"logout","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 17:34:54.695429+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c22f639b-399f-49c3-9268-8264dda539b3', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:38:08.80922+00', ''),
	('00000000-0000-0000-0000-000000000000', '59683bd9-2964-4c75-8f1f-0c639a889725', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:39:51.426575+00', ''),
	('00000000-0000-0000-0000-000000000000', '07fa38d3-9ad9-4725-aeb6-8d36c4159ca8', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:45:04.491281+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ddf3379-1eac-4f38-94af-13621e7cc9cd', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:46:12.366398+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1e4735d-775e-4ab7-b441-2aec142aea46', '{"action":"logout","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 17:46:12.493481+00', ''),
	('00000000-0000-0000-0000-000000000000', '16861a99-b5ed-4bc5-a65a-b24025846e7e', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:47:06.999946+00', ''),
	('00000000-0000-0000-0000-000000000000', '95a4c834-d57d-4dd0-910f-c0d1b604da57', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:47:15.918391+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc3220fd-7330-49b2-926f-8d2416bc7961', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:47:27.479249+00', ''),
	('00000000-0000-0000-0000-000000000000', '560f9f4b-4d22-4be9-9abc-d347eb432c1a', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:51:45.759589+00', ''),
	('00000000-0000-0000-0000-000000000000', '855c8998-c7ce-449d-b11e-3d273ffd0591', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:56:12.837915+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4f6996d-a539-48a6-9e01-f36aeaf64386', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:58:35.915778+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a33df2c9-bc43-45b7-9483-ac574b902093', '{"action":"logout","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account"}', '2026-08-02 17:58:40.888649+00', ''),
	('00000000-0000-0000-0000-000000000000', '3024dff1-13d0-4fa9-a747-79b2b78d6f91', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-02 17:58:46.298685+00', ''),
	('00000000-0000-0000-0000-000000000000', '5890bae9-b77a-4dc6-b3cf-55e08c695c4c', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-04 05:01:50.52055+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ce554454-9a09-4403-8945-2cb7256691ec', '{"action":"token_revoked","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-04 05:01:50.523276+00', ''),
	('00000000-0000-0000-0000-000000000000', '989ed9e8-c7e5-4c20-95a9-b7ab903429e5', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-04 05:01:57.066474+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4840140-d3bf-44db-82a1-56cad8e46d57', '{"action":"login","actor_id":"1ac59301-a17a-4040-afa6-42f22fa8417f","actor_name":"rica mhay","actor_username":"rica@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-04 05:03:18.948784+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef89bef5-bef1-41c1-8bbe-c783c0c7ef55', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 13:36:33.099113+00', ''),
	('00000000-0000-0000-0000-000000000000', '00e9dbcf-c83d-4bb0-b552-a6727b2383df', '{"action":"login","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 13:38:36.595481+00', ''),
	('00000000-0000-0000-0000-000000000000', '98a69274-b082-455d-a769-c3780263c5a3', '{"action":"logout","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-16 14:05:19.962696+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef9dad3a-cfea-4e72-a5c2-0dd816525ff4', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 14:05:52.159636+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc0ec09d-9a6c-4040-beac-2c7d0fd69534', '{"action":"login","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 14:37:35.025223+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc4c33eb-d168-4690-b02c-27e98b684a27', '{"action":"logout","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-08-16 14:38:33.522796+00', ''),
	('00000000-0000-0000-0000-000000000000', '79ee7d9f-678f-484a-88d5-5bcf958634dc', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 14:38:43.913066+00', ''),
	('00000000-0000-0000-0000-000000000000', '17fca12d-0435-4860-abfd-f12948820e4e', '{"action":"logout","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account"}', '2026-08-16 14:44:11.983914+00', ''),
	('00000000-0000-0000-0000-000000000000', '6428b2a7-00cd-417e-95b6-b076c41e850c', '{"action":"login","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 14:44:19.97133+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da9a9660-364d-41b5-a572-b4ae2302e3fd', '{"action":"login","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-08-16 14:44:25.772976+00', ''),
	('00000000-0000-0000-0000-000000000000', '1259c995-68a3-453d-a07f-17fe11e4299a', '{"action":"token_refreshed","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-16 15:42:27.144556+00', ''),
	('00000000-0000-0000-0000-000000000000', '0114b286-1aa1-4d69-bb52-f653c657601f', '{"action":"token_revoked","actor_id":"af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9","actor_username":"admin@adc.com","actor_via_sso":false,"log_type":"token"}', '2026-08-16 15:42:27.147789+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c8cd5de-865b-470c-bc87-987b081d0e4f', '{"action":"token_refreshed","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-08-16 15:42:27.152332+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc0811b1-2502-4690-875a-abed3d00fac5', '{"action":"token_revoked","actor_id":"e558120a-6885-4f50-bcb3-a7276a9e0d69","actor_name":"Jhay Castro","actor_username":"chase@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-08-16 15:42:27.157217+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', 'authenticated', 'authenticated', 'chase@gmail.com', '$2a$06$PhbpEUsKHbR.LwcH6DF5g.3uaGQtYtxn272T30UvPtyhb2RU1Dq6S', '2026-08-02 09:25:50.889634+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-16 14:44:19.972805+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Jhay Castro", "email_verified": true}', NULL, '2026-08-02 09:25:50.883891+00', '2026-08-16 15:42:27.164672+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '13efc55b-4e05-487d-b1ca-87b414b7b07d', 'authenticated', 'authenticated', 'test123@test.com', '$2a$10$Gguzoo/4eCFoK9wToFystOLGOV3nsuXKu52AF9j4gnUw0LL7nJPvK', '2026-07-25 09:19:15.722987+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-02 07:33:00.204851+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-25 09:19:15.717226+00', '2026-08-02 08:37:27.753384+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'deda7590-e2a7-4553-8739-f313907f2169', 'authenticated', 'authenticated', 'jhay@gmail.com', '$2a$10$4WAKBX57uLNOh4X.5NyweuMryj1DX.kyv70KVBKS/Oa3sRvggNj8W', '2026-08-02 09:16:40.700338+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "jhay", "email_verified": true}', NULL, '2026-08-02 09:16:40.691445+00', '2026-08-02 09:16:40.701346+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1ac59301-a17a-4040-afa6-42f22fa8417f', 'authenticated', 'authenticated', 'rica@gmail.com', '$2a$10$FIgCcoOkhdNgIBDUleuGB.XV1U8U9p2dzOHLmzqFJNgI51jpzyc6q', '2026-08-02 09:35:07.914039+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-04 05:03:18.950163+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "rica mhay", "email_verified": true}', NULL, '2026-08-02 09:35:07.908373+00', '2026-08-04 05:03:18.953235+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'authenticated', 'authenticated', 'admin@adc.com', '$2a$06$1l6lG1i5ioaiCkEl5T9l1uLiRVrzR6Ec3hevSXtBBnAYKTpq9MmKS', '2026-07-30 16:51:24.551256+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-16 14:44:25.774619+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9", "email": "admin@adc.com", "email_verified": true, "phone_verified": false}', NULL, '2026-07-30 16:51:24.533075+00', '2026-08-16 15:42:27.155756+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('13efc55b-4e05-487d-b1ca-87b414b7b07d', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '{"sub": "13efc55b-4e05-487d-b1ca-87b414b7b07d", "email": "test123@test.com", "email_verified": false, "phone_verified": false}', 'email', '2026-07-25 09:19:15.719735+00', '2026-07-25 09:19:15.719772+00', '2026-07-25 09:19:15.719772+00', '0b31ab9c-2e77-4089-a250-83afaaa2f77e'),
	('af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', '{"sub": "af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9", "email": "admin@adc.com", "email_verified": false, "phone_verified": false}', 'email', '2026-07-30 16:51:24.54437+00', '2026-07-30 16:51:24.544417+00', '2026-07-30 16:51:24.544417+00', '8c30c2c6-0879-4d0b-9c25-50c8447d2033'),
	('deda7590-e2a7-4553-8739-f313907f2169', 'deda7590-e2a7-4553-8739-f313907f2169', '{"sub": "deda7590-e2a7-4553-8739-f313907f2169", "email": "jhay@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-08-02 09:16:40.696133+00', '2026-08-02 09:16:40.696188+00', '2026-08-02 09:16:40.696188+00', '751e47dd-39a6-481f-92be-22eded91bc82'),
	('e558120a-6885-4f50-bcb3-a7276a9e0d69', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', '{"sub": "e558120a-6885-4f50-bcb3-a7276a9e0d69", "email": "chase@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-08-02 09:25:50.886277+00', '2026-08-02 09:25:50.886373+00', '2026-08-02 09:25:50.886373+00', '6582b024-625b-448b-a7a8-0653b13ca79d'),
	('1ac59301-a17a-4040-afa6-42f22fa8417f', '1ac59301-a17a-4040-afa6-42f22fa8417f', '{"sub": "1ac59301-a17a-4040-afa6-42f22fa8417f", "email": "rica@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-08-02 09:35:07.91054+00', '2026-08-02 09:35:07.910569+00', '2026-08-02 09:35:07.910569+00', '8edaff6e-a72a-4554-b6a1-619878ab8a35');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('4b37d8d9-6942-48dd-bcf1-6effb975eb28', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-25 09:19:45.978533+00', '2026-07-25 09:19:45.978533+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('bb877f39-6ad3-4c26-abea-681d62932b14', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-25 10:07:38.27173+00', '2026-07-25 10:07:38.27173+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('3df7aae1-bf3a-43b2-9892-dad7c3982584', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-25 10:11:02.810552+00', '2026-07-25 10:11:02.810552+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('67a27156-2d29-4a28-836b-2e2c4d61d080', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-25 10:16:33.734659+00', '2026-07-28 16:18:04.689485+00', NULL, 'aal1', NULL, '2026-07-28 16:18:04.689394', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('230dc225-0a33-429e-8680-44d1e907c245', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 16:39:15.479183+00', '2026-07-28 16:39:15.479183+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('e7c7cf90-fcf5-4837-ad86-847e5bc057e6', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 17:17:56.603967+00', '2026-07-28 17:17:56.603967+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('b26688a9-8bc6-4bfe-bc71-7d1db28f058e', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:03:01.187672+00', '2026-07-28 18:03:01.187672+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('d75d4f6f-4023-4937-b986-f2261e1cb37c', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:05:35.220568+00', '2026-07-28 18:05:35.220568+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('c69a442b-8795-4117-bda8-53b05600321e', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:05:44.408258+00', '2026-07-28 18:05:44.408258+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('e1d8e663-03bd-4164-b616-7f6eda558f1f', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:06:25.654442+00', '2026-07-28 18:06:25.654442+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('471194f1-2a05-493e-9ab7-621f1c9367c3', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:11:09.544271+00', '2026-07-28 18:11:09.544271+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('7eff4a05-5c6a-44bf-8218-a04e39d2625e', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:16:43.573928+00', '2026-07-28 18:16:43.573928+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('20525d8a-d331-4e77-a572-f05a1cff5619', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-28 18:45:46.955098+00', '2026-07-29 15:31:24.148399+00', NULL, 'aal1', NULL, '2026-07-29 15:31:24.148346', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('db469fff-057a-4c88-867d-72824844251d', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-29 15:31:24.165013+00', '2026-07-29 17:28:57.951233+00', NULL, 'aal1', NULL, '2026-07-29 17:28:57.951154', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('df89231c-85c6-44de-8622-4cfc014e20ed', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-29 17:28:57.952268+00', '2026-07-29 17:28:57.952268+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('9878c703-c7a4-48d5-b990-0fd7f4c01927', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-29 17:29:49.144076+00', '2026-07-29 17:29:49.144076+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('ccd075c6-b135-4b0a-b85d-95de0edf3361', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-29 17:35:53.806955+00', '2026-07-30 15:07:45.612536+00', NULL, 'aal1', NULL, '2026-07-30 15:07:45.612476', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('fdc3b4b9-23d8-402c-bfcf-196b4dec63eb', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-30 15:07:45.630854+00', '2026-07-30 15:07:45.630854+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('fe714a0d-26bd-4511-be8c-914229d0e2e1', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-30 15:30:48.836892+00', '2026-07-30 15:30:48.836892+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('acb6fe22-11ce-4834-b529-f28c0925d01a', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-30 16:08:15.771894+00', '2026-07-30 16:08:15.771894+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('7ebb976d-5698-465c-bc75-f4ce5c0a45a2', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-07-30 17:39:18.120666+00', '2026-08-02 07:33:00.184697+00', NULL, 'aal1', NULL, '2026-08-02 07:33:00.18463', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('ea417480-cce0-477b-a836-ec16df78ccb0', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-08-02 07:33:00.204956+00', '2026-08-02 08:37:27.847583+00', NULL, 'aal1', NULL, '2026-08-02 08:37:27.847513', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('94f0a5cb-098c-44da-9997-6cfcdae61b8e', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', '2026-08-16 14:44:25.7747+00', '2026-08-16 15:42:27.16142+00', NULL, 'aal1', NULL, '2026-08-16 15:42:27.161196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('ba6368d8-f8eb-4ec2-a230-f31aa1c93f6d', '1ac59301-a17a-4040-afa6-42f22fa8417f', '2026-08-04 05:03:18.950224+00', '2026-08-04 05:03:18.950224+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('372e7d32-314f-4ced-aa01-582506111c86', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', '2026-08-16 14:44:19.972921+00', '2026-08-16 15:42:27.168208+00', NULL, 'aal1', NULL, '2026-08-16 15:42:27.168113', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('4b37d8d9-6942-48dd-bcf1-6effb975eb28', '2026-07-25 09:19:45.985074+00', '2026-07-25 09:19:45.985074+00', 'password', '24ad5779-f597-497b-bf04-9d87659fb263'),
	('bb877f39-6ad3-4c26-abea-681d62932b14', '2026-07-25 10:07:38.281345+00', '2026-07-25 10:07:38.281345+00', 'password', '7888cb4f-2aa6-4a83-ac59-e7a05b4e0fa9'),
	('3df7aae1-bf3a-43b2-9892-dad7c3982584', '2026-07-25 10:11:02.816509+00', '2026-07-25 10:11:02.816509+00', 'password', 'eaff2a82-cbcb-4838-92e7-5305095307ff'),
	('67a27156-2d29-4a28-836b-2e2c4d61d080', '2026-07-25 10:16:33.739589+00', '2026-07-25 10:16:33.739589+00', 'password', '4aa1cf80-25d1-4b9f-a13c-4b832035c251'),
	('230dc225-0a33-429e-8680-44d1e907c245', '2026-07-28 16:39:15.484447+00', '2026-07-28 16:39:15.484447+00', 'password', 'a0131f9b-3146-4fe0-a6f8-a34112cb068f'),
	('e7c7cf90-fcf5-4837-ad86-847e5bc057e6', '2026-07-28 17:17:56.613444+00', '2026-07-28 17:17:56.613444+00', 'password', '891342a4-8ac7-468d-8650-8ba6067fe4c2'),
	('b26688a9-8bc6-4bfe-bc71-7d1db28f058e', '2026-07-28 18:03:01.196653+00', '2026-07-28 18:03:01.196653+00', 'password', '1acea5e1-874b-405b-9828-b7d078b95a16'),
	('d75d4f6f-4023-4937-b986-f2261e1cb37c', '2026-07-28 18:05:35.226864+00', '2026-07-28 18:05:35.226864+00', 'password', 'c0b5823b-a1a2-4422-b7f9-4fe56b85a807'),
	('c69a442b-8795-4117-bda8-53b05600321e', '2026-07-28 18:05:44.412583+00', '2026-07-28 18:05:44.412583+00', 'password', 'cb202682-37d6-4d1b-b96b-d8b2ddd52211'),
	('e1d8e663-03bd-4164-b616-7f6eda558f1f', '2026-07-28 18:06:25.659078+00', '2026-07-28 18:06:25.659078+00', 'password', '8d05dc74-04ca-45d6-b5a8-be3f8ec5052c'),
	('471194f1-2a05-493e-9ab7-621f1c9367c3', '2026-07-28 18:11:09.549176+00', '2026-07-28 18:11:09.549176+00', 'password', '069f08cb-5767-4f29-bf53-7dbae1ba6496'),
	('7eff4a05-5c6a-44bf-8218-a04e39d2625e', '2026-07-28 18:16:43.578996+00', '2026-07-28 18:16:43.578996+00', 'password', 'ab250008-1b8b-4f22-872b-2d2f29aa219e'),
	('20525d8a-d331-4e77-a572-f05a1cff5619', '2026-07-28 18:45:46.96138+00', '2026-07-28 18:45:46.96138+00', 'password', '41d16cab-b46c-4256-b503-940ffc9e363f'),
	('db469fff-057a-4c88-867d-72824844251d', '2026-07-29 15:31:24.169642+00', '2026-07-29 15:31:24.169642+00', 'password', '812e2573-7321-4528-9583-01d0d099c45a'),
	('df89231c-85c6-44de-8622-4cfc014e20ed', '2026-07-29 17:28:57.956874+00', '2026-07-29 17:28:57.956874+00', 'password', '7a95c774-65a5-48b9-8dcd-c943b76c5bb6'),
	('9878c703-c7a4-48d5-b990-0fd7f4c01927', '2026-07-29 17:29:49.148621+00', '2026-07-29 17:29:49.148621+00', 'password', '807f1f24-f332-48f9-9017-44f6ec4ed954'),
	('ccd075c6-b135-4b0a-b85d-95de0edf3361', '2026-07-29 17:35:53.81215+00', '2026-07-29 17:35:53.81215+00', 'password', '963073d3-b62d-4bc8-bad8-3b8e77389dec'),
	('fdc3b4b9-23d8-402c-bfcf-196b4dec63eb', '2026-07-30 15:07:45.634973+00', '2026-07-30 15:07:45.634973+00', 'password', 'be06249f-c1ac-44f1-83dd-8d92b2eade89'),
	('fe714a0d-26bd-4511-be8c-914229d0e2e1', '2026-07-30 15:30:48.841274+00', '2026-07-30 15:30:48.841274+00', 'password', '4609b68a-8845-4974-af4a-d9c2c78e8be3'),
	('acb6fe22-11ce-4834-b529-f28c0925d01a', '2026-07-30 16:08:15.780267+00', '2026-07-30 16:08:15.780267+00', 'password', '475a75c4-302e-498b-8c80-c1c78d640e6f'),
	('7ebb976d-5698-465c-bc75-f4ce5c0a45a2', '2026-07-30 17:39:18.125369+00', '2026-07-30 17:39:18.125369+00', 'password', '045a7fc9-de1f-4c9d-a3b3-2394f40208a8'),
	('ea417480-cce0-477b-a836-ec16df78ccb0', '2026-08-02 07:33:00.208815+00', '2026-08-02 07:33:00.208815+00', 'password', '47aaebe0-b907-473a-b594-24c43301569d'),
	('ba6368d8-f8eb-4ec2-a230-f31aa1c93f6d', '2026-08-04 05:03:18.953902+00', '2026-08-04 05:03:18.953902+00', 'password', '0a9b79ad-14d0-4e61-a58b-f5e2835354c8'),
	('372e7d32-314f-4ced-aa01-582506111c86', '2026-08-16 14:44:19.977611+00', '2026-08-16 14:44:19.977611+00', 'password', 'a6a57af3-0b75-4d9b-8e1d-d970de631555'),
	('94f0a5cb-098c-44da-9997-6cfcdae61b8e', '2026-08-16 14:44:25.778972+00', '2026-08-16 14:44:25.778972+00', 'password', '5f2fff76-3361-4ca1-9d33-ab7826e151bd');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 5, '6poolx2sted5', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-25 09:19:45.981509+00', '2026-07-25 09:19:45.981509+00', NULL, '4b37d8d9-6942-48dd-bcf1-6effb975eb28'),
	('00000000-0000-0000-0000-000000000000', 6, 's3wsihi656sj', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-25 10:07:38.276429+00', '2026-07-25 10:07:38.276429+00', NULL, 'bb877f39-6ad3-4c26-abea-681d62932b14'),
	('00000000-0000-0000-0000-000000000000', 7, 'enmkxlotnb3o', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-25 10:11:02.813668+00', '2026-07-25 10:11:02.813668+00', NULL, '3df7aae1-bf3a-43b2-9892-dad7c3982584'),
	('00000000-0000-0000-0000-000000000000', 8, 'rjdmhassenvw', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-07-25 10:16:33.736896+00', '2026-07-28 16:18:04.68091+00', NULL, '67a27156-2d29-4a28-836b-2e2c4d61d080'),
	('00000000-0000-0000-0000-000000000000', 9, 'exyjenbzm3bv', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 16:18:04.682334+00', '2026-07-28 16:18:04.682334+00', 'rjdmhassenvw', '67a27156-2d29-4a28-836b-2e2c4d61d080'),
	('00000000-0000-0000-0000-000000000000', 10, 'yap2oic4u7u5', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 16:39:15.48198+00', '2026-07-28 16:39:15.48198+00', NULL, '230dc225-0a33-429e-8680-44d1e907c245'),
	('00000000-0000-0000-0000-000000000000', 11, '4qajfoeuj2nk', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 17:17:56.608565+00', '2026-07-28 17:17:56.608565+00', NULL, 'e7c7cf90-fcf5-4837-ad86-847e5bc057e6'),
	('00000000-0000-0000-0000-000000000000', 12, 'oj3g6u7q5aqe', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:03:01.192216+00', '2026-07-28 18:03:01.192216+00', NULL, 'b26688a9-8bc6-4bfe-bc71-7d1db28f058e'),
	('00000000-0000-0000-0000-000000000000', 13, 'q4k4ujz5o5zz', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:05:35.223793+00', '2026-07-28 18:05:35.223793+00', NULL, 'd75d4f6f-4023-4937-b986-f2261e1cb37c'),
	('00000000-0000-0000-0000-000000000000', 14, 'kktoplreyd3x', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:05:44.410597+00', '2026-07-28 18:05:44.410597+00', NULL, 'c69a442b-8795-4117-bda8-53b05600321e'),
	('00000000-0000-0000-0000-000000000000', 15, 'u5qmi2s76qhw', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:06:25.65689+00', '2026-07-28 18:06:25.65689+00', NULL, 'e1d8e663-03bd-4164-b616-7f6eda558f1f'),
	('00000000-0000-0000-0000-000000000000', 16, 'wytus7u4xnqj', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:11:09.546753+00', '2026-07-28 18:11:09.546753+00', NULL, '471194f1-2a05-493e-9ab7-621f1c9367c3'),
	('00000000-0000-0000-0000-000000000000', 17, 'mzxpmocjbbl6', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-28 18:16:43.576624+00', '2026-07-28 18:16:43.576624+00', NULL, '7eff4a05-5c6a-44bf-8218-a04e39d2625e'),
	('00000000-0000-0000-0000-000000000000', 18, 'yqwialit6s3r', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-07-28 18:45:46.958719+00', '2026-07-29 15:31:24.142772+00', NULL, '20525d8a-d331-4e77-a572-f05a1cff5619'),
	('00000000-0000-0000-0000-000000000000', 51, 'ycwe3kcch2o7', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-29 15:31:24.143938+00', '2026-07-29 15:31:24.143938+00', 'yqwialit6s3r', '20525d8a-d331-4e77-a572-f05a1cff5619'),
	('00000000-0000-0000-0000-000000000000', 52, 'htg6wzq4f5vv', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-07-29 15:31:24.167155+00', '2026-07-29 17:28:57.937302+00', NULL, 'db469fff-057a-4c88-867d-72824844251d'),
	('00000000-0000-0000-0000-000000000000', 53, '4aw5dzamt7su', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-29 17:28:57.939613+00', '2026-07-29 17:28:57.939613+00', 'htg6wzq4f5vv', 'db469fff-057a-4c88-867d-72824844251d'),
	('00000000-0000-0000-0000-000000000000', 54, 'cgosrxdbkd22', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-29 17:28:57.954897+00', '2026-07-29 17:28:57.954897+00', NULL, 'df89231c-85c6-44de-8622-4cfc014e20ed'),
	('00000000-0000-0000-0000-000000000000', 55, '3jhiihz52bco', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-29 17:29:49.146326+00', '2026-07-29 17:29:49.146326+00', NULL, '9878c703-c7a4-48d5-b990-0fd7f4c01927'),
	('00000000-0000-0000-0000-000000000000', 56, 'jyx7lar42kul', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-07-29 17:35:53.809229+00', '2026-07-30 15:07:45.6085+00', NULL, 'ccd075c6-b135-4b0a-b85d-95de0edf3361'),
	('00000000-0000-0000-0000-000000000000', 57, '7ivg5mqc6r3w', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-30 15:07:45.609211+00', '2026-07-30 15:07:45.609211+00', 'jyx7lar42kul', 'ccd075c6-b135-4b0a-b85d-95de0edf3361'),
	('00000000-0000-0000-0000-000000000000', 58, 'frvltlakvdeb', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-30 15:07:45.6329+00', '2026-07-30 15:07:45.6329+00', NULL, 'fdc3b4b9-23d8-402c-bfcf-196b4dec63eb'),
	('00000000-0000-0000-0000-000000000000', 59, '7r6fuxici4kw', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-30 15:30:48.839183+00', '2026-07-30 15:30:48.839183+00', NULL, 'fe714a0d-26bd-4511-be8c-914229d0e2e1'),
	('00000000-0000-0000-0000-000000000000', 60, '77jbrcpitnsc', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-07-30 16:08:15.776001+00', '2026-07-30 16:08:15.776001+00', NULL, 'acb6fe22-11ce-4834-b529-f28c0925d01a'),
	('00000000-0000-0000-0000-000000000000', 63, 'm5gyr5cfx4xn', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-07-30 17:39:18.122582+00', '2026-08-02 07:33:00.178766+00', NULL, '7ebb976d-5698-465c-bc75-f4ce5c0a45a2'),
	('00000000-0000-0000-0000-000000000000', 64, 'lxpiqnnfttzm', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-08-02 07:33:00.179524+00', '2026-08-02 07:33:00.179524+00', 'm5gyr5cfx4xn', '7ebb976d-5698-465c-bc75-f4ce5c0a45a2'),
	('00000000-0000-0000-0000-000000000000', 65, 'fo3fj4zbwep7', '13efc55b-4e05-487d-b1ca-87b414b7b07d', true, '2026-08-02 07:33:00.206916+00', '2026-08-02 08:37:27.748118+00', NULL, 'ea417480-cce0-477b-a836-ec16df78ccb0'),
	('00000000-0000-0000-0000-000000000000', 66, '2wzjecjzlc65', '13efc55b-4e05-487d-b1ca-87b414b7b07d', false, '2026-08-02 08:37:27.750743+00', '2026-08-02 08:37:27.750743+00', 'fo3fj4zbwep7', 'ea417480-cce0-477b-a836-ec16df78ccb0'),
	('00000000-0000-0000-0000-000000000000', 101, 'bkm7hsvygsr5', '1ac59301-a17a-4040-afa6-42f22fa8417f', false, '2026-08-04 05:03:18.952042+00', '2026-08-04 05:03:18.952042+00', NULL, 'ba6368d8-f8eb-4ec2-a230-f31aa1c93f6d'),
	('00000000-0000-0000-0000-000000000000', 108, 'amucuvh6xvnq', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', true, '2026-08-16 14:44:25.776871+00', '2026-08-16 15:42:27.148978+00', NULL, '94f0a5cb-098c-44da-9997-6cfcdae61b8e'),
	('00000000-0000-0000-0000-000000000000', 109, '7szqajnylpi5', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', false, '2026-08-16 15:42:27.153201+00', '2026-08-16 15:42:27.153201+00', 'amucuvh6xvnq', '94f0a5cb-098c-44da-9997-6cfcdae61b8e'),
	('00000000-0000-0000-0000-000000000000', 107, 'yckpipxsrnfj', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', true, '2026-08-16 14:44:19.97539+00', '2026-08-16 15:42:27.15954+00', NULL, '372e7d32-314f-4ced-aa01-582506111c86'),
	('00000000-0000-0000-0000-000000000000', 110, 'nfjfhnbs2qxw', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', false, '2026-08-16 15:42:27.161957+00', '2026-08-16 15:42:27.161957+00', 'yckpipxsrnfj', '372e7d32-314f-4ced-aa01-582506111c86');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."loans" ("id", "user_id", "device_name", "device_image", "total_amount", "remaining_balance", "monthly_payment", "next_payment_date", "status", "created_at") VALUES
	('c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', 'iPhone 16', '../../images/phones/Iphone_16.png', 54990, 54990, 2350, '2026-09-16', 'active', '2026-08-16 14:55:45.826402+00'),
	('72808fd2-1a73-40d6-82c5-90b74fdced21', 'deda7590-e2a7-4553-8739-f313907f2169', 'iPhone 16', '../../images/phones/Iphone_16.png', 54990, 54990, 2350, '2026-09-16', 'active', '2026-08-16 15:02:04.245355+00');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payments" ("id", "loan_id", "amount_paid", "payment_date") VALUES
	('bd3a03ff-6b7f-4f5b-9663-621fcdb1e8ad', 'c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b', 7082.5, '2026-08-16 15:03:30.692839+00'),
	('e8405f8f-0646-4035-bdc0-5c039edd7747', 'c0cc9a4f-4db9-49d5-b2bc-5c949e1c522b', 7082.5, '2026-08-16 15:04:53.810541+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "mobile", "address", "id_type", "id_url", "active_loan_model", "status", "created_at", "role", "email") VALUES
	('13efc55b-4e05-487d-b1ca-87b414b7b07d', 'test123@test.com', '—', '—', 'None', '', 'None', 'Active', '2026-08-02 08:51:58.792138+00', 'user', NULL),
	('af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'admin@adc.com', '—', '—', 'None', '', 'None', 'Active', '2026-08-02 08:51:58.792138+00', 'admin', 'admin@adc.com'),
	('e558120a-6885-4f50-bcb3-a7276a9e0d69', 'Jhay Castro', '09156834626', 'Kay Talise', 'National ID', 'http://127.0.0.1:54321/storage/v1/object/public/valid_ids/1785662750776_co98dm.png', 'iPhone 16', 'Active', '2026-08-02 09:25:50.907575+00', 'user', 'chase@gmail.com'),
	('1ac59301-a17a-4040-afa6-42f22fa8417f', 'rica mhay', '091321324567', 'Kay Talise', 'Driver''s License', 'http://127.0.0.1:54321/storage/v1/object/public/valid_ids/1785663307796_s5kphc.png', 'iPhone 16', 'Active', '2026-08-02 09:35:07.93169+00', 'user', 'rica@gmail.com');


--
-- Data for Name: support_chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."support_chats" ("id", "user_id", "sender_role", "message", "is_read", "created_at") VALUES
	('a05b2d61-7cb7-4867-bab2-e344377d7f51', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'user', 'hi', true, '2026-08-16 14:11:42.47+00'),
	('fed1aa08-c033-497e-8397-40f9e30d0f80', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'user', 'hi', true, '2026-08-16 14:17:22.243772+00'),
	('76dc32b6-9d1a-4710-a9c4-eef8590c7a97', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'admin', 'hello', true, '2026-08-16 14:36:27.335816+00'),
	('29dbe6fc-c137-4e1e-8b36-021c6f2c31cf', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', 'admin', 'HELLO', false, '2026-08-16 15:51:02.234699+00'),
	('353e7898-55d3-40a6-ab2b-03b4aeebddf0', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', 'user', 'HELLO', true, '2026-08-16 15:51:19.218267+00'),
	('21bee397-1273-4e36-94bd-9fea06b17a31', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', 'admin', 'HI', false, '2026-08-16 15:51:28.180513+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('valid_ids', 'valid_ids', NULL, '2026-08-02 08:47:10.907202+00', '2026-08-02 08:47:10.907202+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('7816f549-5f71-48f1-8f9e-71728a3169e3', 'valid_ids', '1785662200503_1exf4r.png', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-08-02 09:16:40.561164+00', '2026-08-02 09:16:40.561164+00', '2026-08-02 09:16:40.561164+00', '{"eTag": "\"12b8f7a6de4d5fa5b283d09e28c82871\"", "size": 279895, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-02T09:16:40.550Z", "contentLength": 279895, "httpStatusCode": 200}', '3ff91623-1e90-4a85-a669-61c8b704186e', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '{}'),
	('e2e49213-ca60-47bd-ae84-9d6b5417c1f0', 'valid_ids', '1785662735446_isd4o.png', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-08-02 09:25:35.468032+00', '2026-08-02 09:25:35.468032+00', '2026-08-02 09:25:35.468032+00', '{"eTag": "\"12b8f7a6de4d5fa5b283d09e28c82871\"", "size": 279895, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-02T09:25:35.460Z", "contentLength": 279895, "httpStatusCode": 200}', '203b6dd8-cc0c-4cc1-8cf3-e4e0a745b8eb', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '{}'),
	('5d61fe04-cc41-4d1b-ab93-f2ce772a978a', 'valid_ids', '1785662750776_co98dm.png', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '2026-08-02 09:25:50.795333+00', '2026-08-02 09:25:50.795333+00', '2026-08-02 09:25:50.795333+00', '{"eTag": "\"12b8f7a6de4d5fa5b283d09e28c82871\"", "size": 279895, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-02T09:25:50.788Z", "contentLength": 279895, "httpStatusCode": 200}', 'c0e6a1ac-e33a-4bea-88b3-74ddf350522e', '13efc55b-4e05-487d-b1ca-87b414b7b07d', '{}'),
	('aa6c32af-f322-485a-9ca7-56395faedc41', 'valid_ids', '1785663307796_s5kphc.png', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', '2026-08-02 09:35:07.812352+00', '2026-08-02 09:35:07.812352+00', '2026-08-02 09:35:07.812352+00', '{"eTag": "\"c9bf5d7571123d412dbeb0a6ec986408\"", "size": 80137, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-02T09:35:07.808Z", "contentLength": 80137, "httpStatusCode": 200}', '284b96dc-37d7-4010-9199-57b223249ea9', 'e558120a-6885-4f50-bcb3-a7276a9e0d69', '{}'),
	('f7f230a1-7747-43ac-94b1-fec77fd1031c', 'valid_ids', '1785688997446_4m5b4c.png', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', '2026-08-02 16:43:17.506731+00', '2026-08-02 16:43:17.506731+00', '2026-08-02 16:43:17.506731+00', '{"eTag": "\"12b8f7a6de4d5fa5b283d09e28c82871\"", "size": 279895, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-02T16:43:17.493Z", "contentLength": 279895, "httpStatusCode": 200}', '584f94aa-81aa-495d-808f-602fb0e13d9e', 'af8b19b4-c357-42fd-b8e2-0fb5e31a1cc9', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 110, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict VGqaupGx6BMeAKzV3Et4ylG2LUb2rIEf4f6Qu2vHXVw11HYmz5QdsRo3STJ7aTq

RESET ALL;
