-- Use fixed-width 12-digit numeric identifiers for users.
ALTER SEQUENCE public.user_number_seq RESTART WITH 200000000000;

UPDATE public.profiles
SET user_number = nextval('public.user_number_seq');

ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_user_number_format;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_number_format
    CHECK (user_number BETWEEN 100000000000 AND 999999999999);
