-- Create a function to update the last_updated column for site_settings
CREATE OR REPLACE FUNCTION public.update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for site_settings table
CREATE TRIGGER update_site_settings_last_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_settings_timestamp();