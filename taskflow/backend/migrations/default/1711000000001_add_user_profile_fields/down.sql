ALTER TABLE public.users
  DROP COLUMN IF EXISTS timezone,
  DROP COLUMN IF EXISTS company,
  DROP COLUMN IF EXISTS profile_role,
  DROP COLUMN IF EXISTS username;
