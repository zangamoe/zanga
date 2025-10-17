-- Fix the public_site_settings view to not be SECURITY DEFINER
-- This view should be a simple filtering view without elevated permissions

DROP VIEW IF EXISTS public_site_settings CASCADE;

CREATE VIEW public_site_settings 
WITH (security_invoker = true)
AS
SELECT key, value, type
FROM site_settings
WHERE key IN (
  'nav_site_name',
  'footer_text',
  'home_hero_image',
  'home_hero_badge',
  'home_hero_title',
  'home_hero_subtitle',
  'home_hero_button_text',
  'home_about_title',
  'home_about_text',
  'home_about_button_text',
  'latest_releases_title',
  'about_title',
  'about_intro_1',
  'about_intro_2',
  'about_mission_title',
  'about_mission_text',
  'about_community_title',
  'about_community_text',
  'about_quality_title',
  'about_quality_text',
  'about_passion_title',
  'about_passion_text',
  'about_support_title',
  'about_support_text',
  'about_kofi_url',
  'about_patreon_url',
  'about_disclaimer',
  'discord_title',
  'discord_subtitle',
  'discord_url',
  'discord_feature1_title',
  'discord_feature1_text',
  'discord_feature2_title',
  'discord_feature2_text',
  'discord_feature3_title',
  'discord_feature3_text',
  'discord_cta_text'
);

-- Since this view references site_settings which has RLS enabled,
-- we need to add a policy to allow public read access to these specific keys
CREATE POLICY "Public site settings are viewable by everyone"
ON site_settings
FOR SELECT
TO anon, authenticated
USING (
  key IN (
    'nav_site_name',
    'footer_text',
    'home_hero_image',
    'home_hero_badge',
    'home_hero_title',
    'home_hero_subtitle',
    'home_hero_button_text',
    'home_about_title',
    'home_about_text',
    'home_about_button_text',
    'latest_releases_title',
    'about_title',
    'about_intro_1',
    'about_intro_2',
    'about_mission_title',
    'about_mission_text',
    'about_community_title',
    'about_community_text',
    'about_quality_title',
    'about_quality_text',
    'about_passion_title',
    'about_passion_text',
    'about_support_title',
    'about_support_text',
    'about_kofi_url',
    'about_patreon_url',
    'about_disclaimer',
    'discord_title',
    'discord_subtitle',
    'discord_url',
    'discord_feature1_title',
    'discord_feature1_text',
    'discord_feature2_title',
    'discord_feature2_text',
    'discord_feature3_title',
    'discord_feature3_text',
    'discord_cta_text'
  )
);