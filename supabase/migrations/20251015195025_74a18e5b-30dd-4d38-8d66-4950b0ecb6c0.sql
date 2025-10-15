-- First, drop any existing triggers on site_settings that might be causing conflicts
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
DROP TRIGGER IF EXISTS update_site_settings_last_updated ON public.site_settings;

-- Ensure the correct trigger function exists
CREATE OR REPLACE FUNCTION public.update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create the trigger for site_settings
CREATE TRIGGER update_site_settings_timestamp_trigger
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_settings_timestamp();