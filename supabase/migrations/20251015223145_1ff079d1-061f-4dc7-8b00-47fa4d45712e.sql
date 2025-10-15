-- Fix Security Definer Views by recreating them with SECURITY INVOKER
-- This ensures views respect RLS policies of the querying user, not the view creator

-- Drop and recreate chapter_ratings_summary with SECURITY INVOKER
DROP VIEW IF EXISTS public.chapter_ratings_summary;

CREATE VIEW public.chapter_ratings_summary
WITH (security_invoker=on)
AS
SELECT 
    chapter_id,
    count(*) AS total_ratings,
    avg(rating) AS average_rating,
    count(CASE WHEN rating = 5 THEN 1 ELSE NULL::integer END) AS five_star,
    count(CASE WHEN rating = 4 THEN 1 ELSE NULL::integer END) AS four_star,
    count(CASE WHEN rating = 3 THEN 1 ELSE NULL::integer END) AS three_star,
    count(CASE WHEN rating = 2 THEN 1 ELSE NULL::integer END) AS two_star,
    count(CASE WHEN rating = 1 THEN 1 ELSE NULL::integer END) AS one_star
FROM chapter_ratings
GROUP BY chapter_id;

-- Drop and recreate chapter_reactions_summary with SECURITY INVOKER
DROP VIEW IF EXISTS public.chapter_reactions_summary;

CREATE VIEW public.chapter_reactions_summary
WITH (security_invoker=on)
AS
SELECT 
    chapter_id,
    emoji,
    count(*) AS reaction_count
FROM chapter_reactions
GROUP BY chapter_id, emoji;

-- Drop and recreate series_ratings_summary with SECURITY INVOKER
DROP VIEW IF EXISTS public.series_ratings_summary;

CREATE VIEW public.series_ratings_summary
WITH (security_invoker=on)
AS
SELECT 
    series_id,
    count(*) AS total_ratings,
    avg(rating) AS average_rating,
    count(CASE WHEN rating = 5 THEN 1 ELSE NULL::integer END) AS five_star,
    count(CASE WHEN rating = 4 THEN 1 ELSE NULL::integer END) AS four_star,
    count(CASE WHEN rating = 3 THEN 1 ELSE NULL::integer END) AS three_star,
    count(CASE WHEN rating = 2 THEN 1 ELSE NULL::integer END) AS two_star,
    count(CASE WHEN rating = 1 THEN 1 ELSE NULL::integer END) AS one_star
FROM series_ratings
GROUP BY series_id;

-- Drop and recreate public_site_settings with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_site_settings;

CREATE VIEW public.public_site_settings
WITH (security_invoker=on)
AS
SELECT 
    key,
    value,
    type
FROM site_settings
WHERE key = ANY (ARRAY[
    'nav_site_name'::text, 
    'home_hero_title'::text, 
    'home_hero_subtitle'::text, 
    'home_hero_badge'::text, 
    'home_hero_button_text'::text, 
    'home_hero_image'::text, 
    'home_about_title'::text, 
    'home_about_text'::text, 
    'home_about_button_text'::text, 
    'latest_releases_title'::text, 
    'series_page_title'::text, 
    'series_page_subtitle'::text, 
    'authors_page_title'::text, 
    'authors_page_subtitle'::text, 
    'merchandise_page_title'::text, 
    'merchandise_page_subtitle'::text
]);