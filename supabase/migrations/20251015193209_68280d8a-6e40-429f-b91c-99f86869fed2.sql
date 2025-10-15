-- Create site_settings table for global site content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'html', 'image', 'json')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on key for fast lookups
CREATE INDEX idx_site_settings_key ON public.site_settings(key);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create homepage_blocks table for managing featured content
CREATE TABLE public.homepage_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  excerpt TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('auto', 'manual')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for ordering
CREATE INDEX idx_homepage_blocks_order ON public.homepage_blocks(order_index) WHERE enabled = true;

-- Enable RLS
ALTER TABLE public.homepage_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_blocks
CREATE POLICY "Homepage blocks are viewable by everyone"
  ON public.homepage_blocks
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert homepage blocks"
  ON public.homepage_blocks
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update homepage blocks"
  ON public.homepage_blocks
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete homepage blocks"
  ON public.homepage_blocks
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updating updated_at on homepage_blocks
CREATE TRIGGER update_homepage_blocks_updated_at
  BEFORE UPDATE ON public.homepage_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updating updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (key, value, type) VALUES
  ('site_title', '"Manga Reader"', 'text'),
  ('site_tagline', '"Your source for quality manga translations"', 'text'),
  ('site_favicon', '"/favicon.ico"', 'image'),
  ('home_hero_title', '"Discover Amazing Manga"', 'html'),
  ('home_hero_subtitle', '"Read the latest chapters of your favorite series"', 'html'),
  ('footer_text', '"© 2024 Manga Reader. All rights reserved."', 'html'),
  ('about_page_body', '"<h2>Our Story</h2><p>We are passionate about bringing quality manga translations to readers worldwide.</p>"', 'html'),
  ('meta_description', '"Read manga online with high-quality translations and regular updates"', 'text')
ON CONFLICT (key) DO NOTHING;