BEGIN;

-- Keep the existing account-scoped policies effective after the public-schema
-- default grants; UserRewards remains legacy and is not exposed by the API.
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

COMMIT;
