-- Drop the unused homepage_blocks_admin view as it cannot be secured with RLS
-- The homepage_blocks table itself already has proper RLS policies for admin access
DROP VIEW IF EXISTS public.homepage_blocks_admin;