-- Use fixed-width 6-digit numeric identifiers for users.
ALTER SEQUENCE public.user_number_seq RESTART WITH 300000;

ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_user_number_format;

UPDATE public.profiles
SET user_number = nextval('public.user_number_seq');

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_number_format
    CHECK (user_number BETWEEN 100000 AND 999999);
