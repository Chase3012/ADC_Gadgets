-- Use fixed-width 12-digit numeric identifiers for loans.
ALTER SEQUENCE public.loan_number_seq RESTART WITH 100000000000;

UPDATE public.loans
SET loan_number = nextval('public.loan_number_seq');

ALTER TABLE public.loans
    DROP CONSTRAINT IF EXISTS loans_loan_number_format;

ALTER TABLE public.loans
    ADD CONSTRAINT loans_loan_number_format
    CHECK (loan_number BETWEEN 100000000000 AND 999999999999);
