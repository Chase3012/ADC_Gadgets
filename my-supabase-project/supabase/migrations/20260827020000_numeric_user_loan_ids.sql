-- Add human-readable numeric identifiers while preserving UUID relationships.
CREATE SEQUENCE IF NOT EXISTS public.user_number_seq;
CREATE SEQUENCE IF NOT EXISTS public.loan_number_seq;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS user_number BIGINT;

ALTER TABLE public.loans
    ADD COLUMN IF NOT EXISTS loan_number BIGINT;

SELECT setval(
    'public.user_number_seq',
    COALESCE((SELECT MAX(user_number) FROM public.profiles), 0) + 1,
    false
);

SELECT setval(
    'public.loan_number_seq',
    COALESCE((SELECT MAX(loan_number) FROM public.loans), 0) + 1,
    false
);

ALTER TABLE public.profiles
    ALTER COLUMN user_number SET DEFAULT nextval('public.user_number_seq');

ALTER TABLE public.loans
    ALTER COLUMN loan_number SET DEFAULT nextval('public.loan_number_seq');

UPDATE public.profiles
SET user_number = nextval('public.user_number_seq')
WHERE user_number IS NULL;

UPDATE public.loans
SET loan_number = nextval('public.loan_number_seq')
WHERE loan_number IS NULL;

ALTER TABLE public.profiles
    ALTER COLUMN user_number SET NOT NULL;

ALTER TABLE public.loans
    ALTER COLUMN loan_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_number_key
    ON public.profiles(user_number);

CREATE UNIQUE INDEX IF NOT EXISTS loans_loan_number_key
    ON public.loans(loan_number);
