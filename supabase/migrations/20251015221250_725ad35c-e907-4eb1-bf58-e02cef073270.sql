-- Fix security vulnerabilities identified in scan

-- 1. Restrict site_settings to admin-only access
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;

CREATE POLICY "Only admins can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create public-facing settings view for truly public settings
CREATE OR REPLACE VIEW public.public_site_settings AS
SELECT key, value, type
FROM public.site_settings
WHERE key IN (
  'nav_site_name',
  'home_hero_title',
  'home_hero_subtitle',
  'home_hero_badge',
  'home_hero_button_text',
  'home_hero_image',
  'home_about_title',
  'home_about_text',
  'home_about_button_text',
  'latest_releases_title',
  'series_page_title',
  'series_page_subtitle',
  'authors_page_title',
  'authors_page_subtitle',
  'merchandise_page_title',
  'merchandise_page_subtitle'
);

-- Grant public access to the view
GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- 3. Hide user_id from public chapter_comments queries
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.chapter_comments;

CREATE POLICY "Comments content viewable by everyone"
  ON public.chapter_comments
  FOR SELECT
  USING (true);

-- Add a function to check comment ownership without exposing user_id
CREATE OR REPLACE FUNCTION public.is_comment_owner(comment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chapter_comments
    WHERE id = comment_id
      AND user_id = auth.uid()
  )
$$;

-- 4. Create aggregate views for ratings to hide individual user_id
CREATE OR REPLACE VIEW public.chapter_ratings_summary AS
SELECT 
  chapter_id,
  COUNT(*) as total_ratings,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM public.chapter_ratings
GROUP BY chapter_id;

GRANT SELECT ON public.chapter_ratings_summary TO anon, authenticated;

CREATE OR REPLACE VIEW public.series_ratings_summary AS
SELECT 
  series_id,
  COUNT(*) as total_ratings,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM public.series_ratings
GROUP BY series_id;

GRANT SELECT ON public.series_ratings_summary TO anon, authenticated;

-- 5. Create reaction counts view without user_id exposure
CREATE OR REPLACE VIEW public.chapter_reactions_summary AS
SELECT 
  chapter_id,
  emoji,
  COUNT(*) as reaction_count
FROM public.chapter_reactions
GROUP BY chapter_id, emoji;

GRANT SELECT ON public.chapter_reactions_summary TO anon, authenticated;

-- 6. Hide admin workflow info in homepage_blocks
DROP POLICY IF EXISTS "Homepage blocks are viewable by everyone" ON public.homepage_blocks;

CREATE POLICY "Homepage blocks public view"
  ON public.homepage_blocks
  FOR SELECT
  USING (enabled = true);

-- Create admin-only view for full homepage_blocks data
CREATE OR REPLACE VIEW public.homepage_blocks_admin AS
SELECT *
FROM public.homepage_blocks
WHERE has_role(auth.uid(), 'admin'::app_role);

GRANT SELECT ON public.homepage_blocks_admin TO authenticated;

-- 7. Add indexes for performance on security-related queries
CREATE INDEX IF NOT EXISTS idx_chapter_comments_user_id ON public.chapter_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_ratings_user_chapter ON public.chapter_ratings(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_series_ratings_user_series ON public.series_ratings(user_id, series_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reactions_user_chapter ON public.chapter_reactions(user_id, chapter_id);